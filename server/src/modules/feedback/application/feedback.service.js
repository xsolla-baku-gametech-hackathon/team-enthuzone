const { toFeedback } = require('../domain/feedback.factory');

class FeedbackService {
  constructor({ feedbackRepository }) {
    this.feedbackRepository = feedbackRepository;
  }

  async ingest(input) {
    return this.feedbackRepository.save(toFeedback(input));
  }

  async ingestMany(inputs) {
    return this.feedbackRepository.saveMany(inputs.map(toFeedback));
  }

  async list(filters = {}) {
    const normalizedFilters = {
      ...filters,
      gameId: filters.gameId?.toLowerCase(),
    };
    return this.feedbackRepository.findAll(normalizedFilters);
  }
}

module.exports = { FeedbackService };
