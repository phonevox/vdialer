#!/usr/bin/node
const path = require("path");
const colors = require("colors");
const express = require("express");
const { default: helmet } = require('helmet');
require("dotenv").config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`)});
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("api.js", false).useEnvConfig().create();

// - Bull ---
// - Express ---
const { errorValidation, setLogPrefix } = require(path.resolve('src/middlewares'));
const audiosRoute = require(path.resolve('src/routes/audiosRoutes'));
const callRoutes = require(path.resolve('src/routes/api/callRoutes'));
const campaignRoutes = require(path.resolve('src/routes/api/campaignRoutes'));
const managerRoutes = require(path.resolve('src/routes/api/managerRoutes'));
const userRoutes = require(path.resolve('src/routes/admin/userRoutes'));

// Inicializando as rotas do Express
const app = express();
app.use(express.json());
app.use(helmet());
app.use(setLogPrefix); // seta o prefixo pro log das requisições, acessível como "req.logPrefix"

app.use('/', audiosRoute);
app.use('/vdialer/api', callRoutes); // Faço as chamadas. Repasso os "afazeres" e o servidor em que executará
app.use('/vdialer/api', campaignRoutes); // Registro os "afazeres"
app.use('/vdialer/api', managerRoutes); // Registro os servidores
app.use('/vdialer/admin', userRoutes); // Manipulação de usuários

app.use(errorValidation);

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`You are running in <<${process.env.ENVIRONMENT}>> environment! (NODE_ENV:${process.env.NODE_ENV})`)
    console.log(`Listening on http://localhost:${process.env.EXPRESS_PORT}`.yellow)
})

// Model -> db.js -> Controller -> Route

// deve servir os áudios
// deve servir a api do discador, onde pode:
// > registrar manager (ou seja, vai precisar de um db)
// > registrar campanha
// > efetuar chamada
