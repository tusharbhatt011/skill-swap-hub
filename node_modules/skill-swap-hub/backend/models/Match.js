const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterSkill: { type: String, required: true },
  receiverSkill: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  message: { type: String, default: '' },
  scheduledAt: { type: Date },
  completedAt: { type: Date },
  meetingLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
