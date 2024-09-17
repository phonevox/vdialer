#!/usr/bin/node
const path = require("path");
const colors = require("colors");
const express = require("express");
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("api.js", true).useEnvConfig().create();

// - Bull ---
// - Express ---
const { setLogPrefix } = require(path.resolve('src/middlewares'));
const audiosRoute = require(path.resolve('src/routes/audiosRoutes'));
const callRoutes = require(path.resolve('src/routes/vdialer/callRoutes'));
const campaignRoutes = require(path.resolve('src/routes/vdialer/campaignRoutes'));
const managerRoutes = require(path.resolve('src/routes/vdialer/managerRoutes'));

// Inicializando as rotas do Express
const app = express();

app.use('/', setLogPrefix, audiosRoute);
app.use('/vdialer', setLogPrefix, callRoutes); // Faço as chamadas. Repasso os "afazeres" e o servidor em que executará
app.use('/vdialer', setLogPrefix, campaignRoutes); // Registro os "afazeres"
app.use('/vdialer', setLogPrefix, managerRoutes); // Registro os servidores

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`You are running in <<${process.env.ENVIRONMENT}>> environment! (NODE_ENV:${process.env.NODE_ENV})`)
    console.log(`Listening on http://localhost:${process.env.EXPRESS_PORT}`.yellow)
})

// deve servir os áudios
// deve servir a api do discador, onde pode:
// > registrar manager (ou seja, vai precisar de um db)
// > registrar campanha
// > efetuar chamada