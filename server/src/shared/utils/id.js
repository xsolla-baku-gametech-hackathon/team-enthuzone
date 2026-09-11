const { randomUUID } = require('node:crypto');

function createId(prefix) {
  return `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

module.exports = { createId };
