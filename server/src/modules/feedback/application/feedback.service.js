const { toFeedback } = require('../domain/feedback.factory');

class FeedbackService {
  constructor({ feedbackRepository }) {
    this.feedbackRepository = feedbackRepository;
  }

  async ingest(input) {