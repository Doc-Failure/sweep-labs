const express = require('express');
const fs = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Cache for stats calculation
let cache = {
  mtime: null,
  stats: null
};

// GET /api/stats
router.get('/', (req, res, next) => {
  try {
    // Fast metadata check - no file reading!
    const fileStats = fs.statSync(DATA_PATH);
    const currentMtime = fileStats.mtime.getTime();

    // Check if data has changed using modification time
    if (cache.mtime === currentMtime && cache.stats) {
      // Data hasn't changed, return cached stats (instant!)
      return res.json(cache.stats);
    }

    // File changed - read and recalculate
    fs.readFile(DATA_PATH, (err, raw) => {
      if (err) return next(err);

      // Compute stats
      const items = JSON.parse(raw);
      const stats = {
        total: items.length,
        averagePrice: mean(items.map(item => item.price))
      };

      // Update cache with new modification time
      cache.mtime = currentMtime;
      cache.stats = stats;

      res.json(stats);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;