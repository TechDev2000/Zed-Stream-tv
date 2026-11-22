# ZedStream — Live TV

Live TV / Sports streaming web app (Firebase auth, Pastefy-backed subscription & channel data).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page markup — links `style.css` and `script.js` |
| `style.css` | All styles (theme, layout, responsive, modals) |
| `script.js` | All app logic (auth, subscriptions, channels, sports, PIN, network detection) |

## Run locally

Because it loads external scripts, open it through a local server rather than double-clicking:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown).

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css` and `script.js` to the repo root.
3. Repo **Settings → Pages → Source**: choose `Deploy from a branch`, select the `main` branch and `/ (root)`, then Save.
4. After a minute, the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Notes

- API keys and endpoints (Firebase, Pastefy, sports catalog, channel list) are configured at the top of `script.js` in the `CONFIG` section.
- The Sports page separates matches into **Live Now**, **Playing Today**, and **Upcoming** sections.
- The 18+ PIN is set in `script.js` (`PIN_CODE`).
