#!/usr/bin/node
const path = require("path")
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("database", false).useEnvConfig().create();
const mongoose = require("mongoose");
const { Manager } = require(path.resolve("src/models/manager.model"))

let singleton;

function isDatabaseConnected() {
    if (singleton) return true;
    return false;
}

async function connect() {

    if (singleton) return singleton;

    let connectionUrl = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`
    log.trace(`Trying to connect to database ${connectionUrl}`);
    await mongoose.connect(connectionUrl, {dbName: process.env.MONGODB_DATABASE || 'vdialer-dbnotset'})

    log.trace(`Database connected!`)
    singleton = mongoose

    return singleton
}

async function managerCreate(manager) {
    await connect();
    let query = Manager.create(manager);
    return query;
};

async function managerRemove(id) {
    await connect();
    let query = Manager.deleteOne({_id: id});
    return query;
};

async function managerFindOne(searchQuery, selectString = '') {
    await connect();
    let query = Manager.findOne(searchQuery);
    let filtered = query.select(selectString);
    return filtered;
}

async function managerFind(searchQuery, selectString = '') {
    await connect();
    let query = Manager.find(searchQuery)
    let filtered = query.select(selectString);
    return filtered;
}

async function managerUpdate(id, newData) {
    await connect();
    let query = Manager.findOneAndUpdate({_id: id}, newData)
    return query;
}

module.exports = {
    managerCreate,
    managerUpdate,
    managerFind,
    managerFindOne,
    managerRemove,
    isDatabaseConnected,
}
