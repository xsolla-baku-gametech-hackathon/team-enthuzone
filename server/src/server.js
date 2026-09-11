const { createApp } = require('./app');
const { env } = require('./config/environment');
const { connectMongo, disconnectMongo } = require('./infrastructure/database/mongoose.connection');
const { MongoFeedbackRepository } = require('./modules/feedback');
const { MongoTelemetryRepository } = require('./modules/telemetry');
const { MongoOrganizationRepository } = require('./modules/organization');
const { MongoUserRepository } = require('./modules/user');
const { MongoTransactionManager } = require('./modules/auth');

async function bootstrap() {
  await connectMongo(env.mongodbUri);
  const repositoryOptions = {
    feedbackRepository: new MongoFeedbackRepository(),
    telemetryRepository: new MongoTelemetryRepository(),
    organizationRepository: new MongoOrganizationRepository(),
    userRepository: new MongoUserRepository(),
    transactionManager: new MongoTransactionManager(),
  };

  const app = createApp(repositoryOptions);
  const server = app.listen(env.port, () => {
    console.log(`Player Data Ingestion API listening on port ${env.port} (mongodb)`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing HTTP server`);
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  return { app, server };
}