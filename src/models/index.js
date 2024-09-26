#!/usr/bin/node
const path = require("path");
const { extendZodOnce } = require(path.resolve("src/utils"));
extendZodOnce();

const {Call, zCall} = require(path.resolve("src/models/call.model"));
const {Campaign, zCampaign} = require(path.resolve("src/models/campaign.model"));
const {Manager, zManager } = require(path.resolve("src/models/manager.model"));

module.exports = {
    model: {
        Call, Campaign, Manager
    },
    schema: {
        zCall, zCampaign, zManager
    }
};
