#!/usr/bin/node
const path = require("path");
const { listManagers, insertManager, findManagerById } = require(path.resolve("src/db"))
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("managerController", false).useEnvConfig().create();

async function addManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    try {
        let ret = await insertManager(req.body);
        return res.json(ret._id);
    } catch (error) {
        log.error(`${req.logPrefix} ${JSON.stringify(error)}`);
        return res.json(error.message);
    }
}

async function findManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    try {
        return res.json(await findManagerById(req.body));
    } catch (error) {
        log.error(`${req.logPrefix} ${JSON.stringify(error)}`);
        return res.json(error.message);
    }
}

async function editManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    return res.json(req.body);
}

async function destroyManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    return res.json(req.body);
}

async function listManager(req, res) {
    log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

    try {
        return res.json(await listManagers());
    } catch (error) {
        log.error(`${req.logPrefix} ${JSON.stringify(error)}`);
        return res.json(error.message);
    }
}

module.exports = {
    addManager,
    editManager,
    destroyManager,
    findManager,
    listManager
}
