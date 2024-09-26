#!/usr/bin/node
const path = require("path");
const { z } = require("zod");
const { extendZod } = require("@zodyac/zod-mongoose");
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("utils", false).useEnvConfig().create();

let isZodExtended = false;

function extendZodOnce() {
    log.unit(`@zodyac/zod-mongoose : extending zod...`)
    if (!isZodExtended) {
        extendZod(z);
        isZodExtended = true;
    }
}

module.exports = {
    extendZodOnce
}
