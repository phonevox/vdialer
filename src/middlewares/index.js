#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("middlewares", false).useEnvConfig().create();

const { errorValidation } = require(path.resolve("src/middlewares/errorHandler"));
const { ratelimit_auth, ratelimit_route } = require(path.resolve("src/middlewares/ratelimit"));
const { setLogPrefix, getClientIp, expects, securePasswords } = require(path.resolve("src/middlewares/utility"));

module.exports = {
    errorValidation, 
    ratelimit_auth, 
    ratelimit_route,
    setLogPrefix, 
    getClientIp, 
    expects,
    securePasswords
}
