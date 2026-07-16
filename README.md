# Problem Log

A tiny static frontend for publishing Codeforces problem solve writeups. No build step, no framework — just `index.html`, `style.css`, `script.js`, and a JSON file you edit.

## Adding a writeup

Open `data/problems.json` and add an object to the array:

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
  "writeup": "## Approach\n\nYour writeup in **Markdown**.\n\n```cpp\n// code blocks work too\n```"
}
```

Notes:
- `id` should be unique (contest number + problem index, e.g. `1849D`) — it's used for the URL hash (`#1849D`) so you can link directly to a writeup.
- `rating` drives the color used throughout the site (Codeforces' own rating-tier colors: gray → red).
- `writeup` is a single Markdown string — use `\n` for line breaks, since it's JSON.
- `tags` populate the tag filter dropdown automatically.

Commit and push — that's the whole publishing flow.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo.
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
index.html          the page shell
style.css            all styling
script.js            loads data, renders the list + reader, handles search/filter
data/problems.json   your writeups — edit this to publish
```
