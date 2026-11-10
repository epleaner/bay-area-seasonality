# Bay Area Seasonality

Run locally with `npm start` (port 3000 by default; set `PORT` to override).

## Cloudflare Workers

The Worker serves the PWA files listed in `.assetsignore` from this repository. Missing extensionless routes return `index.html`; missing paths with extensions return 404. `server.js` is only for local development and is not uploaded as a public asset.

From the repository root, authenticate with `npx wrangler@4 login` and deploy with `npx wrangler@4 deploy`. Configure any production domain separately in Cloudflare after reviewing the deployment; this repository does not provision DNS or secrets.
