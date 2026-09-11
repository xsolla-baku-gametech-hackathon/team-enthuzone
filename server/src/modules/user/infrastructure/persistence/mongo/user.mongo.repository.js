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
    return UserMongoModel.findOne({ email })
      .select('+passwordHash')
      .session(transaction.session || null)
      .lean();
  }

  async findById(id, transaction = {}) {
    return UserMongoModel.findOne({ id }).session(transaction.session || null).lean();
  }

  async update(id, changes, transaction = {}) {
    return UserMongoModel.findOneAndUpdate({ id }, { $set: changes }, { new: true, session: transaction.session }).lean();
  }
}

module.exports = { MongoUserRepository };
