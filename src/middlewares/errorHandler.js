#!/usr/bin/node
const path = require("path");
const { isDatabaseConnected } = require(path.resolve("src/db"));
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("middlewares.errorhandler", false).useEnvConfig().create();
const { CastError, MongooseError } = require("mongoose");
const { fromError } = require("zod-validation-error");
const { ZodError } = require("zod");

// @CHORE:
// Melhorar o tratamento de erros. Pensar em alguma outra lógica pra isso?

// verboso demais? desnecessário?
const isZodError = (err) => { if (err instanceof ZodError) { return true } return false };

const errorValidation = (err, req, res, next) => {

    if (isZodError(err)) {
        const validationError = fromError(err);
        log.debug(`[VALIDATE ERROR] ${req.logPrefix} ${validationError.toString()}`);
        // log.trace(`[VALIDATE ERROR] ${err.stack}`)
        return res.status(400).json({ error: validationError.toString() });
    }

    if (err instanceof CastError) {
        log.trace(`[CAST ERROR] ${req.logPrefix} ${err.stack}`)
        log.warn(`[CAST ERROR] ${req.logPrefix} ${err.message}`) // provavelmente um id inválido na url
        return res.status(500).json({ message: `Cast error para ${err.kind} falhou, para o valor ${err.stringValue}. Consulte os logs para mais detalhes.` })
    }

    if (err instanceof MongooseError) {
        // checking if its a database-not-connected error (crude way through error message, should actually use model)
        if (err.toString().toLowerCase().indexOf("buffering timed out") >= 0 & !isDatabaseConnected() ) { 
            log.critical(`[MONGOOSE ERROR] Database is not connected!`);
        }

        log.critical(`[MONGOOSE ERROR] ${req.logPrefix} ${err.stack}`)
        return res.status(500).json({ message: 'Erro interno com o database, tente novamente mais tarde!' });
    }

    log.critical(`[GENERIC ERROR] ${req.logPrefix} ${err.stack}`)
    return res.status(500).json({ message: 'Erro interno, tente novamente mais tarde!' });
};

module.exports = {
    errorValidation
}
