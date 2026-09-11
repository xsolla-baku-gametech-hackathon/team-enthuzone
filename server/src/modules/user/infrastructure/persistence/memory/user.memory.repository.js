class MemoryUserRepository {
  constructor(seed = []) {
    this.items = new Map(seed.map((item) => [item.id, structuredClone(item)]));
  }

  async create(user) {
    if ([...this.items.values()].some((item) => item.email === user.email)) {
      throw Object.assign(new Error('Duplicate user email'), { code: 'DUPLICATE_EMAIL' });
    }
    const now = new Date().toISOString();
    const saved = { ...structuredClone(user), createdAt: now, updatedAt: now };
    this.items.set(saved.id, saved);
    return structuredClone(saved);
  }

  async findByEmail(email) {
    const item = [...this.items.values()].find((candidate) => candidate.email === email);
    return item ? structuredClone(item) : null;
  }

  async findById(id) {
    const item = this.items.get(id);
    return item ? structuredClone(item) : null;
  }

  async update(id, changes) {
    const item = this.items.get(id);
    if (!item) return null;
    const updated = { ...item, ...structuredClone(changes), updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return structuredClone(updated);
  }

  snapshot() { return structuredClone([...this.items.entries()]); }
  restore(snapshot) { this.items = new Map(structuredClone(snapshot)); }
}

module.exports = { MemoryUserRepository };
