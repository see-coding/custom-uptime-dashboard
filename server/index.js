const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

  try {
    let reachable = await check(`https://${domain}`);
    if (!reachable) {
      reachable = await check(`http://${domain}`);
    }

    res.json({ status: reachable ? 'ok' : 'down', ssl: '2025-01-01' });
  } catch (err) {
    res.json({ status: 'down', ssl: 'unbekannt' });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
