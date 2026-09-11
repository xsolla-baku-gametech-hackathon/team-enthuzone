const { MemoryUserRepository } = require('./infrastructure/persistence/memory/user.memory.repository');
const { MongoUserRepository } = require('./infrastructure/persistence/mongo/user.mongo.repository');
const { createUser, normalizeEmail } = require('./domain/user.factory');
const { USER_ROLES, USER_STATUSES } = require('./domain/user.constants');
const { UserService } = require('./application/user.service');

module.exports = {
  MemoryUserRepository,
  MongoUserRepository,
  createUser,
  normalizeEmail,
  USER_ROLES,
  USER_STATUSES,
  UserService,
};
