process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAuthModule,
  MemoryTransactionManager,
  requireAnyRole,
  requireSuperAdmin,
} = require('../../src/modules/auth');
const { MemoryOrganizationRepository } = require('../../src/modules/organization');
const { MemoryUserRepository } = require('../../src/modules/user');

test('registration transaction rolls organization back when user creation fails', async () => {
  class FailingUserRepository extends MemoryUserRepository {
    async create() { throw new Error('simulated user write failure'); }
  }
  const organizationRepository = new MemoryOrganizationRepository();
  const userRepository = new FailingUserRepository();
  const auth = createAuthModule({
    organizationRepository,
    userRepository,
    transactionManager: new MemoryTransactionManager([organizationRepository, userRepository]),
    config: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: '15m',
      passwordHashRounds: 4,
    },
  });

  await assert.rejects(() => auth.service.register({
    organizationName: 'Rollback Studio',
    name: 'Owner User',
    email: 'owner@rollback.test',
    password: 'StrongPassword123!',
  }), /simulated user write failure/);
  assert.equal((await organizationRepository.findAll()).length, 0);
  assert.equal(await userRepository.findByEmail('owner@rollback.test'), null);
});

test('role middleware allows configured roles and rejects insufficient roles', () => {
  const middleware = requireAnyRole(['OWNER', 'ADMIN']);
  let ownerError;
  middleware({ auth: { role: 'OWNER' } }, {}, (error) => { ownerError = error; });
  assert.equal(ownerError, undefined);

  let memberError;
  middleware({ auth: { role: 'MEMBER' } }, {}, (error) => { memberError = error; });
  assert.equal(memberError.statusCode, 403);
  assert.equal(memberError.code, 'FORBIDDEN');
});

test('super admin middleware uses the platform-scoped database flag', () => {
  let missingAuthError;
  requireSuperAdmin({}, {}, (error) => { missingAuthError = error; });
  assert.equal(missingAuthError.statusCode, 401);

  let regularUserError;
  requireSuperAdmin({ auth: { role: 'OWNER', isSuperAdmin: false } }, {}, (error) => {
    regularUserError = error;
  });
  assert.equal(regularUserError.statusCode, 403);
  assert.equal(regularUserError.code, 'FORBIDDEN');

  let superAdminError;
  requireSuperAdmin({ auth: { role: 'MEMBER', isSuperAdmin: true } }, {}, (error) => {
    superAdminError = error;
  });
  assert.equal(superAdminError, undefined);
});
