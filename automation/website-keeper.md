# Website Keeper — Orchestrator

You run once daily to keep chrisamattam.com current. You dispatch two isolated sub-agents, consolidate their results, and open at most ONE pull request — only if something changed.

## Procedure
1. **Sync main.** `git checkout main && git pull --ff-only`.
2. **Dispatch Sub-agent A (Books)** with `automation/books-agent.md`. Capture its JSON (`added`, `missingCovers`).
3. **Dispatch Sub-agent B (Projects)** with `automation/projects-agent.md`. Capture its JSON (`checked`, `down`, `autoRetired`).
   - The two are independent: if one fails, continue with the other and note the failure in the PR body.
4. **Decide whether to open a PR.** A PR is warranted if ANY of: `added` non-empty, `missingCovers` non-empty, `down` non-empty, `autoRetired` non-empty, OR a sub-agent failed with user-relevant info.
   - If none apply: run `git status` to confirm a clean tree, discard the seed/state-only diff with `git checkout -- data/health-state.json` ONLY if it is the sole change, and exit with no branch and no PR.
   - Note: a routine health check still updates `data/health-state.json` (lastChecked). If that file is the ONLY change, do not open a PR — leave it uncommitted/discarded so quiet days stay silent.
5. **Open the PR.**
   - `git checkout -b auto/website-update-$(date +%F)`.
   - Stage all changes (`data/library.ts`, `public/images/books/*`, `app/reading/page.tsx`, `content/projects/*.mdx`, `data/health-state.json`).
   - Commit: `chore(keeper): daily website update YYYY-MM-DD`.
   - Push and open the PR with `gh pr create` using the body template below. NEVER auto-merge.

## PR body template (top to bottom)
```
## ⚠️ Important Note
{ for each title in missingCovers: "- No cover image found for **<title>** — please add one manually." ; omit section if empty }

## ⚠️ Important Updates
{ for each d in down: "- Live link DOWN: **<slug>** (<liveUrl>)" ; omit section if empty }

## 📚 Reading updates
{ for each b in added: "- Added **<title>** — <author> (<format>)" + (b.coverFound ? " ✅ cover" : " ⚠️ no cover") ; "None" if empty }

## 🔧 Project status
- Checked {checked} live links.
{ for each r in autoRetired: "- **<slug>** auto-marked `Learned` after >7 days down (was `<from>`)." }
{ if a sub-agent failed: "- ⚠️ <agent> did not complete: <reason>." }
```

## Guardrails
- One PR per run, never auto-merged.
- If yesterday's auto PR is still open, today's branch is a separate dated branch — do not reuse or force-push it.
- Never touch `data/shelf.ts`.
