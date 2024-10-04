#!/usr/bin/node
const path = require("path");
const { ManagerService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("managerController", false).useEnvConfig().create();
const BaseController = require(path.resolve("src/controllers/baseController"));

class ManagerController extends BaseController {
    constructor(ControllerService, schema, logger) {
        super(ControllerService, schema, logger);
    };
}

module.exports = {
    ManagerController: new ManagerController(ManagerService, schema.zManager, log)
}
