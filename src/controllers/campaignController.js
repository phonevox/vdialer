#!/usr/bin/node
const path = require("path");
const { CampaignService } = require(path.resolve("src/db"))
const { Logger } = require(path.resolve('src/utils/logger'));
const { schema } = require(path.resolve("src/models"));
const log = new Logger("campaignController", false).useEnvConfig().create();
const BaseController = require(path.resolve("src/controllers/baseController"));

class CampaignController extends BaseController {
    constructor(service, schema, logger) {
        super(service, schema, logger);
    };
}

module.exports = {
    CampaignController: new CampaignController(CampaignService, schema.zCampaign, log)
}
