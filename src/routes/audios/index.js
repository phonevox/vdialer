#!/usr/bin/node
const path = require("path");
const express = require('express');
const { Logger } = require(path.resolve("src/utils/logging"));
let router = express.Router();


( // nao
    router
        .get('/audios', () => {
            res.json({ 'message': 'ok' })
        })
) // questiona

module.exports = router;