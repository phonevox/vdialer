#!/usr/bin/node

require("dotenv").config();
const path = require("path");
const colors = require("colors");
const { Logger } = require(path.resolve('src/util/logging'));
// Bull
// Express
const express = require("express");
const { setLogPrefix } = require(path.resolve('src/express/middleware'));
const ROUTES = require(path.resolve('src/express/routing'));

const log = new Logger("api.js", false).useEnvConfig().create()

// Inicializando as rotas do Express
const app = express();

app.use('/', setLogPrefix, ROUTES)

// deve servir os áudios
// deve servir a api do discador, onde pode:
// > registrar manager (ou seja, vai precisar de um db)
// > registrar campanha
// > efetuar chamada