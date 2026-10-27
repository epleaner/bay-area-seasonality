import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  accountId: '8ee70c4b6325ecf3bdc84838281a61f4',
  worker: {
    name: 'epleaner-seasonality',
    entrypoint: './worker.js',
    compatibilityDate: '2026-10-26',
    workersDev: true,
    domains: ['seasonal.elipleaner.com'],
    env: { ASSETS: bindings.assets() },
    assets: {
      htmlHandling: 'none',
      notFoundHandling: 'none',
    },
    observability: {
      enabled: true,
      logs: { enabled: true },
      traces: { enabled: true },
    },
  },
});
