---
title: Two Kubernetes MCP servers, two kinds of safe
description: Both Kubernetes MCP servers offer a safer mode: one is documented read-only, the other non-destructive. What each README says and where to put the limit.
date: 2026-10-21
tags: security, kubernetes
---

On 21 October we added two Kubernetes MCP servers to the [verified cards](/verified): [containers/kubernetes-mcp-server](/agents/kubernetes-mcp-server) and [Flux159/mcp-server-kubernetes](/agents/mcp-server-kubernetes). Both let an AI client manage a cluster. Both have a mode meant to make that less risky. The two modes do different things, and one of them is easy to misread.

## What each one calls safe

| | containers | Flux159 |
|---|---|---|
| Setting | `read_only = true` | `ALLOW_ONLY_NON_DESTRUCTIVE_TOOLS=true` |
| What stays on | Read operations | Reads, plus create and update |
| What goes off | Writes | Delete, uninstall, cleanup, node management, `kubectl_generic`, `exec_in_pod` |
| Where you set it | A TOML file passed with `--config` | An environment variable |
| Sensitive data | `denied_resources` can block whole types, such as Secrets | Masks values in `kubectl get secrets` output; logs are not covered |

Sources: the [containers README](https://github.com/containers/kubernetes-mcp-server#readme) and the [Flux159 README](https://github.com/Flux159/mcp-server-kubernetes#readme), read on 21 October 2026.

## Settings that live in a file

The containers server keeps its runtime settings in a TOML file, not in command-line flags (the README adds that existing environment variable names also work). That means a client configuration that only shows `--config /some/path` tells you nothing about whether read-only is on. You have to open the file.

The README's example file sets `read_only = true`, a short list of toolsets and a `denied_resources` entry for Secrets. That's a reasonable starting point, and it's three lines you can check.

## A mode named "readonly" that isn't

Flux159's README has an example configuration whose entry is called `kubernetes-readonly`. The only thing it sets is `ALLOW_ONLY_NON_DESTRUCTIVE_TOOLS`.

That flag removes `kubectl_delete`, uninstalling Helm charts, the cleanup tools, node management (which can drain nodes), `kubectl_generic`, which runs any kubectl command, and `exec_in_pod`. What it keeps is `kubectl_apply`, create, scale, patch, rollout and Helm install and upgrade. An agent in that mode can still change a Deployment or roll out a different image.

Non-destructive is a real protection against deleting things. It is not read-only. If you copy that example because of its name, you won't get what the name says.

There is a stricter switch, but it is not in the README. In the project's `src/index.ts` on 21 October 2026 we found `ALLOW_ONLY_READONLY_TOOLS=true`, which keeps eight tools: get, describe, logs, context, reconnect, explain, list API resources and ping. We haven't run it, and since the README doesn't document it we wouldn't build on it without asking the maintainer. If you want read-only here, enforce it in the cluster.

## What neither README settles

The containers README doesn't say, in the lines we read, whether `read_only = true` also stops `pods_exec`, the tool that runs a command inside a pod. It's the first thing we'd test.

The same server has a `configuration_view` tool that returns your kubeconfig as YAML. Depending on how you authenticate, that file can hold credentials.

We haven't run either server against a cluster. Everything above is what the documentation says. Whether a read-only mode holds when something actually tries to write is on our list to test.

## Where we'd put the limit

This part is our view, not the projects'. Whichever server you pick, set the limit in the cluster as well. Give the server a ServiceAccount that can only get, list and watch, and the mode flag becomes a second layer instead of the only one.

The containers README points to a [setup guide](https://github.com/containers/kubernetes-mcp-server/blob/main/docs/getting-started-kubernetes.md) for a production setup with a dedicated ServiceAccount and read-only access, which is exactly that.

## How they're kept up

- **containers:** v0.0.67 from 18 September. 65 open issues, 43 of them older than 20 July. OSV.dev lists no advisories for its npm and PyPI packages or its Go module.
- **Flux159:** v4.1.9 from 2 October. 9 open issues, 6 older than 20 July. OSV.dev lists five advisories for the npm package; none affects 4.1.9, the latest. Pin the version you reviewed.

Nothing here is an audit. It's what the documentation said on 21 October. If a line is wrong, send us the source and we'll fix it. Both cards, with a source on every line: [containers](/agents/kubernetes-mcp-server) and [Flux159](/agents/mcp-server-kubernetes).
