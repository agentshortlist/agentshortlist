---
title: "Ask an MCP server the new way and its tool list can change"
seo_title: "MCP 2026-07-28: the tool list can change"
description: We asked 27 MCP servers for tools with initialize and server/discover. 11 of 12 matched; server-everything listed 16 tools one way and 22 the other.
date: 2026-11-06
tags: testing, tool-lists, mcp-spec
---

The 2026-07-28 revision of the Model Context Protocol removes the `initialize` handshake. Every request now carries its protocol version, and servers must implement `server/discover` to say which versions and capabilities they support. Our test script used only `initialize`, so we changed it after a reader pointed this out: it now asks `server/discover` first and falls back to `initialize`, as the stdio section of the specification describes.

![How 27 MCP servers answered server/discover: 12 answered with revision 2026-07-28, 10 returned an error and worked with initialize, 4 gave no answer in 20 seconds and worked with initialize, 1 was not classified. server-everything lists 16 tools with initialize and 22 with server/discover.](/blog/protocol-eras.svg "1200x675")

## What we ran

On 29 October 2026 we started the 27 servers on our [tested cards](/verified) (24 cards; four reference servers share one) again in Docker, with no real credentials, one run each, and waited up to 20 seconds for an answer to `server/discover` before falling back to `initialize`. The fallback runs in a fresh process, because a server that speaks both eras can stay in the era of the first request it receives.

| Result | Servers |
| --- | --- |
| Answered `server/discover` (revision 2026-07-28) | 12: excel, Grafana, kubernetes-mcp-server, memory, fetch, git, ClickHouse, MotherDuck, Serena, Context7, everything, Toolbox |
| Returned an error, then answered `initialize` | 10: Blender, MySQL, chrome-devtools, Playwright, talk-to-figma, codebase-memory, context-mode, n8n-mcp, Qdrant, Redis |
| No answer in 20 seconds, then answered `initialize` | 4: DBHub, mcp-server-kubernetes, MongoDB, Desktop Commander |
| Not classified | 1: browser-tools (the retry failed on an npm error; an earlier run, on 25 October, did list its tools with `initialize`) |

A silence of 20 seconds is not proof that a server is of the older era, only that it did not answer. The first time we ran this with a wait of 5 seconds, three slow-starting Python servers (ClickHouse, MotherDuck and Serena) failed, and with 20 seconds all three answered as modern.

## Eleven lists did not change, one did

For 11 of the 12 servers that answer `server/discover`, the hashes of the tool list were identical to the ones we recorded with `initialize` earlier. One was not: `server-everything` 2.0.0, a reference server built for testing clients. Asked with `initialize` it lists 16 tools. Asked with `server/discover` and per-request metadata, it lists 22: eight added (`get-roots-list`, `simulate-research-query` and six that trigger sampling or elicitation requests) and two left out (`toggle-simulated-logging` and `toggle-subscriber-updates`). The server's source explains most of it. In 2.0.0 some tools are registered only when the client says it supports a capability (roots, form elicitation, URL elicitation, sampling), and the new way registers them all up front. So we asked it through two real clients on 4 November, each starting the server in Docker. Claude Code 2.1.318 lists 20 tools. Cursor 3.28.7 lists 19: the same ones, except for the URL elicitation tool that only Claude Code lists. Same package, same version, four different lists: 16, 19, 20 and 22. What each client declares is our inference from the tools it lists; we did not read it from the client.

This is one machine and a server meant for testing, so we would not draw a general rule from it. It does show that "the tool list of version X" can depend on how you ask, and on who asks.

## What this means

A scanner or a pin that records the tool list of a server needs to record how it asked. If it asks one way today and the other way next month, a changed hash may come from the protocol and not from the server. On the cards, each test now shows the protocol the server answered and the date we checked, and the same fields are in [our open data](/data).

## What this does not show

We called no tools. We checked 27 servers on one machine on one day, and the difference we found is in one server. We did not test what a client that speaks only the new revision sees from the 14 servers that did not answer `server/discover`.
