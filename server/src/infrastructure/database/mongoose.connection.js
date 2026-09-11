const mongoose = require('mongoose');

async function connectMongo(uri) {
  mongoose.set('strictQuery', true);