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
