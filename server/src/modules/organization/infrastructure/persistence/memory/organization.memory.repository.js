class MemoryOrganizationRepository {
  constructor(seed = []) {
    this.items = new Map(seed.map((item) => [item.id, structuredClone(item)]));
  }

  async create(organization) {
    if ([...this.items.values()].some((item) => item.slug === organization.slug)) {
      throw Object.assign(new Error('Duplicate organization slug'), { code: 'DUPLICATE_SLUG' });
    }
    const now = new Date().toISOString();
    const saved = { ...structuredClone(organization), createdAt: now, updatedAt: now };
    this.items.set(saved.id, saved);
    return structuredClone(saved);
  }

  async existsBySlug(slug) {
    return [...this.items.values()].some((item) => item.slug === slug);
  }

  async findById(id) {
    const item = this.items.get(id);
    return item ? structuredClone(item) : null;
  }

  async findAll() {
    return structuredClone([...this.items.values()]);
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

module.exports = { MemoryOrganizationRepository };
