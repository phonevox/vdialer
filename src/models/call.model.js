#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");

const zCall = z.object({
    number: z.string().min(10).max(15),
    name: z.string().min(1),
    ringtime: z.number().nullable(),
    campaign: z.string().length(24),
    manager: z.string().length(24)
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
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: true
    }
  });

const Call = mongoose.model("Call", CallSchema);

module.exports = {
    Call,
    zCall,
};
