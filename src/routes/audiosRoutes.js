#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { servePublicAudios } = require(path.resolve("src/controllers/audiosController"))

// Definindo a rota para servir arquivos de áudio por nome de arquivo
router.get('/audios/:filename', servePublicAudios);

module.exports = router;
