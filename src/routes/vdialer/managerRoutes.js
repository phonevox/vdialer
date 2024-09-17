#!/usr/bin/node
const path = require("path");
const express = require('express');
const { Logger } = require(path.resolve('src/utils/logger'));
let router = express.Router();

router.post('/manager/add', () => {})
router.post('/manager/edit', () => {})
router.post('/manager/delete', () => {})

module.exports = router;
