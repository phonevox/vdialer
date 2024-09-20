#!/usr/bin/node
const path = require("path");
const { findManager, insertManager } = require(path.resolve("src/db")) 
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("callController", false).useEnvConfig().create();

module.exports = {
}