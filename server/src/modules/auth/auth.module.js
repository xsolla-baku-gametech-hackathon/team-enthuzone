const { OrganizationService } = require('../organization');
const { UserService } = require('../user');
const { AuthService } = require('./application/auth.service');
const { PasswordService } = require('./application/password.service');
const { TokenService } = require('./application/token.service');
const { AuthController } = require('./presentation/http/auth.controller');
const { createAuthenticateMiddleware } = require('./presentation/http/authenticate.middleware');
const { requireAnyRole } = require('./presentation/http/authorize-role.middleware');
const { createAuthRouter } = require('./presentation/http/auth.routes');

function createAuthModule({ organizationRepository, userRepository, transactionManager, config }) {
  const organizationService = new OrganizationService({ organizationRepository });
  const userService = new UserService({ userRepository });
  const passwordService = new PasswordService({ rounds: config.passwordHashRounds });
  const tokenService = new TokenService({ secret: config.jwtSecret, expiresIn: config.jwtExpiresIn });
  const service = new AuthService({
    organizationService,
    userService,
    passwordService,
    tokenService,
    transactionManager,
  });
  const controller = new AuthController({ authService: service });
  const authenticate = createAuthenticateMiddleware({ authService: service });
  return {
    service,
    controller,
    authenticate,
    requireAnyRole,
    router: createAuthRouter({ authController: controller, authenticate }),
  };
}

module.exports = { createAuthModule };
