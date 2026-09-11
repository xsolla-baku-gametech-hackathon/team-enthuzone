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
    let created;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        created = await this.transactionManager.execute(async (transaction) => {
          if (await this.userService.findByEmail(email, transaction)) {
            throw Object.assign(new Error('Duplicate user email'), { code: 'DUPLICATE_EMAIL' });
          }
          const organization = await this.organizationService.create({ name: input.organizationName }, transaction);
          const user = await this.userService.createOwner({
            organizationId: organization.id,
            name: input.name,
            email,
            passwordHash,
          }, transaction);
          return { organization, user };
        });
        break;
      } catch (error) {
        if (error?.code === 'DUPLICATE_SLUG' && attempt < 2) continue;
        if (error?.code === 'DUPLICATE_EMAIL') {
          throw new ConflictError('A user with this email already exists');
        }
        throw error;
      }
    }

    return this.#authResponse(created.user, created.organization);
  }

  async login({ email, password }) {
    const user = await this.userService.findByEmail(normalizeEmail(email));
    const validPassword = user?.passwordHash
      ? await this.passwordService.compare(password, user.passwordHash)
      : false;
    if (!user || !validPassword || user.status !== 'ACTIVE') {
      throw new InvalidCredentialsError();
    }
    const organization = await this.organizationService.findById(user.organizationId);
    if (!organization || organization.status !== 'ACTIVE') {
      throw new InvalidCredentialsError();
    }
    return this.#authResponse(user, organization);
  }

  async authenticate(token) {
    const payload = this.tokenService.verify(token);
    const user = await this.userService.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE' || user.organizationId !== payload.organizationId) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
    const organization = await this.organizationService.findById(user.organizationId);
    if (!organization || organization.status !== 'ACTIVE') {
      throw new UnauthorizedError('Invalid or expired access token');
    }
    return { userId: user.id, organizationId: organization.id, role: user.role };
  }

  async getCurrentUser(auth) {