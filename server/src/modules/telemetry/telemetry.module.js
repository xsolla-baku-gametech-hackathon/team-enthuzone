const { TelemetryService } = require('./application/telemetry.service');
const { TelemetryController } = require('./presentation/http/telemetry.controller');
const { createTelemetryRouter } = require('./presentation/http/telemetry.routes');

function createTelemetryModule({ repository }) {
  if (!repository || ['save', 'saveMany', 'findAll'].some((method) => typeof repository[method] !== 'function')) {
    throw new TypeError('Telemetry module requires a valid repository adapter');
  }
  const service = new TelemetryService({ telemetryRepository: repository });
  const controller = new TelemetryController({ telemetryService: service });
  return { service, controller, router: createTelemetryRouter({ telemetryController: controller }) };
}

module.exports = { createTelemetryModule };
