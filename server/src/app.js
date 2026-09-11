const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { env } = require('./config/environment');
const { createFeedbackModule, MemoryFeedbackRepository } = require('./modules/feedback');
const { createTelemetryModule, MemoryTelemetryRepository } = require('./modules/telemetry');
const { MemoryOrganizationRepository } = require('./modules/organization');
const { MemoryUserRepository } = require('./modules/user');
const { createAuthModule, MemoryTransactionManager } = require('./modules/auth');
const { notFoundHandler, errorHandler } = require('./shared/http/middleware/error-handler');
const { createPlatformRouter } = require('./modules/platform/router');
const { createSessionRouter } = require('./modules/platform/session');

function createContainer(options = {}) {
  const organizationRepository = options.organizationRepository || new MemoryOrganizationRepository();
  const userRepository = options.userRepository || new MemoryUserRepository();
  const transactionManager = options.transactionManager
    || new MemoryTransactionManager([organizationRepository, userRepository]);
  const auth = createAuthModule({
    organizationRepository,
    userRepository,
    transactionManager,
    config: options.authConfig || env,
  });
  const feedback = createFeedbackModule({
    repository: options.feedbackRepository || new MemoryFeedbackRepository(),
  });
  const telemetry = createTelemetryModule({
    repository: options.telemetryRepository || new MemoryTelemetryRepository(),
  });

  return {
    auth,
    feedback,
    telemetry,
    services: {
      authService: auth.service,
      feedbackService: feedback.service,
      telemetryService: telemetry.service,
    },
  };
}

function createApp(options = {}) {
  const app = express();
  const container = createContainer(options);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: env.httpBodyLimit }));
  app.use((req, res, next) => {
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.get('cookie') && req.get('origin')) {
      const corsEnv = process.env.CORS_ORIGINS || '*';
      if (corsEnv === '*') return next();
      const allowed = corsEnv.split(',').map(v => v.trim());
      if (allowed.includes('*') || allowed.includes(req.get('origin'))) return next();

      try {
        const originUrl = new URL(req.get('origin'));
        if (
          originUrl.hostname === 'localhost' ||
          originUrl.hostname === '127.0.0.1' ||
          originUrl.hostname === req.hostname ||
          req.get('host')?.includes(originUrl.hostname)
        ) {
          return next();
        }
      } catch {}

      return res.status(403).json({ error: { message: 'Origin not allowed' } });
    }
    next();
  });
  if (!env.isTest) app.use(morgan('combined'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', container.auth.router);
  app.use('/api/session', createSessionRouter(container.auth.service));
  app.use('/api/platform', createPlatformRouter(container.auth.authenticate, options.verifyGameUrl));