#!/usr/bin/node
const path = require("path");
const { ObjectId } = require("mongoose").Types;
const { managerCreate, managerUpdate, managerFind, managerFindOne, managerRemove } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const _ = require("lodash"); // util module, for _.merge
const log = new Logger("managerController", false).useEnvConfig().create();

// POST
async function createManager(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        schema.zManager.parse(req.body);
        let ret = await managerCreate(req.body);
        return res.status(200).json({ error: false, message: `Successfully created.`, data: ret._id });
    } catch (error) {
        return next(error)
    }
}

// GET
async function getManagers(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        let ret = await managerFind({}, '-__v');

        return res.status(200).json({ error: false, data: ret });
    } catch (error) {
        return next(error)
    }
}

// GET :id
async function getManagerById(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // validando id
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // pega os dados in-db
        let returnedManager = await managerFindOne({ _id: id }, "-__v");
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(returnedManager)}`);
        if (!returnedManager) {
            return res.status(404).json({ error: true, message: 'Not found.' });
        };

        return res.status(200).json({ error: false, data: returnedManager._doc});
    } catch (error) {
        return next(error)
    }
}

// PATCH :id
async function updateManager(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) { return res.status(400).json({ error: true, message: "No data to update."})}
        
        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zManager.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: true,
                message: 'Invalid keys in body.',
                validKeys: validKeys
            });
        }

        // pega os dados in-db
        let managerFromDatabase = await managerFindOne({ _id: id }, "-_id -__v");
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(managerFromDatabase)}`);
        if (!managerFromDatabase) {
            return res.status(404).json({ error: true, message: 'Not found.' });
        };

        // corta createdAt e updatedAt
        // > vou testar sem cortar primeiro, se ficar errado eu att

        // monta o novo valor
        log.unit(`Original value: ` + JSON.stringify(managerFromDatabase._doc));
        log.unit(`Body (incoming patch): ` + JSON.stringify(req.body));
        let managerPatched = _.merge({ ...managerFromDatabase._doc }, req.body);
        log.unit(`Merged (patched) : ` + JSON.stringify(managerPatched))

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(managerPatched)}`)
        schema.zManager.parse(managerPatched);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await managerUpdate(id, managerPatched);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({ error: false, message: 'Successfully updated' });
    } catch (error) {
        next(error);
    }
}

// PUT :id
async function replaceManager(req, res, next) {
    try {
        log.info(`${req.logPrefix}`)
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) { return res.status(400).json({ error: true, message: "No data to update."})}
        
        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zManager.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: true,
                message: 'Invalid keys in body.',
                validKeys: validKeys
            });
        }

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(req.body)}`)
        schema.zManager.parse(req.body);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await managerUpdate(id, req.body);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({ error: false, message: 'Successfully updated.' });
    } catch (error) {
        next(error);
    }
}

// DELETE :id
async function deleteManager(req, res, next) {
    try {
        log.info(`${req.logPrefix}`)
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        let ret = await managerRemove(id);
        log.unit(`${req.logPrefix} Return from database: ${JSON.stringify(ret)}`)
        if (ret?.deletedCount > 0) {
            return res.status(200).json({ error: false, message: 'Successfully deleted.' })
        }
        return res.status(200).json({ error: false, message: "Does not exist." })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createManager,
    getManagers,
    getManagerById,
    updateManager,
    replaceManager,
    deleteManager
}
