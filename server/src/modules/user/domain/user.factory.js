const { createId } = require('../../../shared/utils/id');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createUser({ organizationId, name, email, passwordHash, role = 'MEMBER' }) {
  return {
    id: createId('usr'),
    organizationId,
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash,
    role,
    status: 'ACTIVE',
  };
}

module.exports = { createUser, normalizeEmail };
