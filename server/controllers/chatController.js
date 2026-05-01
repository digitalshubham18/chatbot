const Conversation = require('../models/Conversation');
const { streamAI } = require('./legalEngine');

exports.history = async (req, res) => {
  try {
    const list = await Conversation.find(
      { userId: req.user._id },
      'title updatedAt messages category pinned'
    ).sort({ pinned: -1, updatedAt: -1 }).limit(100);
    res.json({ conversations: list });
  } catch {
    res.status(500).json({ message: 'Failed to load history.' });
  }
};

exports.get = async (req, res) => {
  try {
    const c = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!c) return res.status(404).json({ message: 'Not found.' });
    res.json({ conversation: c });
  } catch {
    res.status(500).json({ message: 'Failed to load conversation.' });
  }
};

exports.send = async (req, res) => {
  const { message, conversationId } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is empty.' });

  let conv;
  try {
    if (conversationId) {
      conv = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
      if (!conv) return res.status(404).json({ message: 'Conversation not found.' });
    } else {
      conv = new Conversation({ userId: req.user._id, messages: [] });
    }
  } catch {
    return res.status(500).json({ message: 'Database error.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sse = (event, data) => {
    try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); } catch (e) {}
  };

  sse('init', { conversationId: conv._id });

  const aiMessages = [
    ...conv.messages.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() },
  ];

  streamAI(
    aiMessages,
    (chunk) => sse('chunk', { text: chunk }),
    async (fullText) => {
      conv.messages.push({ role: 'user',      content: message.trim() });
      conv.messages.push({ role: 'assistant', content: fullText });
      if (conv.messages.length === 2) conv.autoTitle();
      try {
        await conv.save();
        const msgs = conv.messages;
        sse('done', {
          conversationId: conv._id,
          title:          conv.title,
          userMessage:    msgs[msgs.length - 2],
          botMessage:     msgs[msgs.length - 1],
        });
      } catch {
        sse('error', { message: 'Failed to save conversation.' });
      }
      res.end();
    },
    (err) => { sse('error', { message: err.message }); res.end(); }
  );

  req.on('close', () => { try { res.end(); } catch (e) {} });
};

exports.remove = async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete.' });
  }
};

exports.pin = async (req, res) => {
  try {
    const c = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!c) return res.status(404).json({ message: 'Not found.' });
    c.pinned = !c.pinned;
    await c.save();
    res.json({ pinned: c.pinned });
  } catch {
    res.status(500).json({ message: 'Failed to pin.' });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Conversation.deleteMany({ userId: req.user._id });
    res.json({ message: 'All cleared.' });
  } catch {
    res.status(500).json({ message: 'Failed to clear.' });
  }
};
