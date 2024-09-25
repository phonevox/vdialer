#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");
const { zodSchema } = require("@zodyac/zod-mongoose");

const zManager = z.object({
    name: z.string(),
    description: z.string().optional(),
    config: z.object({
        outbound_context: z.string().default("from-internal")
    }).strict(),
    auth: z.object({
        host: z.string(),
        port: z.number().default(5038),
        user: z.string(),
        password: z.string()
    }).strict()
});

// ill try to use something to do zod-to-mongoose so i dont have to declare types twice
// since that leaves for opportunity where i could make something like telephone = z.string || telephone = type:number
// (different types, one on zod, one on mongoose)

// const ManagerSchema = mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true
//         },
//         description: {
//             type: String,
//             required: false
//         },
//         config: new mongoose.Schema({
//             outbound_context: {
//                 type: String,
//                 required: true,
//                 default: "from-internal"
//             }
//         }, {_id: false}),
//         auth: new mongoose.Schema({
//             host: {
//                 type: String,
//                 required: true
//             },
//             port: {
//                 type: Number,
//                 required: true,
//                 default: 5038
//             },
//             user: {
//                 type: String,
//                 required: true
//             },
//             password: {
//                 type: String,
//                 required: true
//             }
//         }, {_id: false})
//     },
//     {
//         timestamps: true
//     }
// )

const ManagerSchema = zodSchema(zManager, {timestamps:true}); // zod-to-mongoose
const Manager = mongoose.model("Manager", ManagerSchema);

module.exports = {
    Manager,
    zManager
};
