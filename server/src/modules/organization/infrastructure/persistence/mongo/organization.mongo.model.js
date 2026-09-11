const mongoose = require('mongoose');
const { ORGANIZATION_STATUSES } = require('../../../domain/organization.constants');

const organizationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, immutable: true },
  status: { type: String, required: true, enum: ORGANIZATION_STATUSES, default: 'ACTIVE', index: true },
}, {
  collection: 'organizations',
  timestamps: true,
  versionKey: false,
});

const OrganizationMongoModel = mongoose.models.Organization
  || mongoose.model('Organization', organizationSchema);

module.exports = { OrganizationMongoModel };
