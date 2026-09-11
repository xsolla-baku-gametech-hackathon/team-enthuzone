const { createAuthModule } = require('./auth.module');
const { TokenService } = require('./application/token.service');
const { MemoryTransactionManager } = require('./infrastructure/transactions/memory.transaction-manager');
const { MongoTransactionManager } = require('./infrastructure/transactions/mongo.transaction-manager');
const { requireAnyRole } = require('./presentation/http/authorize-role.middleware');

module.exports = { createAuthModule, TokenService, MemoryTransactionManager, MongoTransactionManager, requireAnyRole };
