#!/usr/bin/node
const path = require("path");
const { extendZodOnce } = require(path.resolve("src/utils"));
extendZodOnce();

const {Call, zCall} = require(path.resolve("src/models/call.model"));
const {Campaign, zCampaign} = require(path.resolve("src/models/campaign.model"));
const {Manager, zManager } = require(path.resolve("src/models/manager.model"));
const {User, zUser} = require(path.resolve("src/models/user.model"));

module.exports = {
    model: {
        Call, Campaign, Manager, User
    },
    schema: {
        zCall, zCampaign, zManager, zUser
    }
};
