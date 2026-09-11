const { ConflictError, InvalidCredentialsError, UnauthorizedError } = require('../../../shared/errors/app-error');
const { normalizeEmail } = require('../../user');

const INVALID_CREDENTIALS = 'Invalid email or password';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function publicOrganization(organization) {
  return { id: organization.id, name: organization.name, slug: organization.slug };
}