const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const iconGeneratorRoutes = require('./routes/iconGenerator');
const { apiLimiter } = require('./middleware/rateLimiter');
const { getCacheStats } = require('./services/cacheService');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  const cacheStats = getCacheStats();
  res.json({ 
    status: 'ok', 
    message: 'Icon Generator API is running',
    version: '1.0.0',
    cache: {
      keys: cacheStats.keys,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hits > 0 
        ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
        : '0%'
    }
  });
});

app.use('/api', iconGeneratorRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
