const { TelemetryMongoModel } = require('./telemetry.mongo.model');

class MongoTelemetryRepository {
  async save(event) {
    return TelemetryMongoModel.findOneAndUpdate(
      { id: event.id },
      { $set: event },
      { upsert: true, new: true, lean: true, setDefaultsOnInsert: true },
    );
  }

  async saveMany(events) {
    if (!events.length) return [];
    await TelemetryMongoModel.bulkWrite(events.map((event) => ({
      updateOne: {
        filter: { id: event.id },
        update: { $set: event },
        upsert: true,
      },
    })), { ordered: false });
    return events.map((event) => structuredClone(event));
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.gameId) query.gameId = filters.gameId;
    if (filters.buildVersion) query.buildVersion = filters.buildVersion;
    if (filters.playerId) query.playerId = filters.playerId;
    if (filters.sessionId) query.sessionId = filters.sessionId;
    if (filters.eventName) query.eventName = filters.eventName;
    for (const [key, value] of Object.entries(filters.propertyFilters || {})) {
      query[`properties.${key}`] = value;
    }
    return TelemetryMongoModel.find(query)
      .sort({ timestamp: -1 })
      .skip(filters.offset || 0)
      .limit(filters.limit || 50)
      .lean();
  }
}

module.exports = { MongoTelemetryRepository };
