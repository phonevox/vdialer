#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("middlewares.ratelimit", false).useEnvConfig().create();
const rateLimit = require("express-rate-limit");

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

module.exports = {
    ratelimit_auth,
    ratelimit_route
}
