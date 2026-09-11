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