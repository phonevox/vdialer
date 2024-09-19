#!/usr/bin/node
const path = require("path");
const express = require("express");
const { Logger } = require(path.resolve("src/utils/logger"));
const router = express.Router();

// controllers
const { listManager, addManager } = require(path.resolve("src/controllers/managerController"))

router.post('/manager/add', addManager)
router.post('/manager/edit', (req, res) => {})
router.post('/manager/delete', (req, res) => {})
router.get('/manager/list', listManager)

module.exports = router;
