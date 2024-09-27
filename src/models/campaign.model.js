#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");

const zCampaign = z.object({
    name: z.string(),
    description: z.string(),
    config: z.object({
        max_concurrent_calls: z.number().min(1),
        ringtime: z.number().min(0),
        number_prefix: z.string().nullable().default(null),
        number_postfix: z.string().nullable().default(null),
        inbound: z.object({
            fagi: z.object({
                protocol: z.string(),
                host: z.string(),
                port: z.number().min(1).max(65535),
                // port: z.number().min(1).max(65535).defult(5038),
                route: z.string(),
            }).nullable().default(null),
            context: z.object({
                context: z.string(),
                extension: z.string(),
                priority: z.number().int().min(0),
            }).nullable().default(null)
        }).refine(data => {
            // inbound.fagi XOR inbound.context
            // @FIXME: É verificado primeiro os requireds, e depois se há ambos
            const hasFagi = data.fagi !== null;
            const hasContext = data.context !== null;
            return hasFagi !== hasContext;
        }, {
            message: "'fagi' XOR 'context'",
        }), // não quero novos
    }).strict()
});

const CampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    config: {
        max_concurrent_calls: {
            type: Number,
            min: 1,
            required: true
        },
        ringtime: {
            type: Number,
            min: 0,
            required: true
        },
        number_prefix: {
            type: String,
            default: null
        },
        number_postfix: {
            type: String,
            default: null
        },
        inbound: {
            fagi: {
                type: new mongoose.Schema({
                    protocol: {
                        type: String,
                        required: true
                    },
                    host: {
                        type: String,
                        required: true
                    },
                    port: {
                        type: Number,
                        min: 1,
                        max: 65535,
                        default: 5038
                    },
                    route: {
                        type: String,
                        required: true
                    }
                }, { _id: false }),
                default: null
            },
            context: {
                type: new mongoose.Schema({
                    context: {
                        type: String,
                        required: true
                    },
                    extension: {
                        type: String,
                        required: true
                    },
                    priority: {
                        type: Number,
                        min: 0,
                        default: 1
                    }
                }, { _id: false }),
                default: null
            }
        }
    }
}, {
    strict: true
});

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = {
    Campaign,
    zCampaign
};
