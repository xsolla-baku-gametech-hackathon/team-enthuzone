const { ConflictError } = require('../../../shared/errors/app-error');
const { createOrganization, slugifyOrganizationName } = require('../domain/organization.factory');

class OrganizationService {