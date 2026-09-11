const { createUser, normalizeEmail } = require('../domain/user.factory');

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  findByEmail(email, transaction) {
    return this.userRepository.findByEmail(normalizeEmail(email), transaction);
  }

  findById(id, transaction) {
    return this.userRepository.findById(id, transaction);
  }

  createOwner(input, transaction) {
    return this.userRepository.create(createUser({ ...input, role: 'OWNER' }), transaction);
  }
}

module.exports = { UserService };
