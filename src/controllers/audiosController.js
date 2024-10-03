#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("audiosController", false).useEnvConfig().create();

async function servePublicAudios(req, res, next) {
    const audioFilePath = path.resolve("public/audios", req.params.filename);

    res.sendFile(audioFilePath, (err) => {
        if (err) {
            log.error(`${req.logPrefix} Error serving file "${req.params.filename}": probably doesn't exist.`, err);
            log.trace(`${req.logPrefix} Audio file path: ${audioFilePath}`);
            res.status(404).send({
                error: true,
                message: "Audio not found."
            });
        } else {
            log.info(`${req.logPrefix} Serving audio file "${req.params.filename}".`);
            log.trace(`${req.logPrefix} Audio file path: ${audioFilePath}`);
        }
    });

}

module.exports = {
    servePublicAudios
}
