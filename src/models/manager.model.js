#!/usr/bin/node
const mongoose = require("mongoose");

const ManagerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        config: new mongoose.Schema({
            outbound_context: {
                type: String,
                required: true,
                default: "from-internal"
            }
        }, {_id: false}),
        auth: new mongoose.Schema({
            host: {
                type: String,
                required: true
            },
            port: {
                type: Number,
                required: true,
                default: 5038
            },
            user: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            }
        }, {_id: false})
    },
    {
        timestamps: true
    }
)

const Manager = mongoose.model("Manager", ManagerSchema);

module.exports = {
    Manager
};
