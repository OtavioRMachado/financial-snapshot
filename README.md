# Financial Tracker

A private, local-only monthly expense tracker. No accounts, no database, no
server-side storage — everything lives in your browser's `localStorage`.

## Run

```sh
npm install
npm run dev
```

Vite opens http://localhost:5173 automatically.

## Features

- **Monthly view** — see every expense for the selected month; navigate with
  the arrows in the header, or "Jump to current month".
- **Budget overview (top-left)** — progress bar of total spent vs. monthly
  salary, colored by health (green → amber → red).
- **Per-category breakdown (top-right)** — one bar per category, sorted by
  utilization, highlighting anything over budget.
- **Quick add** — a compact form always visible below the charts. Press
  <kbd>N</kbd> anywhere to focus the amount field, then <kbd>Enter</kbd> to
  submit. Category and date persist between entries to make adding several
  expenses in a row fast.
- **Budget settings** — set your salary and per-category budgets from the
  "Budget" button in the header. Changes apply only to the selected month.
- **Automatic rollover** — when a new month starts (or you navigate to a
  future month), it's seeded with the salary and category budgets from the
  most recent existing month. Expenses are not copied.
- **Currency** — pick between EUR, USD, BRL, GBP from the header.

## Data & privacy

All data is stored under the `financial-tracker::v1` key in your browser's
`localStorage`. It never leaves your machine. Clearing browser data will
erase it — export/backup is not built in yet.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (writes to `dist/`)
- `npm run preview` — serve the production build locally
- `npm run typecheck` — TypeScript check only

## Deploy to GitHub Pages

The repo ships a workflow at `.github/workflows/deploy.yml` that builds on every
push to `main` and publishes to GitHub Pages. Setup takes about a minute:

1. **Push the repo to GitHub.** The repo must be **public** (Pages requires a paid
   plan for private repos).
2. In your repo, go to **Settings → Pages**, and set **Source** to **GitHub Actions**.
   No branch selection needed — the workflow handles it.
3. Push to `main` (or run the `Deploy to GitHub Pages` workflow manually from the
   Actions tab). First deploy takes ~1 minute.
4. Your site is live at `https://<username>.github.io/<repo-name>/`.

The workflow autodetects the correct base path from the repo name, so it works
whether the repo is called `financial-tracker`, `money`, or `<username>.github.io`
(user page — served at the root).

If you fork/clone and want to try locally with the production base path:

```sh
VITE_BASE_PATH=/financial-tracker/ npm run build
npm run preview
```

### About data on Pages

Data lives in `localStorage`, which is tied to the origin
(`https://<user>.github.io`). It follows the domain, not the code. If you switch
GitHub accounts or move to a custom domain, use the built-in **Export / Import**
(header → database icon) to migrate your data.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · lucide-react icons.

## License

[MIT](./LICENSE) — do what you like, keep the notice.

## Support

If this tool is useful to you, you can [buy me a coffee ☕](https://buymeacoffee.com/otavio).
