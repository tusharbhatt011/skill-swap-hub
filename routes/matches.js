const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const BADGES = {
  firstSwap: { name: 'First Swap!', icon: '🤝' },
  fiveSwaps: { name: 'Swap Star', icon: '⭐' },
  tenSwaps: { name: 'Skill Master', icon: '🏆' },
  twentySwaps: { name: 'Legend', icon: '👑' }
};

const awardPoints = async (userId, points, badge = null) => {
  const update = { $inc: { points, swapsCompleted: 1 } };
  if (badge) update.$push = { badges: { ...badge, earnedAt: new Date() } };
  return User.findByIdAndUpdate(userId, update, { new: true });
};

// POST /api/matches/request
router.post('/request', auth, async (req, res) => {
  try {
    const { receiverId, requesterSkill, receiverSkill, message } = req.body;
    
    const existing = await Match.findOne({
      requester: req.user._id, receiver: receiverId,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) return res.status(400).json({ message: 'Already have an active request with this user' });

    const match = await Match.create({
      requester: req.user._id,
      receiver: receiverId,
      requesterSkill, receiverSkill, message
    });

    const populated = await match.populate(['requester', 'receiver']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/matches - Get my matches
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [{ requester: req.user._id }, { receiver: req.user._id }]
    };
    if (status) query.status = status;

    const matches = await Match.find(query)
      .populate('requester', 'name avatar rating')
      .populate('receiver', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/matches/:id/respond
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { status, meetingLink } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    match.status = status;
    if (meetingLink) match.meetingLink = meetingLink;
    await match.save();

    res.json(await match.populate(['requester', 'receiver']));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/matches/:id/complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = [match.requester.toString(), match.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    match.status = 'completed';
    match.completedAt = new Date();
    await match.save();

    // Award points to both users
    for (const userId of [match.requester, match.receiver]) {
      const user = await User.findById(userId);
      const swaps = user.swapsCompleted + 1;
      let badge = null;
      if (swaps === 1) badge = BADGES.firstSwap;
      else if (swaps === 5) badge = BADGES.fiveSwaps;
      else if (swaps === 10) badge = BADGES.tenSwaps;
      else if (swaps === 20) badge = BADGES.twentySwaps;
      await awardPoints(userId, 50, badge);
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
