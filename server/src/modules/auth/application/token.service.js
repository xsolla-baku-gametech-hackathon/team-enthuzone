const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../../../shared/errors/app-error');
const { USER_ROLES } = require('../../user');

class TokenService {
  constructor({ secret, expiresIn = '15m' }) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user) {
    return jwt.sign({ organizationId: user.organizationId, role: user.role }, this.secret, {
      subject: user.id,
      expiresIn: this.expiresIn,
    });
  }

  verify(token) {
    try {
      const payload = jwt.verify(token, this.secret);
      if (typeof payload.sub !== 'string'
        || typeof payload.organizationId !== 'string'
        || !USER_ROLES.includes(payload.role)) {
        throw new Error('Invalid token payload');
      }
      return payload;
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }
}

module.exports = { TokenService };
