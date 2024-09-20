#!/usr/bin/node
const path = require("path");
const express = require('express');
const router = express.Router();

// controllers
// const {} = require(path.resolve("src/controllers/callController"))

router.post('/call/add', () => {})
router.post('/call/edit', () => {})
router.post('/call/delete', () => {})

module.exports = router;
