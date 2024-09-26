#!/usr/bin/node
const { z } = require("zod");
const mongoose = require("mongoose");
const { zodSchema } = require("@zodyac/zod-mongoose");

// CAMPAIGN_SCHEMA.config.inbound.fagi
const zSubschemaFagi = z.object({
    protocol: z.string().default(undefined), // na real isso é obrigatório SE inbound.fagi for repassado
    host: z.string().default(undefined), // na real isso é obrigatório SE inbound.fagi for repassado
    port: z.number().min(1).max(65535).default(5038),
    route: z.string().default(undefined), // na real isso é obrigatório SE inbound.fagi for repassado
}).optional();


// CAMPAIGN_SCHEMA.config.inbound.context
const zSubschemaContext = z.object({
    context: z.string().optional().default(undefined), // na real isso é obrigatório SE inbound.context for repassado
    extension: z.string().optional().default(undefined), // na real isso é obrigatório SE inbound.context for repassado
    priority: z.number().int().min(0).optional().default(1),
}).optional();

const zCampaign = z.object({
    name: z.string(),
    description: z.string(),
    config: z.object({
        max_concurrent_calls: z.number().min(1),
        ringtime: z.number().min(0),
        number_prefix: z.string().nullable(),
        number_postfix: z.string().nullable(),
        inbound: z.object({
            fagi: zSubschemaFagi.optional().nullable(),
            context: zSubschemaContext.optional().nullable(),
        }).refine(data => { 
            // @WARNING
            // Problema grande, vamos lá...
            // Necessidade:
            // 1: inbound recebe inbound.fagi XOR inbound.context (um dos dois, mas não ambos)
            // 2: Caso receba inbound.context, os parametros context.context e context.extension são OBRIGATÓRIOS
            // 3: Caso receba inbound.fagi, os parametros fagi.protocol, fagi.host e fagi.route são OBRIGATÓRIOS
            // 4: Se eu deixar esses parâmetros obrigatórios, como, realmente obrigatórios no Zod
            // o zod-mongoose vai criar um esquema no Mongoose onde inbound.fagi e inbound.context são AMBOS OBRIGATÓRIOS*
            // (*na verdade não fagi e context em si, mas context.<param> e fagi.<param>, onde <param> não tem .default ou .optional)
            // e já percebemos pelo ponto 1, que isso não é verdade: fagi pode existir, e context não, vice versa.
            // 
            // Consequentemente, por tal motivo:
            // Eu faço os valores OBRIGATÓRIOS de inbound.fagi e inbound.context serem, por default, "null" ou "undefined"
            // e manualmente refino-os abaixo.
            // * nao me lembro da explicação completa pra essa parte, mas é baseado 
            // nas necessidades citadas acima, e do fato do zod-mongoose não "respeitar" o .optional() de verdade (pra esse caso!)
        
            // tem ambos
            if (data.fagi && data.context) {
                return false;
            }
        
            // tem fagi, faço parse pela fagi
            if (data.fagi) {
                const fagiValidation = zSubschemaFagi.safeParse(data.fagi);
                if (!fagiValidation.success) { // parse falhou
                    const errors = fagiValidation.error.errors;
                    return errors.every(error => error.path.every(field => zSubschemaFagi.shape[field] !== undefined));
                }
            }
        
            // tem context, faço parse pelo context
            if (data.context) {
                const contextValidation = zSubschemaContext.safeParse(data.context);
                if (!contextValidation.success) { // parse falhou
                    const errors = contextValidation.error.errors;
                    return errors.every(error => error.path.every(field => zSubschemaContext.shape[field] !== undefined));
                }
            }
        
            // nao tem nenhum, dou erro pq simplesmente faltou dados
            if (!data.fagi && !data.context) {
                return false;
            }
        
            return true; // Validação bem-sucedida
        }, {
            message: "Refine: Use only one inbound type",
        }),
    }).strict()
});

const CampaignSchema = zodSchema(zCampaign, { timestamps: true }); // zod-to-mongoose
console.log(CampaignSchema)
const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = {
    Campaign,
    zCampaign
};
