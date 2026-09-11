const { ConflictError } = require('../../../shared/errors/app-error');
const { createOrganization, slugifyOrganizationName } = require('../domain/organization.factory');

class OrganizationService {
  constructor({ organizationRepository }) {
    this.organizationRepository = organizationRepository;
  }

  async create({ name }, transaction) {