# Problem Log

A static frontend for publishing Codeforces problem solve writeups. No build step, no framework — just `index.html`, `style.css`, `script.js`, and a JSON file you edit (or publish to directly from the included tool).

## Adding a writeup

Easiest way: open `tools/index.html` (linked from the site footer), fill in the form, and either copy the generated JSON into `data/problems.json`, or use the "publish directly to GitHub" section to commit it for you.

Manually, add an object like this to the array in `data/problems.json`:

```json
{
  "id": "1849D",
  "contest": "1849",
  "index": "D",
  "title": "Doremy's IQ Test",
  "rating": 2400,
  "tags": ["binary search", "data structures", "greedy"],
  "url": "https://codeforces.com/problemset/problem/1849/D",
  "date": "2026-07-16",
  "verdict": "Accepted",
  "reason": "Why you picked this problem.",
  "problemStatement": "One or two sentences summarizing what's asked.",
  "intuition": "What you thought the approach was, at first.",
  "whyWrong": "Optional — why that first instinct broke, if it did.",
  "conceptsLearned": "Techniques or patterns worth remembering.",
  "approach": "## Approach\n\nYour solution writeup in **Markdown**.\n\n```cpp\n// code blocks work too\n```"
}
```

Field notes:
- `id` is required and must be unique — it powers the URL hash (`#1849D`) for direct links. It's normally built from `contest` + `index`, but if those are missing you can set `id` directly (e.g. for gym problems).
- `contest` / `index` are **optional**. The generator tool auto-detects them from the problem URL, so you usually don't need to touch them.
- `rating` drives the color used throughout the site (Codeforces' rating-tier colors: gray → red).
- `tags` power the tag filter and show as "Topics" on the reader page.
- `reason`, `problemStatement`, `intuition`, `whyWrong`, `conceptsLearned` are all optional — each renders as its own box on the reader page only if present. `whyWrong` is meant to be skipped when your first instinct was actually correct.
- `approach` is the main write-up (required) — Markdown, same as before (just renamed from `writeup`). Older entries using `writeup` still render fine.

Commit and push — that's the whole publishing flow.

## Using the generator tool (`tools/index.html`)

- Paste the Codeforces problem URL first — Contest ID and Index auto-fill from it (you can still edit them, or leave both blank and set a Custom ID instead).
- "try auto-fill title / rating / tags from Codeforces" attempts a best-effort fetch from the public Codeforces API. If your browser blocks the cross-origin request, it fails silently — just fill those three fields in by hand.
- Fill in as many of the boxes (why you picked it, problem statement, intuition, etc.) as you want — only `title`, `url`, and `approach` are required.
- Either copy the generated JSON into `data/problems.json` yourself, or expand "publish directly to GitHub" and it'll commit the change for you (needs a GitHub personal access token scoped to the repo).

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo (must be **public** on the free plan — private repos need GitHub Pro/Team/Enterprise for Pages).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Pick your default branch (e.g. `main`) and `/ (root)` as the folder.
5. Save. Your site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

Any push that updates `data/problems.json` will automatically update the live site — no rebuild needed.

## Running locally

Because the page `fetch`es `data/problems.json`, opening `index.html` directly (`file://`) won't work in most browsers. Serve it locally instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html            the page shell
style.css              all styling
script.js               loads data, renders the list + reader, handles search/filter
data/problems.json      your writeups — edit this to publish
tools/index.html         form-based JSON generator + optional direct GitHub publish
```
