const mongoose = require('mongoose');
const { USER_ROLES, USER_STATUSES } = require('../../../domain/user.constants');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, immutable: true },
  organizationId: { type: String, required: true, ref: 'Organization', index: true, immutable: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: USER_ROLES },
  status: { type: String, required: true, enum: USER_STATUSES, default: 'ACTIVE', index: true },