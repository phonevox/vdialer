#!/usr/bin/node
const path = require("path");
const { z } = require("zod");
const { extendZod } = require("@zodyac/zod-mongoose");
extendZod(z); // vou leigamente assumir que não tem problema extender várias vezes. se perceber algo, arrumo

const {Call, zCall} = require(path.resolve("src/models/call.model"));
const {Campaign, zCampaign} = require(path.resolve("src/models/campaign.model"));
const {Manager, zManager} = require(path.resolve("src/models/manager.model"));

module.exports = {
    model: {
        Call, Campaign, Manager
    },
    schema: {
        zCall, zCampaign, zManager
    }
};
