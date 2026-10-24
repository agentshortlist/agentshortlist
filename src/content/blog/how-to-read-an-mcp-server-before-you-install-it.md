---
title: How to read an MCP server before you install it
description: Ten minutes of reading before you install an MCP server: what it can change, what it sends out, how to limit it and whether anyone maintains it.
date: 2026-10-19
tags: guide, security
---

An MCP server lets a model do things on your behalf: touch your files, query your database, drive your browser, call your accounts. Most of us install one by pasting a snippet from the README and moving on. A short read first is cheap, and it settles six questions. They are the same six we answer on every [verified card](/verified).

This isn't a security audit. It's a way of knowing what you've agreed to.

## 1. What can it change?

Go through the list of tools and sort them into reading, writing and running things. Look hard at anything called delete, update, execute or write.

Two cases from our cards. Desktop Commander reads and writes files and runs terminal commands with your user's permissions, and its own [security policy](https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md) says its restrictions are guardrails, not a sandbox; it points to Docker or a virtual machine for real isolation. The [MySQL MCP server](https://github.com/designcomputer/mysql_mcp_server/blob/main/src/mysql_mcp_server/server.py) has an `execute_sql` tool that accepts `INSERT`, `UPDATE` and `DELETE` with autocommit on, and we found no read-only mode in the source.

Neither is a flaw by itself. They just do what they say, and you should know that before a model starts using them.

## 2. What does it send out?

![Chrome DevTools MCP sends usage statistics to Google by default; --no-usage-statistics and --no-performance-crux turn it off (README checked 19 October 2026)](/blog/chrome-devtools-mcp-usage-stats.png "1200x675")

Some servers run entirely on your machine. Some call a hosted service. Some collect telemetry. READMEs rarely lead with this, so search them for "telemetry", "analytics", "usage" and "privacy".

Chrome DevTools MCP collects usage statistics by default, and its performance tools can send trace URLs to Google's CrUX API. Two flags switch that off, `--no-usage-statistics` and `--no-performance-crux`, and the [README](https://github.com/ChromeDevTools/chrome-devtools-mcp#readme) documents both. Context7 is a hosted service, so your queries go to it by design.

If the docs say nothing, write "not stated" next to it. That's information too.

## 3. Which secrets does it want, and where do they end up?

Find the environment variables it expects. Then look at how you're passing them. A token typed straight into a config file tends to end up in backups, screenshots and git history.

Use an environment variable, your client's secret input or a secrets manager. Our [config checker](/check) flags literal secrets in a pasted configuration; it runs in your browser and sends nothing anywhere.

## 4. Can you limit it?

This is the check that changes the most. Look for a read-only mode, a way to expose fewer tools, an isolation flag, an official Docker image.

The GitHub MCP server has a read-only mode, set through an environment variable ([README](https://github.com/github/github-mcp-server#read-only-mode)):

```
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \
  -e GITHUB_READ_ONLY=1 \
  ghcr.io/github/github-mcp-server
```

Playwright MCP has `--isolated`, which keeps the browser profile in memory instead of saving your logins to disk. MongoDB's server takes `--readOnly`. DBHub takes `readonly = true` on its `execute_sql` tool.

When a server offers nothing, limit it one layer down. For the MySQL server above, that means connecting with a database user that can only `SELECT`.

## 5. Is anyone looking after it?

Check the last release and the last push, and then the issues. Big projects always have many open ones, so the count alone says little. What matters is how many have been waiting for months and whether anyone answers.

On 19 October 2026 we counted the open issues created before 20 July. Playwright MCP had 0 of 4. n8n-mcp had 16 of 64, Chrome DevTools MCP 46 of 173, the GitHub MCP server 112 of 380 and Desktop Commander 126 of 311. Those are signals to look closer, not verdicts; a popular project simply collects more.

Also look for a lockfile, and for whether the project points to something that replaces it. The Playwright MCP README recommends Playwright CLI with Skills for coding agents, because it avoids loading large tool schemas into the model's context.

## 6. What advisories exist?

[OSV.dev](https://osv.dev) collects published security advisories by package. Search for the package, not the repository, and read which versions each advisory affects.

Two warnings. A package with no advisories isn't necessarily safe; it may just be less examined. And pin the version you run, because "latest" changes under you. The Playwright MCP package has one published advisory, for versions before 0.0.40. If you pinned 0.0.35 a while ago, you're inside it.

## The short version

List what it can change. Search for what it sends out. Keep secrets out of the file. Turn on whatever limits it offers. Check how it's maintained and whether it has a successor. Look up its advisories and pin a version.

The last four steps are already done for 54 servers on the [verified cards](/verified), and you can test your own setup with the [config checker](/check). If you spot a mistake on a card, send us the source and we'll fix it.
