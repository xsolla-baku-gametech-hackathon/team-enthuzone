const { Router } = require('express');
const { validate } = require('../../../../shared/http/middleware/validate');
const { asyncHandler } = require('../../../../shared/http/middleware/async-handler');
const { registerSchema, loginSchema } = require('./auth.schema');

function createAuthRouter({ authController, authenticate }) {
  const router = Router();
  router.post('/register', validate(registerSchema), asyncHandler(authController.register));
  router.post('/login', validate(loginSchema), asyncHandler(authController.login));
  router.get('/me', authenticate, asyncHandler(authController.me));
  return router;
}

module.exports = { createAuthRouter };
