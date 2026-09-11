const { UnauthorizedError } = require('../../../../shared/errors/app-error');

function createAuthenticateMiddleware({ authService }) {
  return async (req, _res, next) => {