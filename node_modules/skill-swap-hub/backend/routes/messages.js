const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// IMPORTANT: Specific routes MUST come before /:roomId

// GET /api/messages/conversations/list
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.createFromHexString
      ? mongoose.Types.ObjectId.createFromHexString(req.user._id.toString())
      : new mongoose.Types.ObjectId(req.user._id.toString());

    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$roomId', lastMessage: { $first: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    const docs = messages.map(m => m.lastMessage);
    const populated = await Message.populate(docs, [
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' }
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/messages/mark-read/:roomId
router.put('/mark-read/:roomId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { roomId: req.params.roomId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, receiverId, content, type } = req.body;
    if (!roomId || !receiverId || !content) {
      return res.status(400).json({ message: 'roomId, receiverId and content are required' });
    }
    const message = await Message.create({
      roomId,
      sender: req.user._id,
      receiver: receiverId,
      content,
      type: type || 'text'
    });
    res.status(201).json(await message.populate('sender', 'name avatar'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/:roomId  (must be LAST)
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;