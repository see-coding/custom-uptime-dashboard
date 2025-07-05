const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', ssl: '2025-01-01' });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
