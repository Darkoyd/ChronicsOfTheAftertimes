# Chronics of the Aftertimes

A terminal you browse with `ls` and `cd`. Its records come from the Obsidian vault (`Darkoyd/Obsidian`), but only notes you mark for publishing.

## Publishing a note

Add an `archive:` key to the note's frontmatter. That key publishes the note, and its value is the note's path in the archive:

```yaml
---
archive: records/kaori/first-raid   # required: in-universe path (lowercase, a-z 0-9 - _ /)
recovered: any text                 # optional: free text (no calendar yet); shown by ls -l, ls -t sorts it as text
source: kaori                       # optional: owner column in ls -l
integrity: 87                       # optional: carried to the site, not displayed yet
---
```

- To unpublish, remove `archive:`. The note leaves the site on the next deploy.
- Only `recovered`, `source` and `integrity` are copied to the site. All other frontmatter (tags, aliases…) stays private.
- `[[Note|alias]]` becomes `alias`, and `[[Note]]` becomes `Note`.
- `%% Obsidian comments %%` are removed.
- The site never reads `.trash`, `.obsidian` or any other dot folder.

## What's published vs. local

```bash
VAULT=~/Documents/Obsidian/SciFi/SciFi npm run sync -- --dry-run --local
```

This lists each published note with its archive path, then each local-only note. If you leave out `--dry-run`, it writes `content/` so you can try the site with `npm run dev`. `content/` is generated, so git ignores it.

## Deploying

`.github/workflows/deploy.yml` checks out the vault, runs the sync, and deploys the static site to GitHub Pages. It runs on:
- a push to `master`
- the **Run workflow** button (it also works in the GitHub mobile app)
- a daily schedule
- a `vault-updated` event that the vault can send

One-time setup:
1. **Settings → Pages → Source:** GitHub Actions.
2. Create a fine-grained token with **Contents: read-only** on `Darkoyd/Obsidian`. Save it in this repo as the secret `VAULT_TOKEN`.
3. Optional, to deploy on every vault push: add `.github/workflows/notify-site.yml` to the vault. Its secret `SITE_TOKEN` is a fine-grained token with **Contents: read and write** on this repo.

```yaml
name: Notify site
on: { push: { branches: [main] } }
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: gh api repos/Darkoyd/ChronicsOfTheAftertimes/dispatches -f event_type=vault-updated
        env: { GH_TOKEN: "${{ secrets.SITE_TOKEN }}" }
```

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # ls/cd self-check
```
