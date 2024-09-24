#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("middlewares.utility", false).useEnvConfig().create();

// Parâmetros esperados na requisição
const expects = (parametrosObrigatorios) => {
    return (req, res, next) => {
        log.info(`${req.logPrefix} Validando parâmetros ${parametrosObrigatorios}`)
        // console.log(`${req.originalUrl || req.url} - Validando parâmetros ${parametrosObrigatorios}`)
        const parametrosFaltando = [];
        
        for (const parametro of parametrosObrigatorios) {

            // will search both req.body and req.params for the parameter.
            // maybe it shouldnt?
            if (!(parametro in req.body) & !(parametro in req.params)) {
                parametrosFaltando.push(parametro);
            }
        }
        
        if (parametrosFaltando.length > 0) {
            return res.status(401).json({ status: 'error', error: `Parâmetros faltando: ${parametrosFaltando.join(', ')}` });
        }

        next();
    };
};

// Obter o IP do cliente
function getClientIp(req) {
    const ip = req.ip.includes('::ffff:') ? req.ip.split(':')[3] : req.ip;
    return ip;
}

const setLogPrefix = (req, res, next) => {
    req.clientIp = getClientIp(req)
    req.logPrefix = `[${req.clientIp}] [${req.method}:${req.originalUrl || req.url}]`
    next()
};

module.exports = {
    setLogPrefix,
    getClientIp,
    expects
}
