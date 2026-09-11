const { Router } = require('express');
const { validate } = require('../../../../shared/http/middleware/validate');
const { asyncHandler } = require('../../../../shared/http/middleware/async-handler');
const { feedbackSchema, feedbackBatchSchema, feedbackQuerySchema } = require('./feedback.schema');

function createFeedbackRouter({ feedbackController }) {
  const router = Router();
  router.post('/batch', validate(feedbackBatchSchema), asyncHandler(feedbackController.createBatch));
  router.post('/', validate(feedbackSchema), asyncHandler(feedbackController.create));
  router.get('/', validate(feedbackQuerySchema, 'query'), asyncHandler(feedbackController.list));
  return router;
}

module.exports = { createFeedbackRouter };
