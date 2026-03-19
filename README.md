# Finance ISO 31000 Dashboard

A static GitHub Pages dashboard for executive finance risk reporting.

## What's included

- Multi-year trend charts for:
  - Workers' comp spend
  - Contractor costs
  - Union labor costs
  - Workers' comp and labor rate trends
- Synthetic incident analytics across:
  - HR
  - Finance
  - Risk Management
  - Safety
  - Compliance
  - Procurement
- Contract review calendar with:
  - review dates
  - days remaining
  - risk flags
  - items of note
- Searchable incident register

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the root of the repo.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` and `/ (root)`
5. Save. GitHub will publish the site.

## Files

- `index.html`
- `style.css`
- `script.js`
- `data.json`

## Notes

- The dashboard uses synthetic data for prototype/demo purposes.
- To switch to real data, replace values in `data.json`.
