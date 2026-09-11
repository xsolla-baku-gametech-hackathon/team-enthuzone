class MemoryTransactionManager {
  constructor(repositories) {
    this.repositories = repositories;
  }

  async execute(work) {
    const snapshots = this.repositories.map((repository) => repository.snapshot());
    try {
      return await work({});
    } catch (error) {
      this.repositories.forEach((repository, index) => repository.restore(snapshots[index]));
      throw error;
    }
  }
}

module.exports = { MemoryTransactionManager };
