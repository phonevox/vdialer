#!/usr/bin/node
const path = require("path");
const { z } = require("zod");
const { extendZod } = require("@zodyac/zod-mongoose");
const { Logger } = require(path.resolve('src/utils/logger'));
const bcrypt = require("bcrypt");
const log = new Logger("utils", false).useEnvConfig().create();

let isZodExtended = false;

function extendZodOnce() {
    log.unit(`@zodyac/zod-mongoose : extending zod...`)
    if (!isZodExtended) {
        extendZod(z);
        isZodExtended = true;
    }
}

/**
 * Função utilitária para encriptar uma senha.
 * @param {string} text - O texto a ser encriptado (senha).
 * @param {number} saltRounds - Número de rounds para gerar o salt.
 * @returns {Promise<string>} - Retorna uma Promise com a senha encriptada.
 */
async function bcryptPassword(text, saltRounds) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(text, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Erro ao encriptar a senha: ' + error.message);
    }
}

module.exports = {
    bcryptPassword,
    extendZodOnce
}
