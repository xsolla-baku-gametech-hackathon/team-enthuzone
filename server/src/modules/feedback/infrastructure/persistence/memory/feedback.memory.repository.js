class MemoryFeedbackRepository {
  constructor(seed = []) {
    this.feedbackById = new Map(seed.map((item) => [item.id, structuredClone(item)]));
  }

  async save(feedback) {
    this.feedbackById.set(feedback.id, structuredClone(feedback));
    return structuredClone(feedback);
  }

  async saveMany(feedbacks) {
    return Promise.all(feedbacks.map((feedback) => this.save(feedback)));
  }

  async findAll(filters = {}) {
    return [...this.feedbackById.values()]
      .filter((item) => !filters.gameId || item.gameId === filters.gameId)
      .filter((item) => !filters.source || item.source === filters.source)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50))
      .map((item) => structuredClone(item));
  }
}

module.exports = { MemoryFeedbackRepository };
