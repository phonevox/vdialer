#!/usr/bin/node
const path = require("path")
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`) });
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("database", false).useEnvConfig().create();
const { model } = require(path.resolve("src/models"))
const mongoose = require("mongoose");

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

class BaseModelService {
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
        log.debug(newData)
        return this.model.findOneAndUpdate({ _id: id }, newData);
    }
}

class ManagerService extends BaseModelService {
    constructor(model) {
        super(model);
    }
}

class CampaignService extends BaseModelService {
    constructor(model) {
        super(model);
    }
}

class CallService extends BaseModelService {
    constructor(model) {
        super(model);
    }

    async validateManagerId(id) {
        await Database.connect();
        return await model.Manager.exists({_id: id});
    }

    async validateCampaignId(id) {
        await Database.connect();
        return await model.Campaign.exists({_id: id});
    }
}

class UserService extends BaseModelService {
    constructor(model) {
        super(model);
    }
}

module.exports = {
    ManagerService: new ManagerService(model.Manager),
    CampaignService: new CampaignService(model.Campaign),
    CallService: new CallService(model.Call),
    UserService: new UserService(model.User),
    isDatabaseConnected: Database.isDatabaseConnected,
};
