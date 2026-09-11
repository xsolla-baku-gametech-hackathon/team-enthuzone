const mongoose = require('mongoose');

const feedbackMongoSchema = new mongoose.Schema({
  _id: false,
  id: { type: String, required: true, unique: true },
  gameId: { type: String, required: true, index: true },
  source: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, required: true },
  receivedAt: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  collection: 'feedbacks',
  versionKey: false,
});

feedbackMongoSchema.index({ gameId: 1, createdAt: -1 });
feedbackMongoSchema.index({ gameId: 1, source: 1, createdAt: -1 });
feedbackMongoSchema.index({ receivedAt: -1 });

const FeedbackMongoModel = mongoose.models.Feedback
  || mongoose.model('Feedback', feedbackMongoSchema);

module.exports = { FeedbackMongoModel };
