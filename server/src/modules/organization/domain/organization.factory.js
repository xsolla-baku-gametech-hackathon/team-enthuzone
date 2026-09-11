const { createId } = require('../../../shared/utils/id');

function slugifyOrganizationName(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'organization';
}

function createOrganization({ name, slug }) {
  return {
    id: createId('org'),
    name: name.trim(),
    slug,
    status: 'ACTIVE',
  };
}

module.exports = { createOrganization, slugifyOrganizationName };
