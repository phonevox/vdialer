#!/usr/bin/node
const path = require("path");
const express = require('express');
const { securePasswords } = require(path.resolve('src/middlewares'));
const router = express.Router();

// controllers
const { UserController: Controller } = require(path.resolve("src/controllers/userController"))

// Definindo a rota para servir arquivos de áudio por nome de arquivo
router.use(securePasswords) // req.body.password --> bcryptPassword(req.body.password, SALT_ROUNDS);
router.post('/user', Controller.create);         // Cria
router.get('/user', Controller.get);            // Lista tudo, ou filtra (via query)
router.get('/user/:id', Controller.getById);     // Lista um específico por id
router.patch('/user/:id', Controller.update);    // Corrige
router.delete('/user/:id', Controller.delete);   // Deleta

module.exports = router;
