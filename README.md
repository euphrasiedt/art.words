# word → art

Search a word and discover artworks from global museum collections across history.

## Collections

| Museum | Key needed |
|---|---|
| The Metropolitan Museum of Art | No |
| Art Institute of Chicago | No |
| Cleveland Museum of Art | No |
| Victoria & Albert Museum | No |
| Harvard Art Museums | Yes (free) |
| Rijksmuseum | Yes (free) |
| Europeana | Yes (free) |
| Smithsonian | Yes (free) |

## Deploy to Vercel (free)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create word-to-art --public --push
```

### 2. Connect to Vercel
- Go to vercel.com and import your GitHub repo
- Vercel auto-detects the project — no build settings needed

### 3. Add API keys (Settings → Environment Variables)

| Variable | Where to get it |
|---|---|
| `HARVARD_KEY` | harvardartmuseums.org/collections/api |
| `RIJKS_KEY` | data.rijksmuseum.nl/object-metadata/api |
| `EUROPEANA_KEY` | apis.europeana.eu/api/apikey-form |
| `SMITHSONIAN_KEY` | api.data.gov/signup |

All four keys are free. Add whichever you have — the site works without them, just with fewer collections.

### 4. Redeploy
After adding keys, trigger a redeploy from the Vercel dashboard. Done.

## Local development
```bash
npm i -g vercel
vercel dev
```
This runs the API routes locally with your environment variables.
