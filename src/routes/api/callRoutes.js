#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { CallController: Controller } = require(path.resolve("src/controllers/callController"))

router.post('/call', Controller.create);         // Cria
router.get('/call', Controller.get);            // Lista tudo, ou filtra (via query)
router.get('/call/:id', Controller.getById);     // Lista um específico por id
router.patch('/call/:id', Controller.update);    // Corrige
router.delete('/call/:id', Controller.delete);   // Deleta

module.exports = router;
