#!/usr/bin/node
const path = require("path");
const { CallService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const { ObjectId } = require("mongoose").Types; // mongoose type check
const _ = require("lodash"); // util module, for _.merge
const log = new Logger("callController", false).useEnvConfig().create();
const BaseController = require(path.resolve("src/controllers/baseController"));

class CallController extends BaseController {
    constructor(ControllerService, schema, log) {
        super(ControllerService, schema, log);
    };

    // utilitary específico desse controller. retorna true/false
    isInvalidCampaign = async (id) => {
        if (!await this.ControllerService.validateCampaignId(id)) { return true } return false;
    }

    // utilitary específico desse controller. retorna true/false
    isInvalidManager = async (id) => {
        if (!await this.ControllerService.validateManagerId(id)) { return true } return false;
    }

    // OVERRIDE REASON: precisa checar o id da campanha e do manager
    // (logo, não é o comportamento padrão)
    create = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);

            this.schema.parse(req.body);

            // - OVERRIDE REASON -
            // checando o id de campanha e do manager antes de criar
            if (await this.isInvalidCampaign(req.body.campaign)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid campaign id."
                })
            };
            if (await this.isInvalidManager(req.body.manager)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid manager id."
                })
            };
            
            // criando, de fato
            let ret = await this.ControllerService.create(req.body);
            return res.status(200).json({
                error: false,
                message: `Successfully created.`,
                data: ret.data.id
            });
        } catch (error) {
            return next(error)
        }
    }

    // OVERRIDE REASON: precisa checar o id da campanha e do manager
    // PATCH :id
    update = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);

            // validando se passou dados pra atualizar
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    error: true,
                    message: "No data to update."
                })
            }

            // validando se o id é um objectid válido
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid id."
                })
            }

            // validadndo se os campos repassados existem
            let validKeys = Object.keys(this.schema.shape);
            const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
            if (hasInvalidKeys) {
                return res.status(400).json({
                    error: true,
                    message: 'Invalid keys in body.'
                });
            }
 
            // - OVERRIDE REASON -
            // valida se o manager ou campaign tem ids que realmente existem
            if (req.body?.campaign && await this.isInvalidCampaign(req.body.campaign)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid campaign id."
                })
            };
            if (req.body?.manager && await this.isInvalidManager(req.body.manager)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid manager id."
                })
            };

            // pegando os dados do database
            let ret = await this.ControllerService.findOne({ _id: id }, '-__v');
            this.log.unit(`${req.logPrefix} From database: ${JSON.stringify(ret.data)}`);
            if (!ret.data) {
                return res.status(404).json({
                    error: true,
                    message: 'Not found.'
                });
            };

            // usando os valores do banco de dados, junto com os repassados à nos
            // para criar o novo documento que substituirá o antigo (mantendo o id)
            let newDocument = _.merge({ ...ret.data._doc }, req.body);
            this.log.unit(`${req.logPrefix} Patched: ${JSON.stringify(newDocument)}`);

            // confirmando com parse antes de mandar pro database
            this.schema.parse(newDocument);

            // mandando pro database
            let retUpdate = await this.ControllerService.update(id, newDocument);
            if (retUpdate.error) {
                this.log(`${req.logPrefix} Error updating: ${JSON.stringify(retUpdate)}`);
                return res.status(400).json({
                    error: true,
                    message: 'Error updating.'
                });
            };

            return res.status(200).json({
                error: false,
                message: 'Successfully updated.'
            });

        } catch (error) {
            return next(error);
        }
    };
}

module.exports = {
    CallController: new CallController(CallService, schema.zCall, log)
}
