#!/usr/bin/node
const path = require("path");
const express = require('express');
const { Logger } = require(path.resolve('src/utils/logger'));
let router = express.Router();

router.use('/audios', express.static(path.resolve("public/audios")))

module.exports = router;
