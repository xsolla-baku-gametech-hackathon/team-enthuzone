const { createId } = require('../../../shared/utils/id');

function toTelemetryEvent(input) {
  const receivedAt = new Date().toISOString();
  return {
    ...input,
    id: input.id || createId('tel'),
    gameId: input.gameId.trim().toLowerCase(),
    eventName: input.eventName.trim().toLowerCase(),
    timestamp: input.timestamp || receivedAt,
    receivedAt,
    properties: structuredClone(input.properties || {}),
  };
}

module.exports = { toTelemetryEvent };
