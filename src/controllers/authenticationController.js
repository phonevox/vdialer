#!/usr/bin/node
const path = require("path");
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("authenticationController", false).useEnvConfig().create();

// below, its our implementation of the /auth/login part of access-token and refresh-token
async function login(req, res, next) {
    try {
        log.info(`${req.logPrefix} ${JSON.stringify(req.body)}`);
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: true, message: "Invalid username or password." });
        }
        const user = await UserService.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ error: true, message: "Invalid username or password." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch
            || user.password !== password) {
            return res.status(401).json({ error: true, message: "Invalid username or password." });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ error: false, token, refreshToken });
    } catch (error) {
        return next(error)
    }
}



module.exports = {
    servePublicAudios
}
