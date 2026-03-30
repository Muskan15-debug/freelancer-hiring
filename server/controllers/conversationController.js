import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// POST /api/conversations
export const createConversation = async (req, res, next) => {
  try {
    const { participantId, projectId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    }).populate('participants', 'name avatar');

    if (existing) {
      return res.json({ conversation: existing });
    }

    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      project: projectId,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar');

    res.status(201).json({ conversation: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar')
      .populate('project', 'title')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations/:id/messages
export const sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    // Update last message
    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
          io.to(`user_${participantId}`).emit('newMessage', {
            message: populated,
            conversationId: req.params.id,
          });
        }
      });
    }

    res.status(201).json({ message: populated });
  } catch (error) {
    next(error);
  }
};
