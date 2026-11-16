---
title: "We called the write tools with read-only on. The setting held; ClickHouse's extra guard did not."
seo_title: "Read-only MCP settings tested at call time"
description: We called write tools on Blender, ClickHouse and Grafana with the read-only setting off and on. The main setting held in all three. ClickHouse's destructive-statement guard let a table be emptied.
date: 2026-11-16
tags: testing, read-only, tool-calls
---

Our [last post](/blog/five-read-only-settings-shrink-an-mcp-tool-list-and-two-do-not) listed tools and called none. It said two settings, Blender's safe mode and ClickHouse's write setting, change nothing in what the server announces, and that Grafana still lists `grafana_api_request` with `--disable-write`. Readers asked the obvious question: what happens when you call the write tools with the setting on?

So we called them. In three servers the setting held. One extra guard in ClickHouse did not stop everything, and its own description says it is not meant to.

![Write attempts with the setting on: ClickHouse 7 of 7 stopped, Grafana 6 of 6 stopped, Blender 12 of 12 risky scripts stopped and 3 harmless ones passed, ClickHouse with writes on stopped 5 keyword forms and let a TTL change, EXCHANGE and RENAME through.](/blog/write-calls-with-the-setting-on.svg "1200x675")

## What we ran

On 16 November 2026, in Docker, with synthetic data and no real credentials. Each server ran twice: first with the setting off, to see that the write works, then on. ClickHouse and Grafana ran against disposable instances (ClickHouse 24.8, Grafana 11.6.0) with a throwaway account in an isolated network. Blender has no instance here: we ran the real MCP server against a fake socket that records what reaches it and executes nothing. If a script shows up in that record, the server let it through.

## ClickHouse 0.7.0: the setting held, at the database

With `CLICKHOUSE_ALLOW_WRITE_ACCESS` off, a read worked and the seven writes we tried failed (insert, create table, alter add column, alter delete, drop table, and two attempts to switch the mode off with `SETTINGS readonly = 0`). The errors came from ClickHouse itself (`READONLY`, code 164), not from the MCP server. The tables were the same before and after.

That is the strongest kind of result: the server sends the read-only setting with every query and the database enforces it.

## Blender 2.2.4: safe mode stopped 12 of 15 scripts

Safe mode checks the script before anything is sent to Blender. With it off, all 15 scripts reached the socket. With it on, 12 did not: direct calls to `os`, `open` and `subprocess`; scripts built at run time (a name joined from two strings, `__import__`, base64 then `exec`, `importlib`); an escape through `__subclasses__`; a frame handler; a text datablock; and the second step of two split calls. Three went through: a harmless script, the first and harmless half of the split pair, and saving a `.blend` file, which the documentation allows.

A rejection comes back as a normal tool result with the text "Rejected by safe mode", not as an error. A client that only checks for errors will read it as success.

Limits: nothing was executed, the 15 scripts are ours, and the project's own README says safe mode guards what the model can be talked into, not a sandbox around Blender.

## Grafana 2.1.1: the one tool that stayed listed is limited to GET

With the flag off, a POST through `grafana_api_request`, `create_folder` and a DELETE all worked. With `--disable-write`, GET worked and POST, PUT, PATCH, DELETE and TRACE were rejected with "only GET requests are permitted", including a lowercase `post`. The `body` field no longer exists in that mode. A `GET` carrying an `X-HTTP-Method-Override: DELETE` header went through as a plain GET and changed nothing. Calling `create_folder`, which is not listed, returned "unknown tool". The folder we tried to delete was still there.

So `grafana_api_request` stays in the list but the server rewrites it: only GET, no body, and its hint changes from "destructive" to "read-only".

## ClickHouse's extra guard did not stop everything

Turn writes on and ClickHouse adds a second gate: `CLICKHOUSE_ALLOW_DROP`. Without it, statements with `DROP`, `TRUNCATE`, `DELETE` and `UPDATE` are refused. It stopped `ALTER ... DELETE`, `DROP TABLE` (also with a comment where the space goes), `TRUNCATE TABLE` and `ALTER ... DROP PARTITION`.

It did not stop `ALTER TABLE ... MODIFY TTL ts + INTERVAL 1 SECOND`. The table had four rows before it and none after, with no destructive keyword in the statement. `RENAME TABLE` and `EXCHANGE TABLES` also went through.

This is documented. The tool's description calls the gate "a best-effort accident guard, not a security boundary" and tells you to restrict the database user's grants. It only applies if you turned writes on yourself. But it is worth knowing that the second switch is a text filter, not a permission.

## Do the annotations match?

Two readers asked whether the `readOnlyHint` annotations agree with the setting. We counted them across the saved tool lists. In the five servers that shrink their list (Atlassian, Supabase, GitHub, MongoDB, Grafana), no hidden tool says it is read-only, and every tool that stays says so once the setting is on. Supabase's `execute_sql` and Grafana's `generate_deeplink` and `grafana_api_request` change from not read-only to read-only when you turn it on. Blender and ClickHouse set no annotations on any tool.

## What this does not show

One machine, one run of each pass. We did not call Atlassian, GitHub, Supabase or MongoDB: they need a backend or credentials. For Blender we tested the validator, not a live Blender. One ClickHouse version, one Grafana version. The scripts and the lists of calls are in the public repository, under `docs/testing/write-probe`.

If your server hides write tools behind a setting, calling one with it on is a cheap check, and it should run in a throwaway container.
