const { createId } = require('../../../shared/utils/id');

function toFeedback(input) {
  const receivedAt = new Date().toISOString();
  return {
    id: input.id || createId('fb'),
    gameId: input.gameId.trim().toLowerCase(),
    source: input.source.toUpperCase(),
    content: input.content.trim().replace(/\s+/g, ' '),
    createdAt: input.createdAt || receivedAt,
    receivedAt,
    metadata: { ...(input.metadata || {}) },
  };
}

module.exports = { toFeedback };
