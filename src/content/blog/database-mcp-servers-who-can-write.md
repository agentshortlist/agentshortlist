---
title: "13 database MCP servers: who can write?"
seo_title: "13 database MCP servers: who can write?"
description: 8 of 13 verified database MCP servers document a read-only option, 2 document none. We started 8 in Docker and counted the tools each announces.
date: 2026-11-03
tags: security, read-only, databases, testing
---

When you give an AI client a database, the first question is whether it can change anything. We took the 13 database servers among our [54 verified cards](/verified) and checked what each project documents about a read-only mode.

![Of 13 verified database MCP servers, 8 document a read-only option, 2 document none and 3 are not verified](/blog/database-mcp-readonly.svg "1200x675")

**8 document a read-only option. 2 document none. For 3 we could not verify it.** "Documents" means the project's own README or docs say so. That count is what is written, not a test. For eight of the thirteen we also started the server in Docker and recorded the tools it announces; that part is below, and it is a separate kind of evidence.

## The 8 that document one

| Server | How it is described |
| --- | --- |
| [MongoDB](/agents/mongodb-mcp-server) | `--readOnly` or `MDB_MCP_READ_ONLY=true` |
| [Supabase](/agents/supabase-mcp) | `read_only=true` on the server URL |
| [Neon](/agents/neon-mcp-server) | `readonly` on the server URL |
| [DBHub](/agents/dbhub) | `readonly = true` on the `execute_sql` tool |
| [MotherDuck](/agents/motherduck-mcp-server) | Read-only unless you start it with `--read-write` |
| [Qdrant](/agents/qdrant-mcp-server) | `QDRANT_READ_ONLY=true`, which disables `qdrant-store` |
| [pREST](/agents/prest) | A read-only MCP, described in its README |
| [ClickHouse](/agents/clickhouse-mcp-server) | Read-only by default; writes and destructive statements are separate opt-ins |

Two details. Qdrant's switch turns off one tool, which is enough only if that is the only tool that writes. MotherDuck and ClickHouse are read-only unless you opt out, which is the safer default.

## The 2 that document none

The [MySQL MCP Server](/agents/mysql-mcp-server) has an `execute_sql` tool that accepts INSERT, UPDATE and DELETE, and we found no read-only mode in its source. It also has 4 published advisories, among them a critical one: missing Origin and Host validation on the SSE transport allowed unauthenticated SQL execution. It was fixed in 0.4.2, and the latest version is 0.4.4.

We also tried to start it. In our Docker environment, with no credentials and synthetic settings, releases 0.4.1 and 0.4.2 did not start from a clean install: first a missing `python-dotenv`, then an `AttributeError` on `list_resources`. Release 0.4.4 started and listed three tools: `execute_sql`, `get_schema_info` and `get_table_sample`. We did not call any of them. That is a result for that environment, not a verdict on the project.

[Redis](/agents/redis-mcp-server) has no switch either. Its README suggests using a Redis ACL user with limited permissions instead.

## What we started, and what the tool lists show

We started eight of the thirteen in Docker with no credentials and synthetic settings, and recorded what `tools/list` returned. We called nothing. A count of tool names says what a server announces, not what it does.

| Server (version) | Tools announced | Names that say they change data |
| --- | --- | --- |
| [Redis](/agents/redis-mcp-server#verified) 0.5.1 | 53 | 23, such as `hset`, `json_set`, `lpush` |
| [MongoDB](/agents/mongodb-mcp-server#verified) 3.1.0 | 27 by default, 18 with `--readOnly` | 9 by default, such as `insert-many`, `delete-many`, `drop-collection`; 0 with `--readOnly` |
| [MotherDuck](/agents/motherduck-mcp-server#verified) 1.1.0 | 4 | 0 by name, but `execute_query` runs SQL |
| [MySQL MCP Server](/agents/mysql-mcp-server#verified) 0.4.4 | 3 | 0 by name, but `execute_sql` accepts writes |
| [DBHub](/agents/dbhub#verified) 0.22.5 and 0.22.6 | 2 | 0 by name, but `execute_sql` runs SQL |
| [Qdrant](/agents/qdrant-mcp-server#verified) 0.8.1 | 2 | 1: `qdrant-store` |
| [ClickHouse](/agents/clickhouse-mcp-server#verified) 0.7.0 | 3, the same with writes on or off | 0 by name, but `run_query` runs SQL |
| [MCP Toolbox](/agents/mcp-toolbox-for-databases#verified) 1.15.0 (SQLite) | 2 | 0 by name, but `execute_sql` runs SQL |

Two readings. Tools with a verb like "drop" or "delete" in the name are easy to spot. MongoDB shows what a switch can do to the list: started with `--readOnly`, it announced 18 tools instead of 27, and the nine that left were `create-collection`, `create-index`, `delete-many`, `drop-collection`, `drop-database`, `drop-index`, `insert-many`, `rename-collection` and `update-many`. The descriptions and schemas of the other 18 did not change, and two runs of each mode gave identical hashes. We did not call any tool, so this shows what the server announces, not that a write is refused. For MongoDB the switch removes the tools. For a server with a single SQL tool there is nothing to remove. A server with one `execute_sql` tool shows no write verb at all, so the name tells you nothing there; only the read-only mode, an enforced one, or a read-only database user can.

ClickHouse shows the other side of a switch. Its documented write opt-in, `CLICKHOUSE_ALLOW_WRITE_ACCESS`, gave the same three tools and the same hashes set to false and to true, so the setting does not appear in what the server announces. Toolbox, started with its prebuilt SQLite configuration (other sources not tried), announces two tools, one of them `execute_sql`. A tool count cannot tell you which of these servers will accept a write.

The pattern is not limited to databases. [Grafana's server](/agents/grafana-mcp-server#verified) announced 79 tools, and 62 with `--disable-write`: the flag removes 17 tools that create, update or delete, but the list still contains `grafana_api_request`, and we did not test what it can do under the flag. Every run, with its start command, is in [our open data](/data#flags).

MotherDuck is a good example of the safer default. Without `--read-write` it refused to start an in-memory database and said so; we had to pass the flag to get its tool list.

DBHub gives the clearest case of the difference between announced and enforced. The release affected by the read-only advisory (0.22.5) and the one that fixes it (0.22.6) announced a byte-identical tool list. We wrote that up in [DBHub 0.22.5 and 0.22.6: same tool list, different security status](/blog/dbhub-same-tool-list-different-security-status).

## A documented option is not an enforced one

DBHub documents a read-only mode. In September, an advisory (GHSA-mwwr-p57h-56pf, high severity) reported that it **did not prevent database writes**. It was fixed in 0.22.6. We covered the wider point in [20 of 54 MCP servers document a read-only mode](/blog/20-of-54-mcp-servers-document-a-read-only-mode): a switch is the second layer, not the only one.

The first layer is the database itself. Connect with a user that can only read. Then a bug in a switch, or a missing one, cannot change data.

## What advisories cover

OSV.dev lists advisories only for packages we could match to the card. For 7 of the 13 we could: MySQL has 4, DBHub has 2, and the rest have none published. For the other 6 (Toolbox, Data API Builder, pREST, Qdrant, Neon and MotherDuck) we have not matched a package, so "not checked" is the right reading, not "none".

## What this is not

It is not a security review. The tool counts come from starting each server once or twice in one environment and listing its tools; they are not a test of whether any switch works. If a card is wrong, or you have run the server, use the report link at the bottom of the card.
