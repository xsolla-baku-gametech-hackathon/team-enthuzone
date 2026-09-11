const { toTelemetryEvent } = require('../domain/telemetry.factory');

class TelemetryService {
  constructor({ telemetryRepository }) {
    this.telemetryRepository = telemetryRepository;
  }

  async ingest(input) {
    return this.telemetryRepository.save(toTelemetryEvent(input));
  }