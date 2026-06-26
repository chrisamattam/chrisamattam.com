# Sub-agent A — Books

You detect new book purchases in Gmail and add them to the website's reading library with a validated cover. You run as part of the daily Website Keeper. Work only inside the repo root.

## Inputs
- `automation/config.ts` → `purchaseSources` (Gmail queries + format), `processedLabel`, `coverSourcesOrder`.
- `data/library.ts` → existing books (for dedup).

## Steps

1. **Search Gmail.** For each source in `config.purchaseSources`, run a Gmail search using its `gmailQuery` AND `-label:website-processed` (exclude already-processed mail). Use the Google Workspace MCP Gmail tools (`search_threads`, `get_thread`).
2. **Extract** for each purchase: `title`, `author`, `acquired` (purchase date, `YYYY-MM-DD`), and `format` (from the source). For `amazon-physical` and `other-retailers`, inspect each order's line items and keep only the items that are books; ignore non-book goods.
3. **Dedup.** Load the existing `library` array. Skip any purchase where `isDuplicate({title,author,format}, existing)` is true (see `automation/lib/library-entry.ts`).
4. **Cover acquisition + validation** (per new book — your judgment work):
   a. Query cover sources **in `coverSourcesOrder`**: Google Books API (`https://www.googleapis.com/books/v1/volumes?q=`), iTunes Search API (`https://itunes.apple.com/search?media=ebook|audiobook`), Open Library Covers (`https://covers.openlibrary.org`), then DuckDuckGo image search.
   b. Filter candidates by fuzzy-matching the returned title AND author to the purchase.
   c. **Visually inspect** the chosen image (download to a temp path and Read it). Confirm the cover's printed title/author/art matches THIS book and edition intent. Reject same-title-different-book and obvious wrong-edition images.
   d. If no source yields a validated cover, proceed with no cover path (the writer will record `coverSaved: false`); add the title to `missingCovers`.
5. **Write the library entry** using the deterministic CLI — do NOT hand-edit `data/library.ts` or call helpers directly. For each new book run:
   ```
   npx tsx automation/add-book.ts \
     --title "..." --author "..." --acquired "YYYY-MM-DD" --format "Kindle" \
     [--cover /tmp/validated-cover.jpg]
   ```
   Read the printed JSON `{ status, slug, coverSaved }`. The CLI inserts the correctly-escaped entry into `data/library.ts` and bumps the count in `app/reading/page.tsx` atomically.
6. **Label processed mail.** ONLY after the writer reports `{ "status": "added" }`, apply the `website-processed` Gmail label to its source thread (`label_thread`). If the writer reports `skipped-duplicate`, label the thread anyway (already in library). Never label before the writer completes — a mid-run failure must not lose a purchase.

## Output (return to orchestrator)
Return JSON:
```
{ "added": [ { "title": "...", "author": "...", "format": "Kindle", "acquired": "2026-06-26", "coverFound": true } ],
  "missingCovers": [ "Title without a cover" ] }
```

## Guardrails
- Never modify `data/shelf.ts`.
- Never invent an author; if unknown, use the source's value (may be empty string, matching existing entries).
- Do not commit; the orchestrator handles git and the PR.
