#!/usr/bin/node
const path = require("path");
const { findManager, insertManager } = require(path.resolve("src/db")) 

async function listManager(req, res) {
    console.log( await findManager() )
    res.json({status: 200})
}

async function addManager(req, res) {
    let ret
    try {
        console.log('Request body: ' + JSON.stringify(req.body))
        ret = await insertManager(req.body);
    } catch (error) {
        return res.json(error.message);
    }
    return res.json(ret._id);
}

module.exports = {
    listManager,
    addManager
}
