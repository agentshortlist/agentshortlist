---
title: "10 MCP servers in Docker: what their tool lists tell you"
seo_title: "10 MCP servers in Docker: what tool lists show"
description: We started 10 MCP servers in Docker and recorded what each lists. All 10 passed. One changed its description hash between runs: the cause was a container ID.
date: 2026-10-27
tags: testing, tool-lists, hashes
---

A hash of a server's tool descriptions can change between two runs without anyone touching the code. We saw it with Desktop Commander 0.3.1. Across two runs only the description of `start_process` differed, and the only difference in that text was a Docker container ID: `fd1cb95d1f61` in one run, `6f6d4f1f57de` in the other. It sits at character 1348 of a description 4180 characters long. The schemas and the other 24 descriptions were identical.

Our first reading was that something had changed in the tool. It had not. The server writes its container hostname into the description, so the text depends on where it runs. This is an effect of the environment, not a vulnerability and not a sign of risk. We corrected our own notes the same day.

The practical lesson is for anyone who watches MCP servers for changes by hashing `tools/list`: compare hashes taken in the same environment, and normalize only what you can show is incidental, like a container ID, keeping the raw hash next to the normalized one. Stripping every hostname and path would also hide a changed target. It helps to hash descriptions and schemas separately: a changed description can be incidental, a changed schema is harder to explain away. Otherwise a harmless container ID looks like a changed tool.

The rest of this post is what else those runs recorded.

## What we ran

On 25 October 2026 we installed 10 servers from our [verified cards](/verified) in Docker on a Windows machine with WSL2, with no credentials and only synthetic data. Seven ran in `node:22-slim`. Three (excel, fetch, git) ran in an image with `uv` and Python 3.12; the git one also needed git installed, and a first attempt without it did not start.

For each we sent `initialize` and `tools/list` with our probe script and stored the tool names and a sha256 of the canonical list (sorted by name and by key), with separate hashes for descriptions, schemas and both together. The records are on each card under "Tested by us".

**All 10 passed.** Here "pass" means three things: the package installed and started, it answered the handshake with a valid protocol version, and it returned a tool list. It does not mean the tools work, that they do what their descriptions say, or that any limit the project documents holds. In this first run we called no tools. A second run later the same day added one harmless call, with synthetic data, to four of the servers (memory, everything, git and fetch); the result is on their cards.

![Tools listed by 10 MCP servers in our Docker tests: excel-mcp-server 46, chrome-devtools-mcp 32, playwright-mcp 25, desktop-commander 25, codebase-memory-mcp 17, server-everything 16, server-git 12, server-memory 9, context7-mcp 2, server-fetch 1.](/blog/mcp-tools-in-docker.svg "1200x675")

| Server | Version | Tools listed |
| --- | --- | --- |
| excel-mcp-server | 2.2.2 | 46 |
| chrome-devtools-mcp | 1.12.0 | 32 |
| @playwright/mcp | 0.0.83 | 25 |
| Desktop Commander | 0.3.1 | 25 |
| codebase-memory-mcp | 0.12.1 | 17 |
| server-everything | 2.0.0 | 16 |
| mcp-server-git | 2026.10.19 | 12 |
| server-memory | 2.0.0 | 9 |
| Context7 | 4.4.4 | 2 |
| mcp-server-fetch | 2026.10.19 | 1 |

Playwright's count is its default tool set. Its README lists more behind optional `--caps` groups, which we did not enable.

## Same hash twice, or only once

Eight servers (chrome-devtools, codebase-memory, Context7, excel, memory, everything, git and fetch) gave identical hashes in two runs. Desktop Commander was run twice and differed, as above. For Playwright our record does not show a second run, so a repeat could still differ. One matching pair is weak evidence of stability, not proof.

## What the names say

From the tool names alone we group tools by what they appear to do. The rules are in the open and deliberately simple: a name such as `start_process` counts as running commands, `write_file` as writing files. **These groups come from names, not from what the tools do inside, and not from any limit the server enforces.** A tool called `read_file` might refuse most paths; we did not test that.

With that caveat, some names are worth knowing before you connect a server:

- **Desktop Commander:** 7 tool names that start, talk to or stop processes (`start_process`, `interact_with_process`, `kill_process`, `force_terminate`, `list_processes`, `read_process_output`, `list_sessions`), 5 that write files or folders, and 2 that read or set its own config.
- **Playwright:** `browser_evaluate` and `browser_run_code_unsafe`, two tools that run code. The second one has "unsafe" in its name; we only know what the name says.
- **Chrome DevTools MCP:** `evaluate_script` is the one name our rules treat as running code, among 32.
- **mcp-server-git:** 5 names that change repository state (`git_add`, `git_commit`, `git_checkout`, `git_create_branch`, `git_reset`) and 7 that only read.
- **server-memory:** 6 of 9 names create, add or delete stored data.
- **server-everything:** one name, `get-env`, says it returns environment variables. We did not call it. The project is a reference server for testing clients, so this is not a statement about what it exposes in normal use.
- **mcp-server-fetch:** one tool, `fetch`, which reaches the network by its name.

The grouping has gaps. For codebase-memory, 16 of 17 names match no group, and for Context7 neither of its two does. That does not mean those tools are harmless; it means our name rules say nothing about them. Cards for those servers show how many tools fall outside any group.

## One count that was off

The Desktop Commander card said 24 tools, counted from the source when we wrote it. The running server listed 25 for our test client. We checked the project's `src/server.ts` on its main branch, where `package.json` says 0.3.1: it defines 25 distinct tool names, the same 25 the server returned. One of them, `give_feedback_to_desktop_commander`, is left out when the connecting client is named `desktop-commander-app`, so for that client the list has 24. The card will say 25, with a note that the count depends on the client.

## What this does not show

Apart from one harmless call on four of the servers, we did not test whether any tool works, what it does with real data, or whether it is safe to run. Ten passes on one machine on one day say these packages can be installed and answer a basic request in that environment. For any one server, check the card's other lines (source per line, [advisories](/blog/mcp-risk-radar-1-66-advisories-none-on-the-latest-versions), access type) before you connect it, and use the report link on the card if something here is wrong.
