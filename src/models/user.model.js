#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const zUser = z.object({
    username: z.string(),
    email: z.string().email().optional(),
    password: z.string().min(8),
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        match: [/.+\@.+\..+/, 'Invalid email format'],
        required: false
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
}, {
    strict: true
});

const User = mongoose.model("User", UserSchema);

module.exports = {
    User,
    zUser
};
