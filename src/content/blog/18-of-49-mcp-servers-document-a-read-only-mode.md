---
title: 18 of 49 MCP servers document a read-only mode
description: We counted which of our 49 verified MCP servers document a way to run read-only, which ones use a switch and which only a recipe, and which say nothing.
date: 2026-10-22
tags: security, read-only
---

On 19 October we told you that only 5 of the first 25 MCP servers we read documented a read-only mode. We now have [49 verified cards](/verified), so we counted again. The answer is better, but not by much: **18 of 49 document a way to run read-only, 12 document none, and for 19 we couldn't verify it.**

"Documents" means the project's own README or docs say so. We haven't run any of these modes, and we don't claim they hold up when something tries to write. This is a count of what the documentation says on the dates shown on each card.

## 15 have a switch

For these, the project names a setting that turns writing off.

| Server | What the docs name |
|---|---|
| [GitHub](/agents/github-mcp-server) | A read-only mode (`GITHUB_READ_ONLY=1`) |
| [MongoDB](/agents/mongodb-mcp-server) | `--readOnly` or `MDB_MCP_READ_ONLY=true`; the README's examples include it |
| [Supabase](/agents/supabase-mcp) | `read_only=true` on the server URL |
| [Google Workspace](/agents/google-workspace-mcp) | `--read-only`, plus per-service `--permissions` |
| [Neon](/agents/neon-mcp-server) | `readonly` on the server URL |
| [Grafana](/agents/grafana-mcp-server) | `--disable-write` removes the create and update tools |
| [DBHub](/agents/dbhub) | `readonly = true` on the `execute_sql` tool |
| [MotherDuck](/agents/motherduck-mcp-server) | Read-only unless you start it with `--read-write` |
| [Home Assistant](/agents/home-assistant-mcp-server) | A Read Only Mode toggle |
| [Kubernetes (containers)](/agents/kubernetes-mcp-server) | `read_only = true` in its TOML file |
| [Qdrant](/agents/qdrant-mcp-server) | `QDRANT_READ_ONLY=true`, which disables `qdrant-store` |
| [pREST](/agents/prest) | A read-only MCP, described in its README |
| [Atlassian (community server)](/agents/mcp-atlassian) | `READ_ONLY_MODE=true` disables all write operations |
| [Auth0](/agents/auth0-mcp-server) | `--read-only`, which takes priority over `--tools` |
| [Excel](/agents/excel-mcp-server) | `--read-only` offers only tools that do not change files |

Two details matter. Qdrant's switch turns off one tool, `qdrant-store`; that is enough if that is the only tool that writes, and we noted it on the card because it isn't obvious from the name. MotherDuck is the only one where read-only is the default: you have to ask for writing.

## 3 give you a recipe

Three projects don't have a switch but describe how to get the same result with permissions.

- [n8n-mcp](/agents/n8n-mcp) describes a read-only recipe that removes its credentials tool, even for reads.
- [Notion](/agents/notion-mcp-server) suggests an integration token that is read-only on the Notion side.
- [Atlassian's hosted server](/agents/atlassian-remote-mcp-server) lets admins grant access by permission group (read, write, search, delete, manage).

A recipe is only as strong as the permission behind it. That's the point of the next section.

## 12 document none

[Playwright](/agents/playwright-mcp), [Desktop Commander](/agents/desktop-commander-mcp), [MySQL](/agents/mysql-mcp-server), [Chrome DevTools](/agents/chrome-devtools-mcp), [Blender](/agents/blender-mcp), [IDA Pro](/agents/ida-pro-mcp), [Talk to Figma](/agents/talk-to-figma-mcp), [Terraform](/agents/terraform-mcp-server), [Redis](/agents/redis-mcp-server), [Datadog](/agents/datadog-mcp-server), [Sentry](/agents/sentry-mcp) and [Flux159's Kubernetes server](/agents/mcp-server-kubernetes).

A browser or a 3D editor may not need one in the same way. Others clearly do. The MySQL server's `execute_sql` accepts INSERT, UPDATE and DELETE, and we found no read-only mode in its source. Redis's README suggests a Redis ACL user instead, which is the right answer, but it lives in Redis, not in the MCP server.

Datadog's server is hosted and acts as the connected Datadog user: its docs say write operations need the matching permission, checked on each call, but they describe no read-only mode, so the limit is the user's role. Sentry's README documents no read-only mode either, and its stdio token scopes include write; it shows `--disable-skills` to turn off a group such as project management.

Flux159's Kubernetes server is a special case. Its README documents a non-destructive mode, which still allows apply, create, scale and patch, and its example configuration is named `kubernetes-readonly`. Its source code also contains a stricter switch that the README doesn't mention. We [wrote about it](/blog/two-kubernetes-mcp-servers-two-kinds-of-safe) and opened an issue with the project.

## What a read-only mode doesn't replace

Even where the switch exists, we'd put the limit one level down too. Give the credential only the permission you want: a database user that can only SELECT, a ServiceAccount that can only get and list, a restricted API key. If the server has a bug, or a read-only flag is misread, the credential still can't write.

The switch is the second layer, not the only one. A server with no switch, like Redis or MySQL, is a good case for the first layer alone.

## How to use this

- Before you install, search the README for "read-only" or "readonly" and set it if it exists.
- Where it doesn't exist, set the limit in the database, cluster or API key.
- Paste your configuration into the [config checker](/check). It flags the documented read-only options you haven't turned on, for the servers we have cards for.

Nothing here is an audit. If a card is wrong, send us the primary source and we'll correct it.
