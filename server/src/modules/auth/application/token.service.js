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
