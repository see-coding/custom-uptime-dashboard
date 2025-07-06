const express = require('express');
const cors = require('cors');
const axios = require('axios');
const tls = require('tls');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const dataDir = path.join(__dirname, 'data');
const domainsFile = path.join(dataDir, 'domains.json');

const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(domainsFile)) {
    fs.writeFileSync(domainsFile, JSON.stringify(['example.com'], null, 2));
  }
};

const readDomains = () => {
  try {
    const raw = fs.readFileSync(domainsFile, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return ['example.com'];
  }
};

const writeDomains = (domains) => {
  fs.writeFileSync(domainsFile, JSON.stringify(domains, null, 2));
};

ensureDataFile();

app.use(cors());
app.use(express.json());

app.get('/api/domains', (req, res) => {
  res.json(readDomains());
});

app.post('/api/domains', (req, res) => {
  if (!Array.isArray(req.body.domains)) {
    return res.status(400).json({ error: 'domains array required' });
  }
  writeDomains(req.body.domains);
  res.json({ success: true });
});

app.get('/api/status', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Missing domain parameter' });
  }

  const check = async (url) => {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.status >= 200 && response.status < 400;
    } catch (err) {
      return false;
    }
  };

  const getSSLCertExpiry = (host) => {
    return new Promise((resolve) => {
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
  };

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

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
