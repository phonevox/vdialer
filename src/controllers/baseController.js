const path = require("path");
const { buildSearchQuery } = require(path.resolve('src/utils/db.utils'));
const { schema } = require(path.resolve("src/models"));
const { ObjectId } = require("mongoose").Types; // to check mongoose type
const _ = require("lodash"); // util module, for _.merge

class BaseController {
    constructor(service, schema, logger) {
        this.ControllerService = service;
        this.schema = schema;
        this.log = logger;
    };

    // POST
    create = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);
            this.schema.parse(req.body);
            let ret = await this.ControllerService.create(req.body);
            return res.status(200).json({
                error: false,
                message: `Successfully created.`,
                data: ret.data.id
            });
        } catch (error) {
            return next(error);
        }
    };

    // GET
    get = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);
            let searchData = {};

            if (Object.keys(req.query).length > 0) {
                this.log.unit(`${req.logPrefix} Applying query parameters: ` + JSON.stringify(req.query));

                // @CHORE: 
                // check if parameter keys are valid before moving on

                // set as search parameter
                searchData = buildSearchQuery(req.query);
                log.unit(`Search data for mongoose: ` + JSON.stringify(searchData));
            };

            let ret = await this.ControllerService.find(searchData, '-__v');
            let valFound = Object.keys(ret.data).length;
            this.log.unit(`${req.logPrefix} Values returned: ${valFound}`);

            return res.status(200).json({
                error: false,
                valuesFound: valFound,
                data: ret.data
            });
        } catch (error) {
            return next(error);
        }
    };

    // GET :id
    getById = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);

            // validando id
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid id."
                })
            }

            // pegando os dados no database
            let ret = await this.ControllerService.findOne({ _id: id }, '-__v');
            this.log.unit(`${req.logPrefix} From database: ${JSON.stringify(ret.data)}`);
            if (!ret.data) {
                return res.status(404).json({
                    error: true,
                    message: 'Not found.'
                });
            }

            return res.status(200).json({
                error: false,
                data: ret.data
            });
        } catch (error) {
            return next(error);
        }
    };

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

    // DELETE :id
    delete = async (req, res, next) => {
        try {
            this.log.info(`${req.logPrefix}`);

            // confirmando que é um id válido
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(404).json({
                    error: true,
                    message: "Invalid id."
                });
            };

            // removendo
            let ret = await this.ControllerService.remove(id);
            if (ret.error) {
                return res.status(400).json({
                    error: true,
                    message: ret.message
                });
            }

            return res.status(200).json({
                error: false,
                message: 'Successfully deleted.'
            });

        } catch (error) {
            return next(error);
        }
    };
}

module.exports = BaseController
