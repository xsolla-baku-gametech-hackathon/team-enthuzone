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