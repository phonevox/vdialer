#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { CampaignController: Controller } = require(path.resolve("src/controllers/campaignController"))

router.post('/campaign', Controller.create);         // Cria
router.get('/campaign', Controller.get);            // Lista tudo, ou filtra (via query)
router.get('/campaign/:id', Controller.getById);     // Lista um específico por id
router.patch('/campaign/:id', Controller.update);    // Corrige
router.delete('/campaign/:id', Controller.delete);   // Deleta

module.exports = router;
