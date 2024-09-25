#!/usr/bin/node
const path = require("path");
const express = require("express");
const router = express.Router();
const { expects } = require(path.resolve("src/middlewares"))

// controllers
const { createManager, getManagers, getManagerById, updateManager, replaceManager, deleteManager } = require(path.resolve("src/controllers/managerController"))


router.post('/manager', createManager);         // Cria
router.get('/manager', getManagers);            // Lista tudo, ou filtra (via query)
router.get('/manager/:id', getManagerById);     // Lista um específico por id
router.patch('/manager/:id', updateManager);    // Corrige
router.put('/manager/:id', replaceManager);     // Substitui
router.delete('/manager/:id', deleteManager);   // Deleta

module.exports = router;
