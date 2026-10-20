# AgentShortlist

Evidence you can check before you install an MCP server, plus a data-driven directory of open-source AI agents.

Website: https://agentshortlist.dev

## What is in it

- **[Verified cards](https://agentshortlist.dev/verified)**: for each MCP server, what it can change, what it sends out, how well it is maintained and how to limit it. Every line shows its source (official docs, GitHub, package registry, OSV.dev or "not verified"), with a link and a review date.
- **Published security advisories** from [OSV.dev](https://osv.dev), matched to a package only after confirming the package belongs to the same repository.
- **[Config checker](https://agentshortlist.dev/check)**: paste your MCP configuration to see which documented safety options are missing, whether a pinned version falls in an advisory range and whether a secret is written in plain text. It runs in your browser and sends nothing.
- **[Picker](https://agentshortlist.dev/pick) and [live comparator](https://agentshortlist.dev/compare/live)**: filter servers by what you need and compare two or three line by line.
- **[Rankings](https://agentshortlist.dev/best/coding)** of 163 open-source projects built from public GitHub signals.

## What you can find

AI coding agents, MCP servers, multi-agent frameworks, research agents, browser and computer-use agents, SRE and operations agents, and other open-source AI tools.

## How the rankings work

Projects are grouped by use case and scored on three public signals: GitHub stars, recent repository activity and open-source license. The method is documented at https://agentshortlist.dev/methodology.

The score is a discovery aid. It does not measure software quality, security or production readiness. The verified cards and the config checker are not a security audit or a hands-on test either: they state what each project documents and what its code shows on the review date.

## Why this exists

The ecosystem moves fast and most directories tell you what is popular. They rarely tell you what a server can do on your machine, what it sends out, whether anyone answers its issues or whether it has published security advisories. This project writes that down, with the source for each line.

## Where things live

| Path | What |
|---|---|
| `src/content/verified.ts` | The verified cards, written by hand, with a source and URL per line |
| `src/content/verified-meta.ts` | Structured facts, config checks and settings used by the tools |
| `src/content/advisories.json` | OSV.dev advisories, refreshed with `node scripts/osv-check.mjs` |
| `src/app/` | Next.js App Router pages (`/verified`, `/check`, `/pick`, `/compare/live`, `/best/*`, ...) |
| `scripts/` | Data refresh, snapshots, verification and SEO audit scripts |

## Run it

```bash
npm install
npm run dev                        # http://localhost:3000
npm run build && npm run verify    # verify needs the site running on :3000
```

Optional environment variables: `GITHUB_TOKEN` for the data refresh, `RESEND_*` for the newsletter, `STRIPE_*` for sponsorship, `SYNC_TOKEN` for the sync route. None are needed to browse the site locally.

## Contributing

Corrections, suggestions and new project recommendations are welcome. Please open an issue with:

- The project name and its official repository
- For a correction: the line that is wrong and a link to the primary source
- For a new server: why people install it

See [CONTRIBUTING.md](CONTRIBUTING.md). You can also write to hi@agentshortlist.dev.

## License

- **Code**: MIT, see [LICENSE](LICENSE).
- **Content and data** (`src/content/`, `src/data/`, `docs/`): CC BY 4.0, see [LICENSE-CONTENT.md](LICENSE-CONTENT.md). Reuse it with attribution: credit AgentShortlist and link to https://agentshortlist.dev.
