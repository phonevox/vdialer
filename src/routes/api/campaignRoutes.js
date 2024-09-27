#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { createCampaign, getCampaigns, getCampaignById, updateCampaign, replaceCampaign, deleteCampaign } = require(path.resolve("src/controllers/campaignController"))

router.post('/campaign', createCampaign);         // Cria
router.get('/campaign', getCampaigns);            // Lista tudo, ou filtra (via query)
router.get('/campaign/:id', getCampaignById);     // Lista um específico por id
router.patch('/campaign/:id', updateCampaign);    // Corrige
router.delete('/campaign/:id', deleteCampaign);   // Deleta

module.exports = router;
