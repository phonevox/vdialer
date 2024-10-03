#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");

const zUser = z.object({
    username: z.string().unique(),
    email: z.string().email().unique().optional(),
    password: z.string().min(8),
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        match: [/.+\@.+\..+/, 'Invalid email format'],
        required: true,
        unique: true
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
// (async () => { await User.syncIndexes()})();

module.exports = {
    User,
    zUser
};
