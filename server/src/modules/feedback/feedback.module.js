const { FeedbackService } = require('./application/feedback.service');
const { FeedbackController } = require('./presentation/http/feedback.controller');
const { createFeedbackRouter } = require('./presentation/http/feedback.routes');

function createFeedbackModule({ repository }) {
  if (!repository || ['save', 'saveMany', 'findAll'].some((method) => typeof repository[method] !== 'function')) {
    throw new TypeError('Feedback module requires a valid repository adapter');
  }
  const service = new FeedbackService({ feedbackRepository: repository });
  const controller = new FeedbackController({ feedbackService: service });
  return { service, controller, router: createFeedbackRouter({ feedbackController: controller }) };
}

module.exports = { createFeedbackModule };
