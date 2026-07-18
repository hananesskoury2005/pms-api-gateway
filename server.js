require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config/services');

const app = express();

app.use(cors());
app.use(express.json());

// --- Health check global ---
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway',
    status: 'running',
    port: config.port,
    services: Object.entries(config.services).map(([name, svc]) => ({
      name,
      prefix: svc.prefix,
      url: svc.url,
    })),
  });
});

// --- Health check de chaque service ---
app.get('/api/health', async (req, res) => {
  const results = {};

  await Promise.all(
    Object.entries(config.services).map(async ([name, svc]) => {
      try {
        const response = await fetch(`${svc.url}/`);
        results[name] = { status: 'up', url: svc.url };
      } catch {
        results[name] = { status: 'down', url: svc.url };
      }
    })
  );

  const allUp = Object.values(results).every(r => r.status === 'up');
  res.status(allUp ? 200 : 503).json({ status: allUp ? 'all_up' : 'partial', services: results });
});

// --- Proxy vers chaque service ---
Object.entries(config.services).forEach(([name, svc]) => {
  app.use(
    svc.prefix,
    createProxyMiddleware({
      target: svc.url,
      changeOrigin: true,
      pathRewrite: (path) => path.replace(new RegExp(`^${svc.prefix}`), ''),
      onError(err, req, res) {
        console.error(`[Gateway] Erreur proxy ${name}: ${err.message}`);
        res.status(502).json({
          error: `Service ${name} indisponible`,
          service: name,
          target: svc.url,
        });
      },
      onProxyReq(proxyReq, req) {
        console.log(`[Gateway] ${req.method} ${req.originalUrl} -> ${svc.url}${req.url.replace(new RegExp(`^${svc.prefix}`), '')}`);
      },
    })
  );
});

// --- Route non trouvée ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    availablePrefixes: Object.values(config.services).map(s => s.prefix),
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`API Gateway démarré sur le port ${PORT}`);
  Object.entries(config.services).forEach(([name, svc]) => {
    console.log(`  ${svc.prefix} -> ${svc.url}`);
  });
});
