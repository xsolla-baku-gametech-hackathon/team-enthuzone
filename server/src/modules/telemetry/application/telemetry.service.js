const { toTelemetryEvent } = require('../domain/telemetry.factory');

class TelemetryService {
  constructor({ telemetryRepository }) {
    this.telemetryRepository = telemetryRepository;
  }