---
title: MCP Risk Radar #1: 66 advisories, 0 on latest
description: What OSV.dev lists for the packages of our 54 verified MCP servers, the newest advisories, which projects have gone quiet, and what people actually download.
date: 2026-10-25
tags: security, advisories, risk-radar
---

This is the first edition of a short weekly note on what changed around the MCP servers we have read. It is the baseline: next week it will list what is new since this one. Everything below comes from the data behind our [verified cards](/verified), checked on 24 October 2026.

## The count

OSV.dev lists **66 published advisories** across the **49 packages** we could match to our 54 cards. 30 of those 49 packages have none. By severity, the advisories are 6 critical, 22 high, 19 moderate and 3 low, and 16 carry no severity label.

For 45 of the packages we could check the latest version. **None of the 66 advisories affects any of those latest versions.** The four Go modules are not checked, because their latest version is not available to us. An advisory that affects an older version still matters if you pin it, and that is the reason to pin on purpose.

![The packages with the most published advisories among the 54 verified cards: n8n-mcp 11, mcp-server-git 8, ha-mcp 6, mcp-server-kubernetes 5, mcp-contextforge-gateway 5, mysql-mcp-server 4. None affects its latest version.](/blog/risk-radar-1-advisories.svg "1200x675")

A high count is not a verdict on a project. n8n-mcp has the most, 11, and none touches its latest version (2.98.1). Active projects tend to collect reports because people look at them.

## The newest advisories

- **DBHub, 24 September.** Two reports, fixed in 0.22.5 and 0.22.6. One is critical: DNS rebinding on the HTTP transport allowed unauthenticated SQL execution from a browser origin. The other is high: the read-only mode did not prevent database writes. That second one matters beyond this project, because a documented read-only option is not the same as one that holds. We wrote about the difference in [20 of 54 MCP servers document a read-only mode](/blog/20-of-54-mcp-servers-document-a-read-only-mode).
- **MySQL MCP Server, 1 October and 11 September.** Missing Origin and Host validation on the SSE transport enabled unauthenticated SQL execution. Fixed in 0.4.2; the latest is 0.4.4.
- **mcp-contextforge-gateway, 10 September and 25 August.** A RestrictedPython sandbox bypass (fixed in 1.0.2) and a template injection that led to remote code execution (fixed in 1.0.0). The latest is 1.1.0.

If you run one of these, open the [config checker](/check). It compares the version you pin with the advisory ranges and tells you when a pin falls inside one. The match is approximate, so open each advisory to confirm.

## Who has gone quiet

Six of the 54 have not had a push for more than 30 days:

| Project | Days since last push |
| --- | --- |
| Talk to Figma MCP | 90 |
| MySQL MCP Server | 83 |
| Qdrant MCP Server | 50 |
| MCP Atlassian | 35 |
| Notion MCP Server | 34 |
| Docker MCP Gateway | 31 |

A quiet repository is not an abandoned one. Talk to Figma is at the edge of our 90-day rule, and the MySQL server pairs slow pushes with an advisory published on 1 October. We will say next week which of them moved.

## What people download

Weekly downloads from the npm registry and pypistats.org, for the last 7 days. They include automated installs and mirrors, so they show how widely a package is pulled, not how many people use it.

- `@playwright/mcp`: 3.8 million
- `chrome-devtools-mcp`: 2.3 million
- `mcp-for-blender` (PyPI): 844 thousand
- `@upstash/context7-mcp`: 441 thousand
- `@modelcontextprotocol/server-filesystem`: 440 thousand

## What this is not

It is not a security review and we have not run any of these servers. It reports what OSV.dev publishes and what the registries show. If something here is wrong, use the report link at the bottom of the card.
