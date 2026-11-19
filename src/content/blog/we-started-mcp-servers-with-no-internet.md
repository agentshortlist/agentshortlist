---
title: "We started 41 MCP servers with no internet. Eight tried to reach a telemetry address, three only when we shut them down."
seo_title: "MCP server telemetry, measured offline in Docker"
description: We started 41 MCP servers in a Docker network with no way out and logged every name they asked for. Eight reached for an address their own opt-out silences.
date: 2026-11-19
tags: testing, telemetry, privacy
---

Our [read of 25 MCP servers](/blog/we-read-25-mcp-servers) listed which ones document telemetry. A documented setting says what the project intends. It does not show what the server does when you start it. So we started 41 of them with no way to reach the internet and wrote down every name they asked for.

Eight reached for an address that the project's own opt-out switches off. Three of those did it only when we shut the server down. Twenty-one asked for nothing at all.

![41 MCP servers started offline: 8 reached an address their opt-out silences (5 at startup, 3 only at shutdown), 21 contacted nothing, 7 contacted a package registry or GitHub, 4 contacted their own service or a model host, 1 gave no result.](/blog/mcp-servers-started-offline.svg "1200x675")

## What we ran

On 18 and 19 November 2026, in Docker. First step, with internet: install each package without running it, so nothing is sent by us or by them. Second step, on a network with no route out: start the server, make the MCP handshake, ask for the tool list, wait 40 seconds, then close it.

Inside that network every name resolves to a small local program that writes down what was asked: the DNS name, the server name in the TLS handshake, and for plain HTTP the method, host and path. It never completes TLS, so it sees names and nothing else. Before each batch we ran a control (one TLS and one HTTP request to made-up names); if the log did not show both, the run stopped.

No tool was called. Credentials were filler values. Each server ran once with its defaults, and once more with its documented opt-out where one exists. Azure MCP did not start in our first image. For the second run we added the system libraries it needs and set `DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1`; both changes are ours, not the project's.

## Eight that reached for a telemetry address

For each of these, the contact disappeared when we turned on the opt-out the project documents.

| Server | Name it asked for by default | When | With the opt-out |
| --- | --- | --- | --- |
| Blender MCP 2.2.4 | a Supabase project host | seconds after the tool list | none (`DISABLE_TELEMETRY=true`) |
| Chrome DevTools MCP 1.12.0 | `play.googleapis.com` | at startup | gone (`--no-usage-statistics`) |
| Apify MCP 0.20.1 | a Sentry ingest host | at startup | gone (`--telemetry-enabled=false`) |
| Desktop Commander 0.3.1 | `telemetry.desktopcommander.app` and a Google Cloud Run proxy | at startup | both gone (`telemetryEnabled: false` in its config file) |
| Azure MCP 4.0.0-beta.4 | an Application Insights host in `centralus` | at startup | gone, but see below (`AZURE_MCP_COLLECT_TELEMETRY=false`) |
| Grafana MCP 2.1.1 | `stats.grafana.org` | only at shutdown | none (`GRAFANA_USAGE_STATS=disabled`) |
| MongoDB MCP 3.1.0 | `cloud.mongodb.com` | only at shutdown | none (`MDB_MCP_TELEMETRY=disabled`) |
| n8n-mcp 2.99.1 | `telemetry.n8n-mcp.com` | only at shutdown | none (`N8N_MCP_TELEMETRY_DISABLED=true`) |

All eight document their telemetry and how to turn it off, so this is not a hidden behaviour. What a test like this adds is when it happens. Three send nothing while they run and only show up the moment the process is closed. Grafana's README says it reports every four hours and once on shutdown, which matches what we saw. A test that starts a server and watches for a minute would have marked all three clean.

Two caveats on the table. Apify could not finish its handshake, because it calls its own API at startup and our setup refuses that connection, so the Sentry contact may be an error report caused by the test. The opt-out removes it either way. And Azure was not clean: with telemetry off, a second Application Insights host (`westus`) was still contacted when the process closed. We do not know what that connection carries.

## Twenty-one that asked for nothing

Browser Tools, Codebase Memory, Context7, DBHub, Exa, Excel, Fetch, Figma, Firecrawl, Git, Google Workspace, Kubernetes, MySQL, Notion, Perplexity, Playwright, Redis, Sentry, the reference Everything and Memory servers, and Tavily asked for no name during startup, the 40 seconds or shutdown.

That is a result for this test only. We called no tool, and a server could send something on first use or in a batch every few hours, as Grafana says it does.

## What was left over

Seven contacted a package registry or GitHub: Context Mode (npm), Atlassian, ClickHouse, MotherDuck, Home Assistant and Serena (PyPI; Serena also asked for `oraios-software.de`) and Toolbox (`api.github.com`). That fits a version check or a package lookup, but we cannot tell which. Chrome DevTools MCP also asked for `registry.npmjs.org` with its opt-out on, so the opt-out does not cover it. Desktop Commander still asked for `desktopcommander.app` and `googlechromelabs.github.io` with its opt-out on; we do not know what for.

Four contacted their own service or a model host: Neon, Stripe and Supabase reached their APIs, and Qdrant tried to download an embedding model from Hugging Face. Neon, Stripe and Qdrant never finished their handshake because the test refuses those connections, so this is normal function that the test interrupted. Qdrant also looked up `mobile.events.data.microsoft.com` ten times, with no connection reaching us. It may come from a dependency rather than the server, and we did not trace it.

One server, Bright Data, gave no result: no handshake and no names.

## What this does not show

Names, not content. The test never completes TLS, so it cannot say what is sent, only where the server tried to go. We call a contact telemetry only where the project documents it and its own opt-out silences it; for the rest we say what we saw.

One run per server and setting, on Linux, with a 40 second window plus shutdown. Connections made straight to an IP address, with no DNS lookup, would not appear. Nothing was called, and real credentials could change what a server does at startup. The servers are the versions on the dates above.

## What to do with it

If you run any of the eight, set the opt-out from the table; it costs one line. For the rest, the test says only that a closed network saw nothing in this window. The [verified cards](/verified) keep the documented side, and the [config checker](/check) flags servers that document telemetry in the config you paste. The scripts and the summary of both runs are in the public repository, under `docs/testing/telemetry`.
