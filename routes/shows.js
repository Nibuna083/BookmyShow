const express = require('express');
const Show = require('../models/Show');

const router = express.Router();

// Get all shows with caching
router.get('/', async (req, res) => {
  try {
    const cache = req.app.locals.cache;
    const cacheKey = 'all_shows';
    
    let shows = cache.get(cacheKey);
    if (!shows) {
      shows = await Show.find().sort({ createdAt: -1 });
      cache.set(cacheKey, shows);
    }
    
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get show by ID
router.get('/:id', async (req, res) => {
  try {
    const cache = req.app.locals.cache;
    const cacheKey = `show_${req.params.id}`;
    
    let show = cache.get(cacheKey);
    if (!show) {
      show = await Show.findById(req.params.id);
      if (!show) {
        return res.status(404).json({ message: 'Show not found' });
      }
      cache.set(cacheKey, show);
    }
    
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;