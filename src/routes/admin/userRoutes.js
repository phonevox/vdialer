#!/usr/bin/node
const path = require("path");
const express = require('express');
const { securePasswords } = require(path.resolve('src/middlewares'));
const router = express.Router();

// controllers
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require(path.resolve("src/controllers/userController"))

// Definindo a rota para servir arquivos de áudio por nome de arquivo
router.use(securePasswords) // req.body.password --> bcryptPassword(req.body.password, SALT_ROUNDS);
router.post('/user', createUser);         // Cria
router.get('/user', getUsers);            // Lista tudo, ou filtra (via query)
router.get('/user/:id', getUserById);     // Lista um específico por id
router.patch('/user/:id', updateUser);    // Corrige
router.delete('/user/:id', deleteUser);   // Deleta

module.exports = router;
