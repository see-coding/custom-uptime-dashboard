const express = require('express');
const cors = require('cors');
const axios = require('axios');
const tls = require('tls');

const app = express();
const PORT = 3001;

app.use(cors());

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
