# LinkedIn: post "13 database MCP servers: who can write?" (publicar L-V, 8:30-10:00)

If you give an AI client a database, the first question is whether it can change anything.

We checked the 13 database MCP servers among our 54 verified cards:

- 8 document a read-only option.
- 2 document none (MySQL MCP Server and Redis).
- For 3 we could not verify it.

"Documents" means the project's own README says so. It is not a test. For 8 of the 13 we also started the server in Docker, with no credentials, and recorded the tools it announces. We called none of them.

Two things stood out:
- MongoDB started with --readOnly announces 18 tools instead of 27. The 9 that leave are the ones that write.
- ClickHouse announces the same 3 tools with writes on and off: the setting does not show in what the server announces.

A tool count tells you what a server announces, not what it does.

Every run, with its start command, is in our open data (CC BY 4.0).

https://agentshortlist.dev/blog/database-mcp-servers-who-can-write?utm_source=linkedin

Written with the help of an AI assistant, from our own data.
