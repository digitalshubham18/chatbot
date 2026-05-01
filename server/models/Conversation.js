const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const convSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, default: 'New Consultation', maxlength: 80 },
  category: { type: String, default: 'General' },
  pinned:   { type: Boolean, default: false },
  messages: [msgSchema],
}, { timestamps: true });

convSchema.methods.autoTitle = function () {
  const first = this.messages.find(m => m.role === 'user');
  if (first) {
    this.title = first.content.length > 60
      ? first.content.slice(0, 60) + '…'
      : first.content;
  }
};

module.exports = mongoose.model('Conversation', convSchema);
