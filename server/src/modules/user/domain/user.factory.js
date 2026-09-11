const { createId } = require('../../../shared/utils/id');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createUser({ organizationId, name, email, passwordHash, role = 'MEMBER', isSuperAdmin = false }) {
  return {
    id: createId('usr'),
    organizationId,
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash,
    role,
    isSuperAdmin: isSuperAdmin === true,
    status: 'ACTIVE',
  };
}

module.exports = { createUser, normalizeEmail };
