// Archivo: backend/routes/auth.routes.js (VERSIÓN FINAL)

const express = require('express');
const router = express.Router();

// Importamos el controlador que ahora contiene los métodos login y register
const AuthController = require('../controllers/auth.controller');

// 1. Ruta para el INICIO DE SESIÓN
router.post('/login', AuthController.login);

// 2. Ruta para el REGISTRO de un nuevo cliente (¡RUTA AÑADIDA!)
router.post('/register', AuthController.register);

// Exportamos el enrutador
module.exports = router;