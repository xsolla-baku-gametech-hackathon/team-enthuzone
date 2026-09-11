const { createFeedbackModule } = require('./feedback.module');
const { MemoryFeedbackRepository } = require('./infrastructure/persistence/memory/feedback.memory.repository');
const { MongoFeedbackRepository } = require('./infrastructure/persistence/mongo/feedback.mongo.repository');

module.exports = { createFeedbackModule, MemoryFeedbackRepository, MongoFeedbackRepository };
