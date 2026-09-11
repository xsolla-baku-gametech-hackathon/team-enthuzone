const { UserMongoModel } = require('./user.mongo.model');

class MongoUserRepository {
  async create(user, transaction = {}) {
    try {
      const [document] = await UserMongoModel.create([user], { session: transaction.session });
      return document.toObject();
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw Object.assign(new Error('Duplicate user email'), { code: 'DUPLICATE_EMAIL' });
      }
      throw error;
    }
  }

  async findByEmail(email, transaction = {}) {