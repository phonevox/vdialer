#!/usr/bin/node
const path = require("path");
const { CallService } = require(path.resolve("src/db"))
const { schema } = require(path.resolve("src/models"));
const { Logger } = require(path.resolve('src/utils/logger'));
const log = new Logger("callController", false).useEnvConfig().create();
const BaseController = require(path.resolve("src/controllers/baseController"));

class CallController extends BaseController {
    constructor(service, schema, logger) {
        super(service, schema, logger);
    };

    // TODO(adrian): validar e re-implementar isso, pode ter coisa diferente da base! (provavelmente tem)
}

module.exports = {
    CallController: new CallController(CallService, schema.zCall, log)
}

// async function invalidCampaign(id) {
//     if (!await CallService.validateCampaignId(id)) { return true } return false;
// }

// async function invalidManager(id) {
//     if (!await CallService.validateManagerId(id)) { return true } return false;
// }

// // POST
// async function createCall(req, res, next) {
//     try {
//         log.info(`${req.logPrefix}`);
//         log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

//         schema.zCall.parse(req.body);
//         const { number, name, ringtime, campaign, manager } = req.body

//         if (await invalidCampaign(campaign)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid campaign id."
//             })
//         };
//         if (await invalidManager(manager)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid manager id."
//             })
//         };

//         let ret = await CallService.create({
//             "number": number,
//             "name": name,
//             "ringtime": ringtime,
//             "campaign": campaign,
//             "manager": manager
//         });
//         return res.status(200).json({
//             error: false,
//             message: `Successfully created.`,
//             data: ret._id
//         });
//     } catch (error) {
//         return next(error)
//     }
// }

// // GET
// async function getCalls(req, res, next) {
//     try {
//         log.info(`${req.logPrefix}`);

//         let searchData = {};

//         if (Object.keys(req.query).length > 0) {
//             log.unit(`${req.logPrefix} Applying query parameters: ` + JSON.stringify(req.query));

//             // @CHORE: 
//             // check if parameter keys are valid before moving on

//             // set as search parameter
//             searchData = buildSearchQuery(req.query);
//             log.unit(`Search data for mongoose: ` + JSON.stringify(searchData));
//         };

//         let ret = await CallService.find(searchData, '-__v');
//         let valuesFound = Object.keys(ret).length;
//         log.unit(`${req.logPrefix} Values returned: ${valuesFound}`);

//         return res.status(200).json({
//             error: false,
//             valuesFound: valuesFound,
//             data: ret
//         });
//     } catch (error) {
//         return next(error)
//     }
// }

// // GET :id
// async function getCallById(req, res, next) {
//     try {
//         log.info(`${req.logPrefix}`);
//         log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

//         // validando id
//         const { id } = req.params;
//         if (!ObjectId.isValid(id)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid id."
//             })
//         }

//         // pega os dados in-db
//         let retFromDatabase = await CallService.findOne({ _id: id }, "-__v", true);
//         log.unit(`${req.logPrefix} From database: ${JSON.stringify(retFromDatabase)}`);
//         if (!retFromDatabase) {
//             return res.status(404).json({
//                 error: true,
//                 message: 'Not found.'
//             });
//         };

//         return res.status(200).json({
//             error: false,
//             data: retFromDatabase
//         });
//     } catch (error) {
//         return next(error)
//     }
// }

// // PATCH :id
// async function updateCall(req, res, next) {
//     try {
//         log.info(`${req.logPrefix}`);
//         log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

//         // valida se passou dados pra fazer a atualização
//         if (Object.keys(req.body).length === 0) {
//             return res.status(400).json({
//                 error: true,
//                 message: "No data to update."
//             })
//         }

//         // valida se o id é ao menos um ObjectId válido
//         const { id } = req.params;
//         if (!ObjectId.isValid(id)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid id."
//             })
//         }

//         // valida se o campo que tá passando ao menos existe, pra eu não perder processamento atoa
//         let validKeys = Object.keys(schema.zCall.shape);
//         const hasInvalidKeys = Object.keys(req.body).some(key => !validKeys.includes(key));
//         if (hasInvalidKeys) {
//             return res.status(400).json({
//                 error: true,
//                 message: 'Invalid keys in body.',
//                 validKeys: validKeys
//             });
//         }

//         // valida se o manager ou campaign tem ids que realmente existem
//         if (req.body?.campaign && await invalidCampaign(req.body.campaign)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid campaign id."
//             })
//         };
//         if (req.body?.manager && await invalidManager(req.body.manager)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid manager id."
//             })
//         };

//         // pega os dados in-db
//         let retFromDatabase = await CallService.findOne({ _id: id }, "-_id -__v");
//         retFromDatabase = retFromDatabase._doc || retFromDatabase
//         // retFromDatabase.campaign = retFromDatabase.campaign ? String(retFromDatabase.campaign) : null; // ObjectId -> string
//         // retFromDatabase.manager = retFromDatabase.manager ? String(retFromDatabase.manager) : null; // ObjectId -> string
//         log.unit(`${req.logPrefix} From database: ${JSON.stringify(retFromDatabase)}`);
//         if (!retFromDatabase) {
//             return res.status(404).json({
//                 error: true,
//                 message: 'Not found.'
//             });
//         };

//         // corta createdAt e updatedAt
//         // > vou testar sem cortar primeiro, se ficar errado eu att

//         // monta o novo valor
//         log.unit(`Original value: ` + JSON.stringify(retFromDatabase)); // acho que o lean retorna o doc completo
//         log.unit(`Body (incoming patch): ` + JSON.stringify(req.body));
//         let patchedDocument = _.merge({ ...retFromDatabase }, req.body);
//         log.unit(`Merged (patched) : ` + JSON.stringify(patchedDocument))

//         // dá parse pra ver se vai ficar tudo certo
//         log.unit(`Parsing the new values to check if its as expected by our database model. Values: ${JSON.stringify(patchedDocument)}`)
//         console.log(patchedDocument)
//         schema.zCall.parse(patchedDocument);

//         // estando tudo certo, manda pro db a alteração
//         log.unit(`Values are valid, sending to database.`)
//         let updReturn = await CallService.update(id, patchedDocument);

//         // nao faço ideia se isso pode ocorrer. se acontecer fica logado pelomenos
//         if (!updReturn) { log.critical(`VALUES NOT UPDATED IN DATABASE`) }

//         return res.status(200).json({
//             error: false,
//             message: 'Successfully updated'
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// // DELETE :id
// async function deleteCall(req, res, next) {
//     try {
//         log.info(`${req.logPrefix}`)
//         log.trace(`${req.logPrefix} ${JSON.stringify(req.body)}`);

//         // valida se o id é ao menos um ObjectId válido
//         const { id } = req.params;
//         if (!ObjectId.isValid(id)) {
//             return res.status(404).json({
//                 error: true,
//                 message: "Invalid id."
//             })
//         }

//         let ret = await CallService.remove(id);
//         log.unit(`${req.logPrefix} Return from database: ${JSON.stringify(ret)}`)
//         if (ret.error) {
//             return res.status(400).json({
//                 error: true,
//                 message: ret.message
//             });
//         }

//         return res.status(200).json({
//             error: false,
//             message: 'Successfully deleted.'
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// module.exports = {
//     createCall,
//     getCalls,
//     getCallById,
//     updateCall,
//     deleteCall
// }
