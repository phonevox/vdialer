#!/usr/bin/node
const path = require("path");
const express = require('express');
const { Logger } = require(path.resolve('src/utils/logger'));
let router = express.Router();

router.post('/campaign/add', () => {})
router.post('/campaign/edit', () => {})
router.post('/campaign/delete', () => {})

module.exports = router;
