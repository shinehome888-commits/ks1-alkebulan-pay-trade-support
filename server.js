const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token.' });
  try {
    const response = await fetch('https://ks1-central-auth.onrender.com/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return res.status(401).json({ error: 'Invalid token' });
    const user = await response.json();
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth service unavailable' });
  }
}

app.use('/api/admin', authenticateToken);

app.get('/api/admin/analytics', (req, res) => {
  res.json({ activeUsers: 120, newTrades: 8, eligibilityRate: "75%" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Trade Support' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`✅ Trade Support running on port ${PORT}`);
});
