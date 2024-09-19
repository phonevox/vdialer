#!/usr/bin/node
const path = require("path")
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Manager } = require(path.resolve("src/models/manager.model"))
const mongoose = require("mongoose");

let singleton;

async function connect() {

    if (singleton) return singleton;

    await mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`)
    singleton = mongoose

    return singleton
}

async function findManager() {
    await connect();
    return Manager.find();
}

async function insertManager(manager) {
    await connect();
    return Manager.create(manager)
};

module.exports = {
    findManager,
    insertManager
}
