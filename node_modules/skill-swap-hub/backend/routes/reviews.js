const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { revieweeId, swapId, rating, comment, skillSwapped, proofUrl } = req.body;

    const existing = await Review.findOne({ reviewer: req.user._id, reviewee: revieweeId, swapId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this swap' });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      swapId, rating, comment, skillSwapped, proofUrl
    });

    // Update user's average rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avgRating, reviewCount: reviews.length });

    res.status(201).json(await review.populate('reviewer', 'name avatar'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
