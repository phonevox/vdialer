#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const { fromError } = require("zod-validation-error");
const { ZodError } = require("zod");

const log = new Logger("middlewares", false).useEnvConfig().create();

const rateLimit = require('express-rate-limit');

const AUTH_RATELIMIT_WINDOW_MINUTES  = 15 // minutos
const AUTH_MAX_REQUESTS_PER_WINDOW   = 999
const ROUTE_RATELIMIT_WINDOW_MINUTES = 15 // minutos
const ROUTE_MAX_REQUESTS_PER_WINDOW  = 999

const ratelimit_auth = rateLimit({
    windowsMs: AUTH_RATELIMIT_WINDOW_MINUTES * 60 * 1000, // 15 minutos
    max: AUTH_MAX_REQUESTS_PER_WINDOW, // Número máximo de solicitações permitidas dentro do intervalo
    message: 'Muitas solicitações a partir deste IP. Por favor, tente novamente mais tarde.',
    handler: (req, res) => {
        res.status(429).json({ message: 'Limite de taxa excedido. Por favor, tente novamente mais tarde.' });
    },
});


const ratelimit_route = rateLimit({
    windowsMs: ROUTE_RATELIMIT_WINDOW_MINUTES * 60 * 1000, // 15 minutos
    max: ROUTE_MAX_REQUESTS_PER_WINDOW, // Número máximo de solicitações permitidas dentro do intervalo
    message: 'Muitas solicitações a partir deste IP. Por favor, tente novamente mais tarde.',
    handler: (req, res) => {
        res.status(429).json({ message: 'Limite de taxa excedido. Por favor, tente novamente mais tarde.' });
    },
});

// Obter o IP do cliente
function getClientIp(req) {
    const ip = req.ip.includes('::ffff:') ? req.ip.split(':')[3] : req.ip;
    return ip;
}

// Middleware genérico para checagens
const performChecks = (req, res, next) => {
    try {
        next();
    } catch (error) {
        res.status(400).json({ error: 'Falha nas verificações. Verifique os dados da requisição.' });
    }
};

const setLogPrefix = (req, res, next) => {
    req.clientIp = getClientIp(req)
    req.logPrefix = `[${req.clientIp}] [${req.method}:${req.originalUrl || req.url}]`
    next()
};

const genericErrorHandling = (err, req, res, next) => {
    if (err instanceof ZodError) {
        const validationError = fromError(err);
        log.debug(`[VALIDATE HANDLER] ${req.logPrefix} ${validationError.toString()}`);
        return res.status(400).json({ error: validationError.toString() });
    }

    log.critical(`[GENERIC ERROR HANDLER] ${req.logPrefix} Um erro ocorreu: "${JSON.stringify(err)}"`)
    return res.status(500).json({ message: 'Erro interno, tente novamente mais tarde!' });
};

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

module.exports = {
    performChecks,
    expects,
    setLogPrefix,
    ratelimit_route,
    ratelimit_auth,
    genericErrorHandling
}