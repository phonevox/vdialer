#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");

// Zod mongoose.ObjectId
const ObjectId = z.custom((value) => mongoose.Types.ObjectId.isValid(value), {
  message: "Invalid ObjectId",
});

const zCall = z.object({
  number: z.string().min(10).max(15),
  name: z.string().min(1),
  ringtime: z.number().nullable(),
  campaign: z.union([
    z.string().length(24),  // Aceita uma string com 24 caracteres
    ObjectId,               // Aceita um ObjectId
  ]),
  manager: z.union([
    z.string().length(24),  // Aceita uma string com 24 caracteres
    ObjectId,               // Aceita um ObjectId
  ]),
});

const CallSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15
  },
  name: {
    type: String,
    required: true
  },
  ringtime: {
    type: Number,
    default: null
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  }
});

const Call = mongoose.model("Call", CallSchema);

module.exports = {
  Call,
  zCall,
};
