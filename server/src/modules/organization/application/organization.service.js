const { ConflictError } = require('../../../shared/errors/app-error');
const { createOrganization, slugifyOrganizationName } = require('../domain/organization.factory');

class OrganizationService {
  constructor({ organizationRepository }) {
    this.organizationRepository = organizationRepository;
  }

  async create({ name }, transaction) {
    const baseSlug = slugifyOrganizationName(name);
    let slug = baseSlug;

    for (let suffix = 1; suffix <= 100; suffix += 1) {
      if (!(await this.organizationRepository.existsBySlug(slug, transaction))) {