# Contributing

The most useful contribution is a correction with a source.

## Report a mistake in a card

Open an issue with:
1. The server and the line that is wrong.
2. A link to the primary source (README, source file, release, advisory) that shows the right value.
3. The version you checked.

We only change a line when we can point to a source. If something cannot be checked, the card says "Not verified" instead of guessing.

## Suggest a server for a verified card

Open an issue with the repository link. We prioritize servers people actually install. A card needs the project's own documentation and code to be readable; closed-source products are out of scope.

## Code changes

Small pull requests are welcome. Run `npm run lint` and `npx tsc --noEmit` first. For data changes, keep the rule that every line carries a source and a URL (`src/content/verified.ts`).

## What we will not accept

Paid placements, rankings that change because of payment, and claims about a tool without a verifiable source.
