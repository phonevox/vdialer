#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("userController", false).useEnvConfig().create();

const { ObjectId } = require("mongoose").Types;
const { UserService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { buildSearchQuery } = require(path.resolve('src/utils/db.utils'));
const { bcryptPassword } = require(path.resolve('src/utils'));
const _ = require("lodash"); // util module, for _.merge

// POST
async function createUser(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);

        schema.zUser.parse(req.body);

        // iteramos sobre todas as chaves do body, e limpamos o input com trim
        for (const key in req.body) {
            if (key === 'password') { continue };
            req.body[key] = req.body[key].trim();
        }

        let ret = await UserService.create(req.body);
        if (ret.error) {
            log.warn(`${req.logPrefix} Failed to create user: ${ret.message}`);
            return res.status(400).json({
                error: true,
                message: ret.message
            });
        }

        return res.status(200).json({
            error: false,
            message: `Successfully created.`,
            data: ret.data.id
        });

    } catch (error) {
        return next(error)
    }
}

// GET
async function getUsers(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);

        // aplicando os parametros de pesquisa direto dos queryparams
        let searchData = {};
        if (Object.keys(req.query).length > 0) {
            log.unit(`${req.logPrefix} Applying query parameters: ` + JSON.stringify(req.query));

            // @CHORE: 
            // check if parameter keys are valid before moving on

            // NÃO, você NÃO PODE pesquisar por SENHA. Eu NÃO VOU implementar isso.

            // set as search parameter
            searchData = buildSearchQuery(req.query); // pra transformar em regex
            log.unit(`Search data for mongoose: ` + JSON.stringify(searchData));
        };

        let ret = await UserService.find(searchData, '-__v');
        let valuesFound = Object.keys(ret.data).length;
        log.unit(`${req.logPrefix} Values returned: ${valuesFound}`);

        return res.status(200).json({
            error: false,
            valuesFound: valuesFound,
            data: ret.data
        });
    } catch (error) {
        return next(error)
    }
}

// GET :id
async function getUserById(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        // validando id
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(404).json({
                error: true,
                message: "Invalid id."
            })
        }

        // pega os dados in-db
        let ret = await UserService.findOne({ _id: id }, "-__v", true);
        if (!ret.data) {
            return res.status(404).json({
                error: true,
                message: 'Not found.'
            });
        };

        return res.status(200).json({
            error: false,
            data: ret.data
        });
    } catch (error) {
        return next(error)
    }
}

// PATCH :id
async function updateUser(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);

        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: true,
                message: "No data to update."
            })
        }

        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(404).json({
                error: true,
                message: "Invalid id."
            })
        }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zUser.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: true,
                message: 'Invalid keys in body.',
                validKeys: validKeys
            });
        }

        // pega os dados in-db
        let ret = await UserService.findOne({ _id: id }, "-_id -__v", true);
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(ret.data)}`);
        if (!ret.data) {
            return res.status(404).json({
                error: true,
                message: 'Not found.'
            });
        };

        // corta createdAt e updatedAt
        // > vou testar sem cortar primeiro, se ficar errado eu att

        // monta o novo valor
        log.unit(`Original value: ` + JSON.stringify(ret.data)); // acho que o lean retorna o doc completo
        log.unit(`Body (incoming patch): ` + JSON.stringify(req.body));
        let patchedDocument = _.merge({ ...ret.data }, req.body);
        log.unit(`Merged (patched) : ` + JSON.stringify(patchedDocument))

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(patchedDocument)}`)
        schema.zUser.parse(patchedDocument);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await UserService.update(id, patchedDocument);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({
            error: false,
            message: 'Successfully updated.'
        });

    } catch (error) {
        next(error);
    }
}

// DELETE :id
async function deleteUser(req, res, next) {
    try {
        log.info(`${req.logPrefix}`)
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(404).json({
                error: true,
                message: "Invalid id."
            })
        }

        let ret = await UserService.remove(id);
        log.unit(`${req.logPrefix} Return from database: ${JSON.stringify(ret)}`)
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
        next(error);
    }
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}
