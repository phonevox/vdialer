#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("middlewares.errorhandler", false).useEnvConfig().create();
const { fromError } = require("zod-validation-error");
const { ZodError } = require("zod");

// verboso demais? desnecessário?
const isZodError = (err) => { if (err instanceof ZodError) { return true } return false };

const errorValidation = (err, req, res, next) => {
    if (isZodError(err)) {
        const validationError = fromError(err);
        log.debug(`[VALIDATE HANDLER] ${req.logPrefix} ${validationError.toString()}`);
        return res.status(400).json({ error: validationError.toString() });
    }

    log.critical(`[GENERIC ERROR HANDLER] ${req.logPrefix} Um erro ocorreu: "${JSON.stringify(err)}"`)
    return res.status(500).json({ message: 'Erro interno, tente novamente mais tarde!' });
};

module.exports = {
    errorValidation
}
