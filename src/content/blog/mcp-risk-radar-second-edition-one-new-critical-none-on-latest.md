---
title: "MCP Risk Radar #2: 67 advisories, one new critical, 0 on latest"
seo_title: "MCP Risk Radar #2: 67 advisories, 0 on latest"
description: One new critical advisory for a tracked MCP server, none affecting a latest version, and what we recorded when we started 24 servers ourselves (33 runs).
date: 2026-11-01
tags: security, advisories, risk-radar
---

OSV.dev lists 67 advisories for the packages of our 54 verified MCP servers as of 31 October, up from 66 in [edition #1](/blog/mcp-risk-radar-1-66-advisories-none-on-the-latest-versions) (checked 24 October). They affect 49 packages. None of them affects the latest version of the package it is filed against.

![MCP Risk Radar second edition: 67 published advisories, up from 66. One new, critical, in mcp-server-kubernetes, fixed in 3.9.0. None affects a latest version.](/blog/risk-radar-2-advisories.svg "1200x675")

## The count, and what changed

- Advisories: 67 (was 66). Packages with at least one advisory: 49 (was 49).
- New since #1: one. Critical severity, in `mcp-server-kubernetes`.
- Affecting a latest version: none. Edition #1 said 0 on latest too.

## New advisories since #1

| Advisory | Package | Severity | Fixed in | Affects the latest? |
|---|---|---|---|---|
| GHSA-wmg3-h8mf-wgvr | mcp-server-kubernetes | Critical | 3.9.0 | No. Not 4.1.9, not 4.2.1 |

Source: [OSV.dev](https://osv.dev), read on 31 October. If you pin an old version, `/check` flags it. Full list: [/advisories](/advisories).

## What we recorded when we started servers

We started servers in Docker and recorded the exact version, the environment and what `tools/list` returned. A pass means it started and listed its tools. It does not mean it is safe.

- 10 servers on 25 October, in [the first post](/blog/10-mcp-servers-in-docker-what-their-tool-lists-tell-you). Tool counts: Redis 53, MongoDB 27, mcp-server-kubernetes 23, kubernetes-mcp-server 20.
- DBHub 0.22.5 and 0.22.6 announce byte-identical tool lists. One is affected by a published advisory, the other is the fix: [post](/blog/dbhub-same-tool-list-different-security-status).
- Lot 4 (28 October): six more servers, two runs each, identical hashes both times. Serena 3, Blender 9, Grafana 79, ClickHouse 3, MCP Toolbox 2 (SQLite), Talk to Figma 40.
- Flags that shrink the list: MongoDB with `--readOnly` goes from 27 to 18; Grafana with `--disable-write` from 79 to 62. Blender in safe mode and ClickHouse with write access off list the same tools.
- `mysql-mcp-server` 0.4.1 and 0.4.2 do not start from a clean install. 0.4.4 does.
- With a synthetic server we confirmed what the hashes catch: changing only an ID changes the description hash, and normalising removes it. Changing only a destination changes the schema hash, and normalising keeps it.

## Releases and quiet projects

- Releases: `mcp-server-kubernetes` 4.2.0 and 4.2.1 (26 October). We have not read the release lists of the other cards for this edition: not verified.
- Quiet for more than 30 days, among the 54 verified cards (last push as shown on each card on 31 October): Qdrant MCP Server (57 days, last push 4 September), MCP Atlassian (42 days, 19 September), IDA Pro MCP (35 days, 26 September). Edition #1 listed six.
- Left the directory: Talk to Figma MCP, 97 days without a push, over our 90-day rule. Its card still exists in our records but the page is not listed. Also left: Khoj, Pocket Flow (not MCP servers).
- Downloads: not refreshed for this edition. Not verified.

## Corrections

- Desktop Commander: the card now says 25 tools. The count depends on the client, and the maintainer confirmed that part of the description is generated at runtime ([issue 935](https://github.com/wonderwhy-er/DesktopCommanderMCP/issues/935)).
- Our post about free MCP servers got an FAQ on what "free" covers.

## What to check this week

1. Run your config through [/check](/check). It reads your pinned versions against the advisories above. It does not send your JSON anywhere.
2. If you run `mcp-server-kubernetes`, make sure you are on 3.9.0 or later. The critical advisory is in [/advisories](/advisories).

Every record behind these numbers is [open data](/data), as JSON and CSV, with the exact command to repeat a run.
