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

async function getManagers(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    try {
        return res.json(await listManagers());
    } catch (error) {
        log.error(`${req.logPrefix} ${JSON.stringify(error)}`);
        return res.json(error.message);
    }
}

async function updateManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
    const { id } = req.params;

    log.trace('id: ' + id)

    // validação de parâmetros

    // resumo da alteração em log

    // tentativa

    return res.json(req.body);
}

async function replaceManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    return res.json(req.body);
}

async function deleteManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    res.json({'potato': 'fried'})
}

module.exports = {
    createManager,
    getManagers,
    updateManager,
    replaceManager,
    deleteManager
}
