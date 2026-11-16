---
title: "MCP Risk Radar #3: 68 advisories, one new, 0 on latest"
seo_title: "MCP Risk Radar #3: 68 advisories, 0 on latest"
description: One new moderate advisory, in DBHub, and none affecting a latest version. Plus what 74 start records on 42 cards say, and the one verified server that went quiet.
date: 2026-11-11
tags: security, advisories, risk-radar
---

OSV.dev lists 68 advisories for the packages of our verified MCP servers as of 11 November, up from 67 in [edition #2](/blog/mcp-risk-radar-second-edition-one-new-critical-none-on-latest) (checked 31 October). They affect 49 packages from 43 servers. Of the 45 packages where we could compare against the latest release, none is affected by an advisory in its latest version.

## The count, and what changed

- Advisories: 68 (was 67). Packages with at least one advisory: 49 (was 49).
- New since #2: one. Moderate severity, in DBHub.
- Affecting a latest version: none, as in the two earlier editions.

## New advisory since #2

| Advisory | Package | Severity | Published | Fixed in |
|---|---|---|---|---|
| GHSA-j656-3hf2-fvjc | @bytebase/dbhub | Moderate | 2 November | 0.22.6 |

Title: "MySQL and MariaDB comment interpretation bypasses read-only SQL validation". It is the third DBHub advisory in two months, and the fix is the same release as the one for the read-only mode advisory we covered in [DBHub 0.22.5 and 0.22.6: same tool list, different security status](/blog/dbhub-same-tool-list-different-security-status). The latest DBHub release, 1.6.1, is not affected. Source: [OSV.dev](https://osv.dev), read on 11 November. The full list is on [/advisories](/advisories).

![MCP Risk Radar third edition: 68 published advisories, up from 67. One new, moderate, in DBHub, fixed in 0.22.6. None affects a latest version.](/blog/risk-radar-3-advisories.svg "1200x675")

## What we recorded when we started servers

A pass means the server started and listed its tools. It does not mean it is safe. The records are open data on [/data](/data).

- 74 records for 45 servers on 42 cards, the latest from 5 November. In edition #2 it was 33 runs, 27 servers and 24 cards.
- Five read-only or safe-mode settings shrank a tool list and two did nothing: [the post](/blog/five-read-only-settings-shrink-an-mcp-tool-list-and-two-do-not). Atlassian 98 to 58, GitHub 46 to 27, Grafana 79 to 62, Supabase 31 to 19, MongoDB 27 to 18. Blender and ClickHouse listed the same tools either way.
- Five servers in two real clients on Windows, with a harmless action each: memory 9 tools, context7 2, fetch 1 and git 12 in both Claude Code 2.1.318 and Cursor 3.28.7. server-everything listed 20 in Claude Code and 19 in Cursor, against 16 or 22 in our probe depending on how it asked. The list depends on what the client announces.

## Quiet projects

- Quiet for more than 30 days among the verified cards (last push read from GitHub on 11 November): IDA Pro MCP, 46 days, last push 26 September.
- Back since #2: Qdrant MCP Server and MCP Atlassian, both listed as quiet in edition #2 and both pushed again.
- Left the directory under our 90-day rule: Talk to Figma MCP (108 days without a push), Khoj, Pocket Flow and Aider. Talk to Figma's records are still in the open data.
- Releases and downloads: not read for this edition. Not verified.

## Corrections

None since edition #2.

## What to check this week

1. Run your config through [/check](/check). It reads your pinned versions against the advisories above. It does not send your JSON anywhere.
2. If you run DBHub, be on 0.22.6 or later. It covers both the read-only advisories and the new one.

