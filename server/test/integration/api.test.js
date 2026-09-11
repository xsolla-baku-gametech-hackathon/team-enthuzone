process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../../src/app');

test('health endpoint reports readiness', async () => {
  const response = await request(createApp()).get('/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('feedback is normalized, stored, and can be read back', async () => {
  const app = createApp();
  const created = await request(app).post('/api/feedback').send({
    gameId: 'DarkFront',
    source: 'support',
    content: '  Boss 4 is impossible again   ',
    createdAt: '2026-09-10T14:00:00Z',
    metadata: { ticket: 99 },
  }).expect(201);

  assert.match(created.body.feedback.id, /^fb_/);
  assert.equal(created.body.feedback.gameId, 'darkfront');
  assert.equal(created.body.feedback.source, 'SUPPORT');
  assert.ok(created.body.feedback.receivedAt);

  const listed = await request(app).get('/api/feedback?gameId=darkfront&limit=10').expect(200);
  assert.equal(listed.body.count, 1);
  assert.equal(listed.body.feedbacks[0].metadata.ticket, 99);
});

test('feedback batch endpoint stores multiple records', async () => {
  const app = createApp();
  const response = await request(app).post('/api/feedback/batch').send({
    feedbacks: [
      { gameId: 'darkfront', source: 'STEAM', content: 'First feedback', metadata: {} },
      { gameId: 'darkfront', source: 'REDDIT', content: 'Second feedback', metadata: {} },
    ],
  }).expect(202);

  assert.equal(response.body.accepted, 2);
  const listed = await request(app).get('/api/feedback?limit=10').expect(200);
  assert.equal(listed.body.count, 2);
});

test('telemetry retains generic nested properties and can be read back', async () => {
  const app = createApp();
  const payload = {
    gameId: 'darkfront',
    playerId: 'player_123',
    sessionId: 'session_456',
    eventType: 'custom',
    eventName: 'Vehicle_Overheated',
    buildVersion: '1.8.0',
    timestamp: '2026-09-10T12:31:00Z',
    properties: { vehicle: { class: 'rover', heat: 98 }, experimentalFlag: true },
  };

  const created = await request(app).post('/api/telemetry').send(payload).expect(202);
  assert.match(created.body.telemetry.id, /^tel_/);
  assert.equal(created.body.telemetry.eventType, 'CUSTOM');
  assert.deepEqual(created.body.telemetry.properties, payload.properties);
  assert.ok(created.body.telemetry.receivedAt);

  const listed = await request(app)
    .get('/api/telemetry?gameId=darkfront&playerId=player_123&eventName=vehicle_overheated')
    .expect(200);
  assert.equal(listed.body.count, 1);
  assert.deepEqual(listed.body.telemetry[0].properties, payload.properties);
});

test('telemetry validation rejects malformed events', async () => {
  const response = await request(createApp())
    .post('/api/telemetry')
    .send({ gameId: 'darkfront', properties: {} })
    .expect(400);

  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.ok(response.body.error.details.fieldErrors.playerId);
});
