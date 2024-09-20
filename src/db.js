#!/usr/bin/node
const path = require("path")
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("database", false).useEnvConfig().create();
const mongoose = require("mongoose");
const { Manager } = require(path.resolve("src/models/manager.model"))

let singleton;

async function connect() {

    if (singleton) return singleton;

    let connectionUrl = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`
    log.trace(`Trying to connect to database ${connectionUrl}`);
    await mongoose.connect(connectionUrl, {dbName: process.env.MONGODB_DATABASE || 'vdialer-dbnotset'})

    log.trace(`Database connected!`)
    singleton = mongoose

    return singleton
}

async function listManagers() {
    await connect();
    let query = Manager.find()
    return query;
}

async function findManagerById(search) {
    await connect();
    let query = Manager.findOne(search)
    let filtered = query.select('-_id -__v')
    return filtered;
}

async function insertManager(manager) {
    await connect();
    let query = Manager.create(manager)
    return query;
};

module.exports = {
    listManagers,
    insertManager,
    findManagerById
}
