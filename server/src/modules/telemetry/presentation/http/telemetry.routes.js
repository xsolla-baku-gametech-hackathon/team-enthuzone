const { Router } = require('express');
const { validate } = require('../../../../shared/http/middleware/validate');
const { asyncHandler } = require('../../../../shared/http/middleware/async-handler');
const { telemetrySchema, telemetryBatchSchema, telemetryQuerySchema } = require('./telemetry.schema');

function createTelemetryRouter({ telemetryController }) {
  const router = Router();
  router.post('/', validate(telemetrySchema), asyncHandler(telemetryController.create));
  router.post('/batch', validate(telemetryBatchSchema), asyncHandler(telemetryController.createBatch));
  router.get('/', validate(telemetryQuerySchema, 'query'), asyncHandler(telemetryController.list));
  return router;
}

module.exports = { createTelemetryRouter };
