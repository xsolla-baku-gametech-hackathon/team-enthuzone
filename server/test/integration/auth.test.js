process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { createApp } = require('../../src/app');
const { MemoryOrganizationRepository } = require('../../src/modules/organization');
const { MemoryUserRepository } = require('../../src/modules/user');
const { MemoryTransactionManager } = require('../../src/modules/auth');

const secret = process.env.JWT_SECRET;
const registration = {
  organizationName: 'DarkFront Studio',
  name: 'John Doe',
  email: 'John@DarkFront.com',
  password: 'StrongPassword123!',
};

function testContext() {
  const organizationRepository = new MemoryOrganizationRepository();
  const userRepository = new MemoryUserRepository();
  const app = createApp({
    organizationRepository,
    userRepository,
    transactionManager: new MemoryTransactionManager([organizationRepository, userRepository]),
    authConfig: { jwtSecret: secret, jwtExpiresIn: '15m', passwordHashRounds: 4 },
  });
  return { app, organizationRepository, userRepository };
}

async function register(context) {
  return request(context.app).post('/api/auth/register').send(registration).expect(201);
}

test('registration creates an organization and OWNER with a password hash', async () => {
  const context = testContext();
  const response = await register(context);
  const storedUser = await context.userRepository.findByEmail('john@darkfront.com');

  assert.equal(response.body.user.role, 'OWNER');
  assert.equal(response.body.user.email, 'john@darkfront.com');
  assert.equal(response.body.organization.slug, 'darkfront-studio');
  assert.ok(response.body.accessToken);
  assert.match(storedUser.passwordHash, /^\$2/);
  assert.notEqual(storedUser.passwordHash, registration.password);
  assert.equal(JSON.stringify(response.body).includes('passwordHash'), false);
  assert.equal((await context.organizationRepository.findAll()).length, 1);
});

test('registration rejects duplicate email and invalid requests', async () => {
  const context = testContext();
  await register(context);
  const duplicate = await request(context.app).post('/api/auth/register').send({
    ...registration,
    organizationName: 'Another Studio',
    email: 'JOHN@DARKFRONT.COM',
  }).expect(409);
  assert.equal(duplicate.body.error.code, 'CONFLICT');
  assert.equal((await context.organizationRepository.findAll()).length, 1);

  const invalid = await request(context.app).post('/api/auth/register').send({
    organizationName: '', name: '', email: 'invalid', password: 'short',
  }).expect(400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
});

test('login succeeds and unknown email and wrong password share a generic error', async () => {
  const context = testContext();
  await register(context);
  const loggedIn = await request(context.app).post('/api/auth/login').send({
    email: registration.email,
    password: registration.password,
  }).expect(200);
  assert.ok(loggedIn.body.accessToken);

  for (const credentials of [
    { email: registration.email, password: 'WrongPassword123!' },
    { email: 'unknown@example.com', password: 'WrongPassword123!' },
  ]) {
    const failed = await request(context.app).post('/api/auth/login').send(credentials).expect(401);
    assert.equal(failed.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(failed.body.error.message, 'Invalid email or password');