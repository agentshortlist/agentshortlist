---
title: "Five read-only settings shrank an MCP tool list. Two did nothing."
seo_title: "Five MCP read-only flags shrink the tool list"
description: We started seven MCP servers with and without a read-only or safe-mode setting. Five lists shrank by 9 to 40 tools. Two did not change, so a client cannot see the setting.
date: 2026-11-10
tags: testing, read-only, tool-lists
---

A read-only or safe-mode setting is a promise about what a server will do. The tool list is what the server tells a client about itself. Those are not the same thing, and sometimes the setting does not show up in the list at all.

We started seven servers in Docker with and without such a setting and compared what each returned for `tools/list`. Five lists got shorter. Two did not change.

![Tools listed by default and with a setting applied: Atlassian 98 and 58, Grafana 79 and 62, GitHub 46 and 27, Supabase 31 and 19, MongoDB 27 and 18, Blender 9 and 9, ClickHouse 3 and 3.](/blog/flags-and-tool-lists.svg "1200x675")

## What we ran

Between 25 October and 5 November 2026 we started each server in Docker with no real credentials. Where a server needs a value to start, we passed an obviously fake one and no service was running behind it. We called no tools. The records are on each card under "Tested by us", with the exact start command.

| Server | Setting | Default | With the setting | What left the list |
| --- | --- | --- | --- | --- |
| [Atlassian](/agents/mcp-atlassian#verified) 0.23.1 | `READ_ONLY_MODE=true` | 98 | 58 | 40 names: 25 Jira tools (such as `jira_create_issue`, `jira_delete_issue`, `jira_transition_issue`) and 15 Confluence tools (such as `confluence_create_page`, `confluence_delete_page`) |
| [Grafana](/agents/grafana-mcp-server#verified) 2.1.1 | `--disable-write` | 79 | 62 | 17 names that create, update or delete (for example `create_datasource`, `update_dashboard`, `delete_annotation`, `install_plugin`) |
| [GitHub](/agents/github-mcp-server#verified) 2.1.0 | `--read-only` | 46 | 27 | 19 names (for example `create_pull_request`, `merge_pull_request`, `push_files`, `delete_file`, `issue_write`) |
| [Supabase](/agents/supabase-mcp#verified) 0.15.0 | `--read-only` | 31 | 19 | 12 names (for example `apply_migration`, `create_project`, `deploy_edge_function`, `delete_branch`) |
| [MongoDB](/agents/mongodb-mcp-server#verified) 3.1.0 | `--readOnly` | 27 | 18 | 9 names: `insert-many`, `update-many`, `delete-many`, and the create, rename and drop tools for collections, indexes and databases |
| [Blender](/agents/blender-mcp#verified) 2.2.4 | `BLENDER_MCP_SAFE_MODE=1` | 9 | 9 | Nothing: identical hashes |
| [ClickHouse](/agents/clickhouse-mcp-server#verified) 0.7.0 | `CLICKHOUSE_ALLOW_WRITE_ACCESS` false or true | 3 | 3 | Nothing: identical hashes |

In every one of the five that shrank, tools only left: none were added. For Supabase, GitHub, Atlassian, Blender and ClickHouse we ran each configuration twice. Supabase, GitHub, Blender and ClickHouse gave identical hashes both times. Atlassian's descriptions matched, but its schema hash changed between starts: only the order of 11 comma-separated field names in four tools moved, the same set each time, and the tool count was the same. MongoDB and Grafana have one recorded run per configuration, and the MongoDB pair was run on two different days.

GitHub's server is distributed as a container image, so we took its binary from the official image (pinned by digest on the card) and ran it in our standard container. Its `--read-only` flag removed 19 of 46 tools.

## When the list shrinks, a client can see it

Atlassian, Grafana, GitHub, Supabase and MongoDB take tools away when you set the flag. A client, or a scanner reading tool definitions, can tell the two configurations apart from names and schemas alone. That is the useful case, and the size differs a lot: 9 tools for MongoDB, 40 for Atlassian.

Two caveats. First, we only listed the tools; we did not check that the remaining ones respect the setting. Second, Grafana still lists `grafana_api_request` with `--disable-write`. The name says it makes API requests, and we did not test what it allows in that mode.

## When it does not, the setting is invisible

Blender's safe mode and ClickHouse's write setting changed nothing in what the server announces. ClickHouse has a single query tool, `run_query`, so a write setting can only act inside it. A client connected to either server sees the same list whichever way the setting is turned.

That does not mean the settings do nothing. It means the tool list cannot tell you. It is the same situation as the two DBHub releases that announced a byte-identical tool list while one of them had a read-only mode that did not hold: [DBHub 0.22.5 and 0.22.6: same tool list, different security status](/blog/dbhub-same-tool-list-different-security-status). To know whether a setting is enforced you need something other than the tool list: the advisories for that version, the project's tests, or a database user that cannot write.

## A shorter list may also cost less

Two readers raised the cost side. One pointed out that a shorter, stable list could help prefix caching. Another noted that Claude Code loads tool definitions on demand, so a long list may weigh less there than it would in a client that sends everything every turn. We have measured neither, so we are not putting a number on it.

## A paired test for normalizing hashes

After our [last post](/blog/10-mcp-servers-in-docker-what-their-tool-lists-tell-you) a reader asked whether stripping what looks incidental could hide a real change. So we ran a paired test with a synthetic server of our own, with one tool and two settings: an ID written into the description (like the container ID), and an allowed target written into the input schema.

- **Only the ID changes.** The description hash and the combined hash change. The schema hash does not. After replacing 12-character hexadecimal strings with a placeholder, all three hashes are identical again.
- **Only the allowed target changes.** The description hash is the same. The schema hash changes, with or without normalizing.
- **Same configuration twice.** Identical, as a control.

So in this case normalizing removed the incidental difference and left the real one visible. The limits are plain: it is a toy server with one tool, and our normalization replaces only 12-character hex strings, nothing else. One more detail from a real server: on Desktop Commander the changing text was the container hostname, which Docker sets by default to the container's 12-character ID. With a fixed hostname the text becomes `probe-host`, which that normalization does not touch. The script, `fake-mcp-server.mjs`, and the comparison output are in the public repository.

## What this does not show

One machine per run, one or two runs of each configuration. A description that includes the date would look identical in two runs on the same day, so we repeat passes on other days and say what we find. We did not call any tool, so none of this tells you whether a setting works, only what the server announces.
