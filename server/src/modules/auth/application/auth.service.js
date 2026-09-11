const { ConflictError, InvalidCredentialsError, UnauthorizedError } = require('../../../shared/errors/app-error');
const { normalizeEmail } = require('../../user');

const INVALID_CREDENTIALS = 'Invalid email or password';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function publicOrganization(organization) {
  return { id: organization.id, name: organization.name, slug: organization.slug };
}

class AuthService {
  constructor({ organizationService, userService, passwordService, tokenService, transactionManager }) {
    Object.assign(this, { organizationService, userService, passwordService, tokenService, transactionManager });
  }

  async register(input) {
    const email = normalizeEmail(input.email);
    if (await this.userService.findByEmail(email)) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(input.password);