const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// GET /api/skills/categories
router.get('/categories', async (req, res) => {
  const categories = [
    'Technology', 'Design', 'Marketing', 'Business', 'Language',
    'Music', 'Art', 'Writing', 'Photography', 'Cooking',
    'Fitness', 'Finance', 'Teaching', 'Engineering', 'Science', 'Other'
  ];
  res.json(categories);
});

// GET /api/skills/popular
router.get('/popular', async (req, res) => {
  try {
    const users = await User.find({ isBanned: false }).select('skillsOffered skillsWanted');
    const skillCount = {};
    users.forEach(u => {
      [...u.skillsOffered, ...u.skillsWanted].forEach(s => {
        skillCount[s.name] = (skillCount[s.name] || 0) + 1;
      });
    });
    const sorted = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/skills/search
router.get('/search', auth, async (req, res) => {
  try {
    const { q, category, type = 'offered' } = req.query;
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    const query = { isBanned: false, _id: { $ne: req.user._id } };
    if (q) query[`${field}.name`] = { $regex: q, $options: 'i' };
    if (category) query[`${field}.category`] = category;

    const users = await User.find(query).select(`name avatar ${field} rating location`).limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
