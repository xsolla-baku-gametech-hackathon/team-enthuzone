const { FeedbackMongoModel } = require('./feedback.mongo.model');

class MongoFeedbackRepository {
  async save(feedback) {
    return FeedbackMongoModel.findOneAndUpdate(
      { id: feedback.id },
      { $set: feedback },
      { upsert: true, new: true, lean: true, setDefaultsOnInsert: true },
    );
  }

  async saveMany(feedbacks) {
    if (!feedbacks.length) return [];
    await FeedbackMongoModel.bulkWrite(feedbacks.map((feedback) => ({
      updateOne: {
        filter: { id: feedback.id },
        update: { $set: feedback },
        upsert: true,
      },
    })));
    return feedbacks.map((feedback) => structuredClone(feedback));
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.gameId) query.gameId = filters.gameId;
    if (filters.source) query.source = filters.source;
    return FeedbackMongoModel.find(query)
      .sort({ createdAt: -1 })
      .skip(filters.offset || 0)
      .limit(filters.limit || 50)
      .lean();
  }
}

module.exports = { MongoFeedbackRepository };
