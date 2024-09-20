#!/usr/bin/node
const path = require("path");
const express = require("express");
const router = express.Router();
const { expects } = require(path.resolve("src/middlewares"))

// controllers
const { addManager, editManager, destroyManager, findManager, listManager } = require(path.resolve("src/controllers/managerController"))

router.post('/manager/add', addManager);
router.post('/manager/edit', expects(["_id"]), editManager);
router.post('/manager/delete', expects(["_id"]), destroyManager);
router.get('/manager/find', expects(["_id"]), findManager);
router.get('/manager/list', listManager);

module.exports = router;
