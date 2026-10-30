---
title: "DBHub 0.22.5 and 0.22.6: same tool list, different security status"
seo_title: "DBHub: same tool list, different security"
description: Two DBHub releases three hours apart announced a byte-identical tool list. One is affected by a published advisory and one is not. We ran both in Docker and compared the hashes.
date: 2026-10-30
tags: dbhub, advisories, testing
---


A check that reads only what an MCP server tells the model cannot tell these two releases apart. [DBHub](/agents/dbhub#verified) 0.22.5 and 0.22.6 announce exactly the same two tools, with the same descriptions and the same input schemas. One of them is affected by a published advisory.

![Two DBHub releases, 0.22.5 (affected by GHSA-mwwr-p57h-56pf) and 0.22.6 (fixed), announced the same two tools and the same three hashes.](/blog/dbhub-same-hash.svg "1200x675")

## What we compared

- `@bytebase/dbhub` 0.22.5 and 0.22.6, published on 24 June 2026, about three hours apart (04:22 and 07:34 UTC, from the npm registry).
- Advisory GHSA-mwwr-p57h-56pf, from OSV.dev, rated high: DBHub's read-only mode did not prevent database writes. It affects every release before 0.22.6, including 0.22.5, and 0.22.6 is the fixed one. The advisory was published on 24 September 2026, three months after the fix.
- Both releases in Docker (`node:22-slim`), no credentials, DBHub's `--demo` mode (an in-memory SQLite database with sample data), a fixed hostname, in the order 0.22.5, 0.22.6, 0.22.5, 0.22.6. Each version ran twice so we could see whether the environment alone changes the result.

## What we measured

Each server reported `execute_sql` and `search_objects`. The SHA-256 of the descriptions, of the schemas and of both together was the same in the four runs:

| Hash | Value (first 16 characters) |
|---|---|
| Descriptions | a629bd6a8da832f3 |
| Schemas | 910f0162e3129022 |
| Both | 5fc028095d373457 |

Two runs of the same version were identical, so the environment is not what makes them match. The tool list of 0.22.5 and of 0.22.6 is byte-identical.

## What did change

Not the tool definitions. We compared the two published packages as text, without running either. In 0.22.6 the PostgreSQL, MySQL, MariaDB and SQLite connectors contain read-only statements (`BEGIN READ ONLY`, `START TRANSACTION READ ONLY` and `PRAGMA query_only`); in 0.22.5 none of those strings appear. The lines that define each tool's description, input schema and registration are the same in both. That is the part the advisory is about, and it is not visible in `tools/list`.

## What this means

- A scanner that compares tool descriptions and schemas, which is where tool-poisoning checks look, would give these two releases the same result. The advisory database gives them different ones. They answer different questions.
- Read-only mode is enforced in the server's code, not announced in its tool list. To know whether it holds you need the advisory data and the exact version.
- This is why every card shows the version we looked at and the advisories for that version, and why the Radar lists advisories separately from test results.

## A second case, and what it does not show

`mysql-mcp-server` 0.4.1 and 0.4.2 also span an advisory (GHSA-rqfv-2mw9-78g2, a missing Origin and Host check in the SSE transport). We could not compare their tool lists: in a clean Docker environment neither started, first because of a missing `dotenv` module and then, with that added, on an `AttributeError` about `list_resources`. We did not investigate the cause. Version 0.4.4 started and listed three tools.

What we did not test: whether read-only mode holds in 0.22.5 or 0.22.6 (we did not run a write), other DBHub versions (the card is on an older version; the latest at the time of writing was 1.5.0), or any other transport. A matching hash is not a security result. It tells you the announced tools did not change.

## See it on the cards

[DBHub](/agents/dbhub#verified) shows both test records and the advisory. All [66 advisories we track](/advisories) are listed there with the affected and fixed versions. If we got something wrong, the report link at the bottom of each card reaches us, and corrections change the card, not a score.
