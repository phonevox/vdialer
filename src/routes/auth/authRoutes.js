#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { AuthController: Controller } = require(path.resolve("src/controllers/authController"))

// Definindo a rota para servir arquivos de áudio por nome de arquivo
router.post('/login', Controller.login);       // gera o access token e o refresh token. deve salvar algumas informações pra identificar quem pediu o refresh token, pra um caso de seu refresh token vazar (alguem pode pegar esse token e gerar novos access tokens)
router.post('/refresh', Controller.refresh);   // utiliza o refresh token pra criar um novo access token. o refresh permanece

module.exports = router;
