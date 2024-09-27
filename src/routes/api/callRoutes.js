#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
const { createCall, getCalls, getCallById, updateCall, replaceCall, deleteCall } = require(path.resolve("src/controllers/callController"))

router.post('/call', createCall);         // Cria
router.get('/call', getCalls);            // Lista tudo, ou filtra (via query)
router.get('/call/:id', getCallById);     // Lista um específico por id
router.patch('/call/:id', updateCall);    // Corrige
router.delete('/call/:id', deleteCall);   // Deleta

module.exports = router;
