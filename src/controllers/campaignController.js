#!/usr/bin/node
const path = require("path");
const { ObjectId } = require("mongoose").Types;
const { CampaignService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const { buildSearchQuery } = require(path.resolve('src/utils/db.utils'));
const _ = require("lodash"); // util module, for _.merge
const log = new Logger("campaignController", false).useEnvConfig().create();

// POST
async function createCampaign(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        schema.zCampaign.parse(req.body);
        let ret = await CampaignService.create(req.body);
        return res.status(200).json({ error: false, message: `Successfully created.`, data: ret._id });
    } catch (error) {
        return next(error)
    }
}

// GET
async function getCampaigns(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        
        let searchData = {};

        if (Object.keys(req.query).length > 0) {
            log.unit(`${req.logPrefix} Applying query parameters: ` + JSON.stringify(req.query));

            // @CHORE: 
            // check if parameter keys are valid before moving on

            // set as search parameter
            searchData = buildSearchQuery(req.query);
            log.unit(`Search data for mongoose: ` + JSON.stringify(searchData));
        };

        let ret = await CampaignService.find(searchData, '-__v');
        let valuesFound = Object.keys(ret).length;
        log.unit(`${req.logPrefix} Values returned: ${valuesFound}`);

        return res.status(200).json({ error: false, valuesFound: valuesFound, data: ret });
    } catch (error) {
        return next(error)
    }
}

// GET :id
async function getCampaignById(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // validando id
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // pega os dados in-db
        let retFromDatabase = await CampaignService.findOne({ _id: id }, "-__v", true);
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(retFromDatabase)}`);
        if (!retFromDatabase) {
            return res.status(404).json({ error: true, message: 'Not found.' });
        };

        return res.status(200).json({ error: false, data: retFromDatabase});
    } catch (error) {
        return next(error)
    }
}

// PATCH :id
async function updateCampaign(req, res, next) {
    try {
        log.info(`${req.logPrefix}`);
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) { return res.status(400).json({ error: true, message: "No data to update."})}
        
        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zCampaign.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: true,
                message: 'Invalid keys in body.',
                validKeys: validKeys
            });
        }

        // pega os dados in-db
        let retFromDatabase = await CampaignService.findOne({ _id: id }, "-_id -__v", true);
        log.unit(`${req.logPrefix} From database: ${JSON.stringify(retFromDatabase)}`);
        if (!retFromDatabase) {
            return res.status(404).json({ error: true, message: 'Not found.' });
        };

        // corta createdAt e updatedAt
        // > vou testar sem cortar primeiro, se ficar errado eu att

        // monta o novo valor
        log.unit(`Original value: ` + JSON.stringify(retFromDatabase)); // acho que o lean retorna o doc completo
        log.unit(`Body (incoming patch): ` + JSON.stringify(req.body));
        let patchedDocument = _.merge({ ...retFromDatabase }, req.body);
        log.unit(`Merged (patched) : ` + JSON.stringify(patchedDocument))

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(patchedDocument)}`)
        schema.zCampaign.parse(patchedDocument);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await CampaignService.update(id, patchedDocument);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({ error: false, message: 'Successfully updated' });
    } catch (error) {
        next(error);
    }
}

// PUT :id
async function replaceCampaign(req, res, next) {
    try {
        log.info(`${req.logPrefix}`)
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        
        // valida se passou dados pra fazer a atualização
        if (Object.keys(req.body).length === 0) { return res.status(400).json({ error: true, message: "No data to update."})}
        
        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
        let validKeys = Object.keys(schema.zCampaign.shape);
        const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
        if (hasInvalidKeys) {
            return res.status(400).json({
                error: true,
                message: 'Invalid keys in body.',
                validKeys: validKeys
            });
        }

        // dá parse pra ver se vai ficar tudo certo
        log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(req.body)}`)
        schema.zCampaign.parse(req.body);

        // estando tudo certo, manda pro db a alteração
        log.unit(`Values are valid, sending to database.`)
        let updReturn = await CampaignService.update(id, req.body);

        // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
        if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

        return res.status(200).json({ error: false, message: 'Successfully updated.' });
    } catch (error) {
        next(error);
    }
}

// DELETE :id
async function deleteCampaign(req, res, next) {
    try {
        log.info(`${req.logPrefix}`)
        log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

        // valida se o id é ao menos um ObjectId válido
        const { id } = req.params;
        if (!ObjectId.isValid(id)) { return res.status(404).json({ error: true, message: "Invalid id." }) }

        let ret = await CampaignService.remove(id);
        log.unit(`${req.logPrefix} Return from database: ${JSON.stringify(ret)}`)
        if (ret?.deletedCount > 0) {
            return res.status(200).json({ error: false, message: 'Successfully deleted.' })
        }
        return res.status(200).json({ error: false, message: "Does not exist." })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    replaceCampaign,
    deleteCampaign
}
