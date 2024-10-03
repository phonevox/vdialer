#!/usr/bin/node
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserService } = require(path.resolve("src/db"));
const { Logger } = require(path.resolve("src/utils/logger"));
const log = new Logger("authController", false).useEnvConfig().create();

const DEFAULT_ACCESS_TOKEN_SECRET = 'your_access_token_secret'; // PLEASE change this or set env
const DEFAULT_ACCESS_TOKEN_EXPIRY = '15m';
const DEFAULT_REFRESH_TOKEN_SECRET = 'your_refresh_token_secret'; // PLEASE change this or set env
const DEFAULT_REFRESH_TOKEN_EXPIRY = '7d';

// Função para criar o accessToken
function createAccessToken(userId) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || DEFAULT_ACCESS_TOKEN_SECRET;
    const accessTokenExpiry = DEFAULT_ACCESS_TOKEN_EXPIRY;

    if (accessTokenSecret === DEFAULT_ACCESS_TOKEN_SECRET & process.env.NODE_ENV != 'dev') {
        log.warn(`You are using the default access token secret! You should change it for non-dev environments.`);
    }

    return jwt.sign(
        { userId },
        accessTokenSecret,
        { expiresIn: accessTokenExpiry }
    );
}

// Função para criar o refreshToken
function createRefreshToken(userId) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || DEFAULT_REFRESH_TOKEN_SECRET;
    const refreshTokenExpiry = DEFAULT_REFRESH_TOKEN_EXPIRY;

    if (refreshTokenSecret === DEFAULT_REFRESH_TOKEN_SECRET & process.env.NODE_ENV != 'dev') {
        log.warn(`You are using the default refresh token secret! You should change it for non-dev environments.`);
    }

    return jwt.sign(
        { userId },
        refreshTokenSecret,
        { expiresIn: refreshTokenExpiry }
    );
}

// Função principal que usa as duas funções internas
function createToken(userId) {
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    return { accessToken, refreshToken };
}

async function login(req, res, next) {

    // password é obrigatório. o user pode vir como username ou email
    let { username, password } = req.body
    username = username.toLowerCase()

    // caso contenha @ no username, consideramos que seja um email
    const searchCriteria = username.includes('@') ? { email: username } : { username: username };

    // validating user exists
    const dbRes = await UserService.findOne(searchCriteria)
    const userEncryptedPassword = dbRes?.password
    const userId = String(dbRes?._id)
    if (!dbRes || !userId) {
        log.info(`${req.logPrefix} Failed authentication for user "${username}": user not found`);
        return res.status(401).json({
            error: true,
            message: `Authentication failed.`
        })
    }

    // validating sent password with user's password
    if (!bcrypt.compareSync(password, userEncryptedPassword)) {
        log.info(`${req.logPrefix} Failed authentication for user "${username}": wrong password`)
        return res.status(401).json({
            error: true,
            message: `Authentication failed.`
        }) // dont be verbose about error, could be used to scan for existing users on our database. verbose it in log
    }

    // authenticating
    const { accessToken, refreshToken } = createToken(userId);
    log.info(`${req.logPrefix} Successful authentication for user "${username}"`)

    // TODO(adrian): aceitar apenas o access-token que foi "o mais recentemente criado"
    // É interessante notar que um token criado continuará sendo válido até a expiração
    // poderiamos guardá-lo no banco de dados após sua autenticação/atualização mais recente
    // e apenas permitir este último token "atualizado"
    // porém não vejo valia nisso no momento. cuide do seu token.

    return res.status(200).json({
        error: false,
        message: "Authentication successful.",
        data: {
            access_token: accessToken,
            refresh_token: refreshToken
        }
    });
}

async function refresh(req, res, next) {
    const { token } = req.body;

    if (!token) {
        log.warn(`${req.logPrefix} Refresh token not provided`);
        return res.status(401).json({
            error: true,
            message: 'Refresh token is required.'
        });
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || DEFAULT_REFRESH_TOKEN_SECRET;

    // Verifica o refreshToken
    jwt.verify(token, refreshTokenSecret, async (err, decoded) => {
        if (err) {
            log.warn(`${req.logPrefix} Invalid refresh token`);
            return res.status(403).json({
                error: true,
                message: 'Invalid refresh token.'
            });
        }

        const userId = decoded.userId;

        // Busca o usuário no banco de dados
        const dbRes = await UserService.findOne({ _id: userId });
        if (!dbRes || !String(dbRes._id)) {
            log.warn(`${req.logPrefix} Refresh token used for non-existent user ID: ${userId}`);
            return res.status(403).json({
                error: true,
                message: 'User not found.'
            });
        }

        // Gerar um novo access token
        const newAccessToken = createAccessToken(userId);
        log.info(`${req.logPrefix} Successfully generated new access token for user "${dbRes.username}"`);

        return res.status(200).json({
            error: false,
            message: 'Refresh successful.',
            data: {
                access_token: newAccessToken
            }
        });
    });
}

module.exports = {
    login,
    refresh
}
