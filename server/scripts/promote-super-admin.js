#!/usr/bin/env node
require("dotenv").config();
const mongoose = require("mongoose");
const { env } = require("../src/config/environment");
const {
  UserMongoModel,
} = require("../src/modules/user/infrastructure/persistence/mongo/user.mongo.model");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/promote-super-admin.js <email>");
    process.exit(1);
  }
  await mongoose.connect(env.mongodbUri);
  const user = await UserMongoModel.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { isSuperAdmin: true } },
    { new: true },
  );
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} is now a Super Admin.`);
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
