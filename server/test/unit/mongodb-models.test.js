const test = require('node:test');
const assert = require('node:assert/strict');
const { TelemetryMongoModel } = require('../../src/modules/telemetry/infrastructure/persistence/mongo/telemetry.mongo.model');
const { FeedbackMongoModel } = require('../../src/modules/feedback/infrastructure/persistence/mongo/feedback.mongo.model');
const { OrganizationMongoModel } = require('../../src/modules/organization/infrastructure/persistence/mongo/organization.mongo.model');
const { UserMongoModel } = require('../../src/modules/user/infrastructure/persistence/mongo/user.mongo.model');

test('MongoDB models compile with the intended collection names', () => {
  assert.equal(FeedbackMongoModel.collection.collectionName, 'feedbacks');
  assert.equal(TelemetryMongoModel.collection.collectionName, 'telemetry_events');
  assert.equal(OrganizationMongoModel.collection.collectionName, 'organizations');
  assert.equal(UserMongoModel.collection.collectionName, 'users');