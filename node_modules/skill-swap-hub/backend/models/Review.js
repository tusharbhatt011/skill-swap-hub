const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  skillSwapped: { type: String, default: '' },
  proofUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
