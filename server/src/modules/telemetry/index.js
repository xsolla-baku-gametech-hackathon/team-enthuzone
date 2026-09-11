const { createTelemetryModule } = require('./telemetry.module');
const { MemoryTelemetryRepository } = require('./infrastructure/persistence/memory/telemetry.memory.repository');
const { MongoTelemetryRepository } = require('./infrastructure/persistence/mongo/telemetry.mongo.repository');

module.exports = { createTelemetryModule, MemoryTelemetryRepository, MongoTelemetryRepository };
