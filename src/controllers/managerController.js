#!/usr/bin/node
const path = require("path");
const { listManagers, insertManager, findManagerById } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("managerController", false).useEnvConfig().create();

async function createManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        schema.zManager.parse(req.body);
        let ret = await insertManager(req.body);
        return res.json(ret._id);
    } catch (error) {
        return next(error)
    }
}

async function getManagers(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        return res.json(await listManagers());
    } catch (error) {
        return next(error)
    }
}

async function updateManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        const { id } = req.params;
        log.trace('id: ' + id)

        // pega os dados in-db
        // monta o novo valor
        // dá parse pra ver se vai ficar tudo certo
        // estando tudo certo, manda pro db a alteração

        return res.json(req.body);
    } catch (error) {
        next(error);
    }
}

async function replaceManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        return res.json(req.body);
    } catch (error) {
        next(error);
    }
}

async function deleteManager(req, res, next) {
    try {
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        res.json({ 'potato': 'fried' })
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
