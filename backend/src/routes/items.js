const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (now async for non-blocking I/O)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q, page } = req.query;
    let results = data;

    if (q) {
      results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
      return res.json({
        items: results,
        pagination: {
          page: 1,
          pageSize: results.length,
          total: results.length,
          totalPages: 1
        }
      });
    }

    const total = results.length;

    // Apply pagination
    const pageSize = limit ? parseInt(limit) : 20;
    const currentPage = page ? parseInt(page) : 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      items: paginatedResults,
      pagination: {
        page: currentPage,
        pageSize: pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined || price < 0) {
      return res.status(400).json({ error: 'Invalid payload: name, category, and valid price are required' });
    }

    const item = { name, category, price };
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;