const mongoose = require('mongoose');

class MongoTransactionManager {
  async execute(work) {
    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        result = await work({ session });
      });
      return result;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = { MongoTransactionManager };
