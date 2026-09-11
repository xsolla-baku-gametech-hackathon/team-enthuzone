const { ForbiddenError, UnauthorizedError } = require('../../../../shared/errors/app-error');
const { USER_ROLES } = require('../../../user');

function requireAnyRole(...roles) {
  if (roles.length === 1 && Array.isArray(roles[0])) roles = roles[0];
  if (!roles.length || roles.some((role) => !USER_ROLES.includes(role))) {
    throw new TypeError('requireAnyRole requires one or more valid roles');
  }
  return (req, _res, next) => {
    if (!req.auth) return next(new UnauthorizedError());
    if (!roles.includes(req.auth.role)) return next(new ForbiddenError());
    return next();
  };
}

module.exports = { requireAnyRole };
