#!/usr/bin/node
const path = require("path")
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("database", false).useEnvConfig().create();
const mongoose = require("mongoose");
const { Manager } = require(path.resolve("src/models/manager.model"))
const { Campaign } = require(path.resolve("src/models/campaign.model"))
const { Call } = require(path.resolve("src/models/call.model"))

let singleton;
class Database {
    static async connect() {
        if (singleton) return singleton;

        const connectionUrl = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`;
        log.trace(`Trying to connect to database ${connectionUrl}`);
        await mongoose.connect(connectionUrl, { dbName: process.env.MONGODB_DATABASE || 'vdialer-dbnotset' });

        log.trace(`Database connected!`);
        singleton = mongoose;

        return singleton;
    }

    static isDatabaseConnected() {
        return !!singleton;
    }
}

class BaseDBService {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        await Database.connect();
        return this.model.create(data);
    }

    async remove(id) {
        await Database.connect();
        return this.model.deleteOne({ _id: id });
    }

    async findOne(searchQuery, selectString = '', lean = false) {
        await Database.connect();
        let query = this.model.findOne(searchQuery).select(selectString);
        if (lean) query = query.lean();
        return query;
    }

    async find(searchQuery, selectString = '') {
        await Database.connect();
        return this.model.find(searchQuery).select(selectString);
    }

    async update(id, newData) {
        await Database.connect();
        return this.model.findOneAndUpdate({ _id: id }, newData);
    }
}

// Exportando apenas o método isDatabaseConnected
module.exports = {
    ManagerService: new BaseDBService(Manager),
    CampaignService: new BaseDBService(Campaign),
    CallService: new BaseDBService(Call),
    isDatabaseConnected: Database.isDatabaseConnected,
};
