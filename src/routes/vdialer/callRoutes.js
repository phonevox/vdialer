#!/usr/bin/node
const path = require("path");
const express = require('express');
const { Logger } = require(path.resolve('src/utils/logger'));
let router = express.Router();

router.post('/call/add', () => {})
router.post('/call/edit', () => {})
router.post('/call/delete', () => {})

module.exports = router;
