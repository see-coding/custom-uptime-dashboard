require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const tls = require('tls');
const { createStorage } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3001;
const STORAGE_MODE = process.env.STORAGE_MODE || 'memory';

app.disable('x-powered-by');
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : true,
  })
);
app.use(express.json());

const storage = createStorage({
  mode: STORAGE_MODE,
  filePath: process.env.STORAGE_FILE,
  databaseUrl: process.env.DATABASE_URL,
  logger: console,
});

const normalizeDomain = (input) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, '');
  const withoutPath = withoutProtocol.split('/')[0];
  const withoutPort = withoutPath.split(':')[0];
  return withoutPort;
};

const check = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return response.status >= 200 && response.status < 400;
  } catch (err) {
    return false;
  }
};

const getSSLCertExpiry = (host) =>
  new Promise((resolve) => {
    const socket = tls.connect(443, host, { servername: host }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (cert && cert.valid_to) {
        const date = new Date(cert.valid_to);
        resolve(date.toISOString().split('T')[0]);
      } else {
        resolve(null);
      }
    });
    socket.on('error', () => resolve(null));
    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve(null);
    });
  });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: storage.mode });
});

app.get('/api/status', async (req, res) => {
  const rawDomain = req.query.domain;
  const domain = normalizeDomain(rawDomain);

  if (!domain) {
    return res.status(400).json({ error: 'Missing domain parameter' });
  }

  try {
    let reachable = await check(`https://${domain}`);
    if (!reachable) {
      reachable = await check(`http://${domain}`);
    }

    const sslDate = await getSSLCertExpiry(domain);

    res.json({
      status: reachable ? 'ok' : 'down',
      ssl: sslDate || 'unbekannt',
    });
  } catch (err) {
    res.json({ status: 'down', ssl: 'unbekannt' });
  }
});

app.get('/api/domains', async (req, res) => {
  try {
    const domains = await storage.list();
    res.json({ domains });
  } catch (err) {
    res.status(500).json({ error: 'Domains konnten nicht geladen werden.' });
  }
});

app.post('/api/domains', async (req, res) => {
  const domain = normalizeDomain(req.body?.domain);
  if (!domain) {
    return res.status(400).json({ error: 'Domain fehlt.' });
  }
  try {
    await storage.add(domain);
    return res.status(201).json({ domain });
  } catch (err) {
    return res.status(500).json({ error: 'Domain konnte nicht gespeichert werden.' });
  }
});

app.put('/api/domains/:domain', async (req, res) => {
  const oldDomain = normalizeDomain(req.params.domain);
  const newDomain = normalizeDomain(req.body?.domain);
  if (!oldDomain || !newDomain) {
    return res.status(400).json({ error: 'Domain fehlt.' });
  }
  try {
    await storage.update(oldDomain, newDomain);
    return res.json({ domain: newDomain });
  } catch (err) {
    return res.status(500).json({ error: 'Domain konnte nicht aktualisiert werden.' });
  }
});

app.delete('/api/domains/:domain', async (req, res) => {
  const domain = normalizeDomain(req.params.domain);
  if (!domain) {
    return res.status(400).json({ error: 'Domain fehlt.' });
  }
  try {
    await storage.remove(domain);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Domain konnte nicht geloescht werden.' });
  }
});

const start = async () => {
  await storage.init();
  app.listen(PORT, () => {
    console.log(`Server laeuft auf http://localhost:${PORT}`);
    console.log(`Storage: ${storage.mode}`);
  });
};

start();
