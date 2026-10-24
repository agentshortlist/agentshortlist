---
title: Free MCP servers: what "free" really means
description: 49 of our 54 verified MCP servers have an open-source license, but only 19 start without a third-party account, key or paid product. Here is the breakdown.
date: 2026-10-24
tags: free, access
---

Search for free MCP servers and you get lists of repositories. A repository you can download for nothing tells you very little about whether you can use the server without paying someone.

So we read the credentials line on each of our [54 verified cards](/verified) and sorted the servers by what you need to start. We keep three questions apart: the software license, what you need to get it running, and what the service behind it costs. The first two come from the card. **We did not check the third.**

![What 54 verified MCP servers need to start: 3 need nothing, 2 work without a key with limits, 14 need credentials for systems you run, 21 need a third-party account, key or paid product, 14 not verified](/blog/free-mcp-access-breakdown.svg "1200x675")

| What you need to start | Servers |
| --- | --- |
| Nothing to sign up for | 3 |
| Works without a key, with limits | 2 |
| Credentials for systems you run | 14 |
| A third-party account, key, sign-in or paid product | 21 |
| Not verified | 14 |

"Not verified" means the README does not say, so we do not guess. It is never counted as a yes. The classification is from 24 October 2026 and we have not run any of these servers.

## The license is the easy part

49 of the 54 have an open-source license detected on GitHub. The other five (the reference servers, Serena, context-mode, Sentry and Inspector) show none in GitHub's detection. That is not the same as closed: Serena's README, for example, states GPL-3.0-or-later.

Open source did not mean "nothing to pay for". Of the 49 open-source servers, 20 need a third-party account, key or paid product to start.

## 3 need nothing

[Playwright MCP](/agents/playwright-mcp#verified) asks for no credentials. [codebase-memory-mcp](/agents/codebase-memory-mcp#verified) says indexing and graph queries need no hosted service or API key. The [Excel MCP server](/agents/excel-mcp-server#verified) needs no credentials by itself.

## 2 work without a key, with limits

The hosted [Exa](/agents/exa-mcp-server#verified) server works anonymously with rate limits, and OAuth or an API key raise them. [Firecrawl](/agents/firecrawl-mcp-server#verified) has a keyless free tier for scrape, search and parse with rate limits, while the cloud service takes an API key. We did not measure those limits.

## 14 need systems of your own

These are free to run, but they connect to something you have to bring: a MySQL, MongoDB, Redis, Qdrant or ClickHouse database, a Kubernetes cluster, a Home Assistant, Grafana or n8n instance. You need that system and its credentials, but no account at a third party. If your instance is a paid hosted plan, that cost sits outside the server.

## 21 need a third party

Most of these want a token, key or sign-in: a GitHub token, a Notion integration token, a Tavily or Perplexity key, a Figma token, OAuth for Atlassian, Stripe, Supabase or Neon. Whether the service behind the key has a free plan is the question we did not check. Some do. We list the requirement, not the price.

Two cases are different:

- [IDA Pro MCP](/agents/ida-pro-mcp#verified) requires IDA Pro 8.3 or higher, a commercial product. Its README says IDA Free is not supported.
- The [AWS MCP servers](/agents/aws-mcp-servers#verified) tell you to configure AWS credentials for the services you use. The hosted AWS Knowledge server is the exception: its README says it needs no credentials.

## Free software, paid extras

Some cards sit in "not verified" because the README describes optional paid parts but not what the core needs. [Serena](/agents/serena#verified) mentions free language servers and an optional paid JetBrains plugin with a free trial. [Blender MCP](/agents/blender-mcp#verified) offers optional AI 3D generation through a paid Premium plan with no key, or with your own provider keys, and Meshy needs a paid plan.

## See the 19 you can start without a third party

Pick the two filters "Needs no third-party account or key" and "Open-source license" and you get the servers that meet both. [Open that selection](/pick?f=noAccount,openSource): it returns 19 of the 54, and it leaves out every server we could not verify.

![The Pick page with the filters Needs no third-party account or key and Open-source license selected: 19 of 54 verified servers match](/blog/pick-no-third-party-account-open-source.png "1568x497")

You can also compare up to three servers side by side. The [comparison](/compare/live) now has a row called "Needed to start". How we classify each label is on the [methodology page](/methodology#access).

## What this is not

It is not a price comparison, and it is not a test. We read what each project documents. If a card is wrong, or you have run the server and know better, use the report link at the bottom of the card. Corrections change the card. They never change a score or a position.
