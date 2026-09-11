const { OrganizationMongoModel } = require('./organization.mongo.model');

class MongoOrganizationRepository {
  async create(organization, transaction = {}) {
    try {
      const [document] = await OrganizationMongoModel.create([organization], { session: transaction.session });
      return document.toObject();
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.slug) {
        throw Object.assign(new Error('Duplicate organization slug'), { code: 'DUPLICATE_SLUG' });
      }
      throw error;
    }
  }

  async existsBySlug(slug, transaction = {}) {
    return Boolean(await OrganizationMongoModel.exists({ slug }).session(transaction.session || null));
  }

  async findById(id, transaction = {}) {
    return OrganizationMongoModel.findOne({ id }).session(transaction.session || null).lean();
  }

  async update(id, changes, transaction = {}) {
    return OrganizationMongoModel.findOneAndUpdate({ id }, { $set: changes }, { new: true, session: transaction.session }).lean();
  }
}

module.exports = { MongoOrganizationRepository };
