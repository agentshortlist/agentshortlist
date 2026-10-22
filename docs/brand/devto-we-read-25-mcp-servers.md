*This is a copy of an article first published on [AgentShortlist](https://agentshortlist.dev/blog/we-read-25-mcp-servers), where the tables and cards live.*

On 18 and 19 October 2026 we read the documentation and source of 25 MCP servers and wrote down, line by line, what each one says and does. Every line on a [verified card](https://agentshortlist.dev/verified) carries a source and a review date. This article adds the 25 cards up.

It isn't a ranking or a security audit. It records what the projects document and what their code shows. Where we couldn't check something, the card says "not verified", and that turned out to be a big part of the result.

## Read-only modes: documented in 5 of 25

Plenty of these servers can change data. Whether you can run them read-only is the question that moves the risk the most.

| Documented read-only mode or recipe | None found in the docs and source we read | Not verified |
|---|---|---|
| GitHub MCP server, n8n-mcp, MongoDB MCP server, DBHub, pREST | Playwright MCP, Desktop Commander, MySQL MCP server, Chrome DevTools MCP, Blender MCP, IDA Pro MCP, Talk to Figma MCP | The other 13 |

"None found" means we didn't find one in what we read, not that none exists. For browser and design tools a read-only mode isn't really the right idea anyway. For the MySQL server it is, and there isn't one, so the limit has to live in the database user.

## Telemetry: three on by default, and mostly silence

Chrome DevTools MCP collects usage statistics by default, and its performance tools can send trace URLs to Google's CrUX API. The Apify MCP server collects telemetry about tool calls by default, with Sentry error tracking. Blender MCP collects a minimal anonymous usage record by default; prompts, generated code and scene data are collected only if you opt in.

All three document how to turn it off. Two more projects, codebase-memory-mcp and context-mode, say they send nothing; we didn't verify that claim. For the other 20 we found no statement either way in the docs we read. What stood out to us is how few projects say anything about what leaves your machine.

## Advisories: 40 published, none on the latest versions we checked

We matched the cards to packages on npm, PyPI and Go, but only when we could confirm the package belongs to the same repository. That gave 24 packages across 20 of the 25 cards, with 40 published advisories on OSV.dev in total. Half of those 20 cards have none.

We could check the latest version for 23 of the 24 packages, the npm and PyPI ones, and none of them is affected by a published advisory as of 19 October. We didn't check the latest version of the one Go module, the GitHub MCP server.

| Card | Published advisories |
|---|---|
| n8n-mcp | 11 |
| MCP reference servers (filesystem and git packages) | 10 |
| GitHub MCP server | 4 |
| MySQL MCP server | 4 |
| Chrome DevTools MCP, DBHub, Apify, Desktop Commander and Serena | 2 each |

Read the table with care. More advisories often just means a project is more used and more closely examined, not that it's worse. A package with none isn't proven safe. The practical takeaway is smaller: older versions are affected, so pin a version you've actually checked.

## Upkeep: the issue backlogs differ a lot

![Playwright MCP, Chrome DevTools MCP and Browser Tools MCP side by side: telemetry, read-only option, advisories, last push and open issues, checked on 19 October 2026](https://agentshortlist.dev/blog/compare-playwright-chrome-devtools-browser-tools.png)

Open issues created before 20 July 2026, counted on 19 October:

| Server | Open issues | Of which older than that date |
|---|---|---|
| Playwright MCP | 4 | 0 |
| n8n-mcp | 64 | 16 |
| Chrome DevTools MCP | 173 | 46 |
| GitHub MCP server | 380 | 112 |
| Desktop Commander | 311 | 126 |
| MySQL MCP server | 6 | 1 |

A busy project collects more issues. The number tells you where to look, not what to conclude.

## Projects that point somewhere else

A few READMEs say another option fits better, which is useful to read before you install:

- The Playwright MCP README recommends Playwright CLI with Skills for coding agents, because it avoids loading large tool schemas and page snapshots into the model's context.
- The awslabs/mcp README recommends the Agent Toolkit for AWS for production software built with coding agents, and calls it the successor to the servers in that repository.
- The IDA Pro MCP README opens by recommending the official Hex-Rays server instead.
- The MCP reference servers README says they are reference implementations, not production-ready solutions.

## What to do with this

If a server can change data, look for its read-only option before anything else. Search the README for telemetry and set the opt-out if you want it. Pin versions and check them against advisories; the [config checker](https://agentshortlist.dev/check) does that in your browser. And treat "not stated" as a question to ask the maintainers, not as a yes.

Every card, with its sources, is on the [verified cards page](https://agentshortlist.dev/verified). You can compare servers in the [live comparator](https://agentshortlist.dev/compare/live) or filter by what you need in the [picker](https://agentshortlist.dev/pick). If a card has a mistake, send us the primary source and we'll correct it.
