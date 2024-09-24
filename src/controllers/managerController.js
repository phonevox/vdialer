#!/usr/bin/node
const path = require("path");
const { ObjectId } = require("mongoose").Types;
const { managerList, managerCreate, managerUpdate, managerFind } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const _ = require("lodash"); // util module, for _.merge
const log = new Logger("managerController", false).useEnvConfig().create();

async function createManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        schema.zManager.parse(req.body);
        let ret = await managerCreate(req.body);
        return res.status(200).json({ message: `Successfully created with id ${ret._id}` });
    } catch (error) {
        return next(error)
    }
}

async function getManagers(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        return res.status(200).json(await managerList());
    } catch (error) {
        return next(error)
    }
}

async function updateManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        const { id } = req.params;

        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) { return res.status(400).json({ message: "No data to update."})}

        // valida se o id é ao menos um ObjectId válido
        if (!ObjectId.isValid(id)) { return res.status(404).json({ message: "Invalid id." }) }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zManager.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: 'Chaves inválidas no corpo da requisição.',
                validKeys: validKeys
            });
        }
        

        // pega os dados in-db
        let managerFromDatabase = await managerFind({ _id: id }, "-_id -__v");
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(managerFromDatabase)}`);
        if (!managerFromDatabase) {
            return res.status(404).json({ id: id });
        };

        // corta createdAt e updatedAt
        // > vou testar sem cortar primeiro, se ficar errado eu att

        // monta o novo valor
        let managerPatched = _.merge({ ...managerFromDatabase._doc }, req.body);

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(managerPatched)}`)
        schema.zManager.parse(managerPatched);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await managerUpdate(id, managerPatched);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({ message: 'Successfully updated' });
    } catch (error) {
        next(error);
    }
}

async function replaceManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        return res.status(200).json(req.body);
    } catch (error) {
        next(error);
    }
}

async function deleteManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        res.status(200).json({ 'potato': 'fried' })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createManager,
    getManagers,
    updateManager,
    replaceManager,
    deleteManager
}
