const { ConflictError, InvalidCredentialsError, UnauthorizedError } = require('../../../shared/errors/app-error');
const { normalizeEmail } = require('../../user');

const INVALID_CREDENTIALS = 'Invalid email or password';

function publicUser(user) {