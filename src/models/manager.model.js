#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");

const zManager = z.object({
    name: z.string(),
    description: z.string().optional(),
    config: z.object({
        outbound_context: z.string().default("from-internal")
    }).strict(),
    auth: z.object({
        host: z.string(),
        port: z.number().default(5038),
        user: z.string(),
        password: z.string()
    }).strict()
});

const ManagerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    config: {
        outbound_context: {
            type: String,
            default: "from-internal",
            required: true
        }
    },
    auth: {
        host: {
            type: String,
            required: true
        },
        port: {
            type: Number,
            default: 5038,
            required: true
        },
        user: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    }
}, {
    strict: true
});

const Manager = mongoose.model("Manager", ManagerSchema);

module.exports = {
    Manager,
    zManager
};
