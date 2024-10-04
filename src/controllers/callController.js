#!/usr/bin/node
const { error } = require("console");
const path = require("path");
const { CallService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("callController", false).useEnvConfig().create();
const BaseController = require(path.resolve("src/controllers/baseController"));

class CallController extends BaseController {
    constructor(ControllerService, schema, log) {

        const validateIds = async (req, res, isUpdate = false) => {
            const { campaign, manager } = req.body;
            let errorOccurred;

            const validateId = async (id, validateFunction, errorMessage) => {
                if (id && !await validateFunction(id) && !errorOccurred) {
                    errorOccurred = res.status(404).json({
                        error: true,
                        message: errorMessage
                    });
                }
            };

            if (!isUpdate) {
                // (create) obrigatórios
                await validateId(campaign, this.ControllerService.isValidCampaign, "Invalid campaign.");
                await validateId(manager, this.ControllerService.isValidManager, "Invalid manager id.");
            } else {
                // (update) opcional, só valida se presente
                if (campaign) await validateId(campaign, this.ControllerService.isValidCampaign, "Invalid campaign.");
                if (manager) await validateId(manager, this.ControllerService.isValidManager, "Invalid manager id.");
            }

            return errorOccurred
        };

        const createValidateIds = async (req, res) => {
            return validateIds(req, res, false);
        };

        const updateValidateIds = async (req, res) => {
            return validateIds(req, res, true);
        };

        const hooks = {
            beforeCreate: createValidateIds,
            beforeUpdate: updateValidateIds,
        }

        super(ControllerService, schema, log, hooks);

    };

}

module.exports = {
    CallController: new CallController(CallService, schema.zCall, log)
}
