const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// GET /api/users - Browse users with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { category, location, timezone, search, page = 1, limit = 12 } = req.query;
    const query = { _id: { $ne: req.user._id }, isBanned: false };

    if (category) query['skillsOffered.category'] = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (timezone) query.timezone = timezone;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skillsOffered.name': { $regex: search, $options: 'i' } },
        { 'skillsWanted.name': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ points: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/matches - Smart matching algorithm
router.get('/matches', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const myOfferedSkills = currentUser.skillsOffered.map(s => s.name.toLowerCase());
    const myWantedSkills = currentUser.skillsWanted.map(s => s.name.toLowerCase());

    const allUsers = await User.find({ 
      _id: { $ne: req.user._id }, 
      isBanned: false,
      $or: [
        { 'skillsOffered.0': { $exists: true } },
        { 'skillsWanted.0': { $exists: true } }
      ]
    }).select('-password');

    const scored = allUsers.map(user => {
      const theirOffered = user.skillsOffered.map(s => s.name.toLowerCase());
      const theirWanted = user.skillsWanted.map(s => s.name.toLowerCase());

      // Score: they offer what I want + they want what I offer
      const theyOfferWhatIWant = myWantedSkills.filter(s => theirOffered.includes(s)).length;
      const theyWantWhatIOffer = myOfferedSkills.filter(s => theirWanted.includes(s)).length;
      const mutualScore = theyOfferWhatIWant + theyWantWhatIOffer;

      return { user, score: mutualScore, theyOfferWhatIWant, theyWantWhatIOffer };
    });

    const matches = scored
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ isBanned: false })
      .select('name avatar points badges swapsCompleted rating')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
