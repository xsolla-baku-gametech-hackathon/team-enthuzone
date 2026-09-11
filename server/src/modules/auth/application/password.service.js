const bcrypt = require('bcryptjs');

class PasswordService {
  constructor({ rounds = 12 } = {}) {
    this.rounds = rounds;
  }