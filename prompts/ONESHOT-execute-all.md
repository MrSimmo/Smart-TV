You are executing the full Plex-UI rollout in a single 1M-context session. This is the one-shot prompt that builds tickets TKT-00 through TKT-06 sequentially, committing between tickets.

## Boot

1. Read `CLAUDE.md`, `ARCHITECTURE.md`, and EVERY file under `decisions/` (0001 through 0005).
2. Read EVERY ticket under `tickets/` in order: TKT-00, TKT-01, TKT-02, TKT-03, TKT-04, TKT-05, TKT-06.
3. `view` ALL THREE mockups: `design/mockups/moonfin_01_home.png`, `moonfin_02_details.png`, `moonfin_03_library.png`.
4. Print the session-start confirmation line per user-level `~/.claude/CLAUDE.md` section 9.

## Execute

For each ticket in sequence (TKT-00 → TKT-06):

1. Read the corresponding `prompts/TKT-NN-*.md` file in full.
2. Follow the steps in that prompt exactly.
3. Run the ticket's Verification commands. Paste verbatim output.
4. Update PROGRESS.md with the ticket ticked and a one-line summary.
5. Commit using the ticket's conventional-commits subject.
6. If any acceptance criterion cannot be met OR any build/lint command fails, **halt** and write `BLOCKED.md` at the repo root containing:
   - The ticket ID that blocked.
   - Which acceptance criterion failed.
   - The verbatim error output.
   - A one-paragraph hypothesis on the cause.
   Do not improvise around blockers. Do not silently widen the allow-list. Stop.

## Hard rules

- Upstream modifications are restricted to the allow-list in ADR-002. Any modification outside that list is a blocker — write `BLOCKED.md` and stop.
- No `transition: all`, no `backdrop-filter`, no flex `gap`, no `aspect-ratio` CSS property anywhere in Plex code.
- Two distinct focus states (active + focused) per ADR-004 across every interactive element.
- UK English in all comments, commit messages, docs, and PR descriptions.
- Both `npm run build:tizen` and `npm run build:tizen:legacy` must remain clean after every commit.
- Verify each ticket with PASTED verbatim output of the three commands. Never claim success without evidence in the same message.

## After all seven tickets

1. Tag the tip of `plex-ui`: `plex-ui-v0.1.0`.
2. Push tags: `git push origin --tags`.
3. Write a final entry to PROGRESS.md summarising the full rollout.
4. Report the seven commits and the tag back to the human.

This prompt assumes the 1M context can hold the entire repo + mockups + tickets simultaneously. Do not artificially partition. If context pressure becomes real, prioritise: tickets > mockups > ADRs > everything else.
