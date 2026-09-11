const { createUser, normalizeEmail } = require('../domain/user.factory');

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  findByEmail(email, transaction) {
    return this.userRepository.findByEmail(normalizeEmail(email), transaction);
  }

  findById(id, transaction) {