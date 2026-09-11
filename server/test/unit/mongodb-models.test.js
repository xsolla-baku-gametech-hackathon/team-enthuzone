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
  assert.ok(OrganizationMongoModel.schema.indexes().some(([keys, options]) => keys.slug === 1 && options.unique));
  assert.ok(UserMongoModel.schema.indexes().some(([keys, options]) => keys.email === 1 && options.unique));
});

test('telemetry MongoDB model retains arbitrary nested properties', async () => {
  const document = new TelemetryMongoModel({
    id: 'tel_model_test',
    gameId: 'darkfront',
    playerId: 'player_1',
    sessionId: 'session_1',
    eventType: 'CUSTOM',
    eventName: 'custom_event',
    buildVersion: '1.8.0',
    timestamp: '2026-09-10T12:00:00Z',
    receivedAt: '2026-09-10T12:00:01Z',
    properties: { nested: { arbitrary: ['a', 2, true] } },
  });

  await document.validate();
  assert.deepEqual(document.properties, { nested: { arbitrary: ['a', 2, true] } });
  const indexes = TelemetryMongoModel.schema.indexes().map(([keys]) => keys);
  assert.ok(indexes.some((keys) => keys['properties.$**'] === 1));
});
