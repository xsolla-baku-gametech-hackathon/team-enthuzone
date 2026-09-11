class MemoryTelemetryRepository {
  constructor(seed = []) {
    this.eventsById = new Map(seed.map((event) => [event.id, structuredClone(event)]));
  }

  async save(event) {
    this.eventsById.set(event.id, structuredClone(event));
    return structuredClone(event);
  }

  async saveMany(events) {
    return Promise.all(events.map((event) => this.save(event)));
  }

  async findAll(filters = {}) {
    return [...this.eventsById.values()]
      .filter((event) => !filters.gameId || event.gameId === filters.gameId)
      .filter((event) => !filters.buildVersion || event.buildVersion === filters.buildVersion)
      .filter((event) => !filters.playerId || event.playerId === filters.playerId)
      .filter((event) => !filters.sessionId || event.sessionId === filters.sessionId)
      .filter((event) => !filters.eventName || event.eventName === filters.eventName)
      .filter((event) => Object.entries(filters.propertyFilters || {})
        .every(([key, value]) => event.properties?.[key] === value))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50))
      .map((event) => structuredClone(event));
  }
}

module.exports = { MemoryTelemetryRepository };
