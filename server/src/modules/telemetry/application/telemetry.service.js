const { toTelemetryEvent } = require('../domain/telemetry.factory');

class TelemetryService {
  constructor({ telemetryRepository }) {
    this.telemetryRepository = telemetryRepository;
  }

  async ingest(input) {
    return this.telemetryRepository.save(toTelemetryEvent(input));
  }

  async ingestBatch(inputs) {
    return this.telemetryRepository.saveMany(inputs.map(toTelemetryEvent));
  }

  async list(filters = {}) {
    return this.telemetryRepository.findAll({
      ...filters,
      gameId: filters.gameId?.toLowerCase(),
      eventName: filters.eventName?.toLowerCase(),
    });
  }

}

module.exports = { TelemetryService };
