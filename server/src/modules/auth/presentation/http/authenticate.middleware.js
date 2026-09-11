const { UnauthorizedError } = require('../../../../shared/errors/app-error');

function createAuthenticateMiddleware({ authService }) {
  return async (req, _res, next) => {
    try {
      const authorization = req.get('authorization');
      const match = authorization?.match(/^Bearer\s+(\S+)$/i);
      const cookieToken = (req.get('cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith('access_token='))?.slice(13);
      if (!match && !cookieToken) throw new UnauthorizedError('Bearer access token is required');
      req.auth = await authService.authenticate(match?.[1] || cookieToken);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { createAuthenticateMiddleware };
