const { TelemetryMongoModel } = require('./telemetry.mongo.model');

class MongoTelemetryRepository {
  async save(event) {
    return TelemetryMongoModel.findOneAndUpdate(
      { id: event.id },
      { $set: event },
      { upsert: true, new: true, lean: true, setDefaultsOnInsert: true },
    );
  }