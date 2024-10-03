#!/usr/bin/node
const path = require("path");
const express = require("express");
const router = express.Router();

// controllers
const { ManagerController: Controller } = require(path.resolve("src/controllers/managerController"))

router.post('/manager', Controller.create);         // Cria
router.get('/manager', Controller.get);            // Lista tudo, ou filtra (via query)
router.get('/manager/:id', Controller.getById);     // Lista um específico por id
router.patch('/manager/:id', Controller.update);    // Corrige
router.delete('/manager/:id', Controller.delete);   // Deleta

module.exports = router;
