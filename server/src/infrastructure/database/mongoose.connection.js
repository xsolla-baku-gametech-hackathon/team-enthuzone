const mongoose = require('mongoose');

async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 20,
    minPoolSize: 1,