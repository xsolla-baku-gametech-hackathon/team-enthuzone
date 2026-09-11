const { createUser, normalizeEmail } = require('../domain/user.factory');

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }