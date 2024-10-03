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
        try {
            const ret = await this.model.create(data);
            return {
                error: false,
                message: "Successfully created.",
                data: { id: ret._id }
            };
        } catch (error) {
            return {
                error: true,
                message: error.message,
            };
        }
    }

    async remove(id) {
        await Database.connect();
        try {
            const result = await this.model.deleteOne({ _id: id });
            if (result.deletedCount > 0) {
                return {
                    error: false,
                    message: "Successfully removed.",
                    data: result
                };
            }
            return {
                error: false,
                message: "Does not exist.",
                data: result
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    async findOne(searchQuery, selectString = '', lean = false) {
        await Database.connect();
        try {
            let query = this.model.findOne(searchQuery).select(selectString);
            if (lean) query = query.lean();
            const result = await query;
            if (!result) {
                return {
                    error: true,
                    message: "No document found."
                };
            }
            return {
                error: false,
                message: "Document found.",
                data: result
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    async find(searchQuery, selectString = '') {
        await Database.connect();
        try {
            const results = await this.model.find(searchQuery).select(selectString);
            return {
                error: false,
                message: results.length ? "Documents found." : "No documents found.",
                data: results
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    async update(id, newData) {
        await Database.connect();
        try {
            const result = await this.model.findOneAndUpdate({ _id: id }, newData, { new: true });
            if (!result) {
                return {
                    error: true,
                    message: "No document found to update."
                };
            }
            return {
                error: false,
                message: "Successfully updated.",
                data: result
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
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
        try {
            const exists = await model.Manager.exists({ _id: id });
            return {
                error: !exists,
                message: exists ? "Manager ID is valid." : "Manager ID does not exist."
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }

    async validateCampaignId(id) {
        await Database.connect();
        try {
            const exists = await model.Campaign.exists({ _id: id });
            return {
                error: !exists,
                message: exists ? "Campaign ID is valid." : "Campaign ID does not exist."
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }
}

class UserService extends BaseModelService {
    constructor(model) {
        super(model);
    }

    // substituindo o método create de BaseModelService
    async create(data) {
        await Database.connect();
        try {
            const ret = await this.model.create(data);
            return {
                error: false,
                message: "Successfully created.",
                data: { id: ret._id }
            };
        } catch (error) {
            if (error.code === 11000) { // duplicate keys error on create (needs unique:true on schema)
                return {
                    error: true,
                    message: `Duplicate value: ${Object.keys(error.keyValue)[0]} already exists.`
                };
            }
            return {
                error: true,
                message: error.message
            };
        }
    }

}

module.exports = {
    ManagerService: new ManagerService(model.Manager),
    CampaignService: new CampaignService(model.Campaign),
    CallService: new CallService(model.Call),
    UserService: new UserService(model.User),
    isDatabaseConnected: Database.isDatabaseConnected,
};
