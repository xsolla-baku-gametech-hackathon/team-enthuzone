const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");
function model(name, fields, indexes = []) {
  const schema = new mongoose.Schema(
    {
      id: { type: String, default: () => randomUUID(), unique: true },
      ...fields,
    },