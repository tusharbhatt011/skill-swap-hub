const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const Review = require('../models/Review');
const { adminAuth } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalSwaps, completedSwaps, totalReviews] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments(),
      Match.countDocuments({ status: 'completed' }),
      Review.countDocuments()
    ]);

    // Popular skills
    const users = await User.find().select('skillsOffered location');
    const skillCount = {};
    const locationCount = {};
    users.forEach(u => {
      u.skillsOffered.forEach(s => {
        skillCount[s.name] = (skillCount[s.name] || 0) + 1;
      });
      if (u.location) locationCount[u.location] = (locationCount[u.location] || 0) + 1;
    });

    const popularSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const activeRegions = Object.entries(locationCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const recentSwaps = await Match.find({ status: 'completed' }).sort({ completedAt: -1 }).limit(5)
      .populate('requester receiver', 'name');

    res.json({ totalUsers, totalSwaps, completedSwaps, totalReviews, popularSkills, activeRegions, recentUsers, recentSwaps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { banned } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: banned }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
