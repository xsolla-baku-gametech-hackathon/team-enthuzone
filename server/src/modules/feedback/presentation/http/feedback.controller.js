class FeedbackController {
  constructor({ feedbackService }) {
    this.feedbackService = feedbackService;
  }

  create = async (req, res) => {
    const feedback = await this.feedbackService.ingest(req.body);
    res.status(201).json({ feedback });
  };

  createBatch = async (req, res) => {
    const feedbacks = await this.feedbackService.ingestMany(req.body.feedbacks);
    res.status(202).json({ accepted: feedbacks.length, feedbacks });
  };

  list = async (req, res) => {
    const feedbacks = await this.feedbackService.list(req.query);
    res.json({ feedbacks, count: feedbacks.length, limit: req.query.limit, offset: req.query.offset });
  };
}

module.exports = { FeedbackController };
