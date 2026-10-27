# Bay Area Seasonality

The browser-only Bay Area produce guide is published as a Cloudflare Worker with Static Assets. The seven public files are `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`, and `data/produce.json`. `cloudflare/build-assets.js` copies only these files and the asset `_headers` policy into the generated, ignored `cloudflare/dist/` directory. The server, deployment configuration, package metadata, CI files, and any private files are never public assets.

## Develop and deploy

Use Node 24.22.0, Corepack 0.36.0, and Yarn 1.22.22. From `cloudflare/`, run `yarn install --frozen-lockfile`, then `yarn dev` for local development. Restart `yarn dev` after editing a source asset, since the explicit copy runs at startup. `yarn build` copies the public assets and creates Cloudflare Build Output; `yarn cf deploy --prebuilt --dry-run` validates it without credentials or upload. `yarn deploy` deploys that same build using a Cloudflare API token (`CLOUDFLARE_API_TOKEN`). Root `yarn run check` checks JavaScript syntax and the produce JSON. Bump the service worker's cache version when releasing changed public assets so installed clients refresh the cache-first bundle. No Node web server, Docker image, or Railway service is needed.

The GitHub Actions workflow checks and dry-runs on pull requests without deployment credentials; pushes to `main` and manual runs deploy only after the token presence/whitespace gate. The dedicated `CLOUDFLARE_API_TOKEN` repository secret grants Workers Scripts Write on the owning account. The Worker `epleaner-seasonality` serves `https://seasonal.elipleaner.com/` and its `workers.dev` preview; both deploy the same prebuilt artifact.

## Preview smoke checks

Compare the current site and preview using the same browser/session: `/` and `/index.html` load the same guide and public JS/CSS/JSON/icon/manifest/service worker; `/arbitrary-route` responds with index HTML and status 200 without a redirect; `/missing.js`, `/missing.json`, and `/server.js` respond 404 rather than HTML. Confirm the document, JS, CSS, manifest, and service worker revalidate instead of becoming permanently stale; the JSON and icon may cache for one hour. Install the PWA, check service worker activation/update, reload offline, and confirm the saved guide and data work offline. Exercise search (including accented produce), fruit/vegetable/herb/nut filters, sort order, each month in By month, Full chart, and the Now view. Check source links and responsive layout without changing content.
