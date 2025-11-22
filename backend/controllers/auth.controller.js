// Archivo: backend/controllers/auth.controller.js (VERSION FINAL Y COMPLETA)

const User = require('../models/user.model');
const Client = require('../models/client.model'); 
const RolModel = require('../models/rol.model'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const AuthController = {};

// ----------------------------------------------------------------------
// 1. MÉTODO: AuthController.login (Corregido para compatibilidad)
// ----------------------------------------------------------------------
AuthController.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' });
        }

        const user = await User.findByEmail(email); 

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas (Usuario no encontrado)' });
        }
        
        let isPasswordCorrect = false;
        
        // Lógica de compatibilidad: 
        // Primero, compara en texto plano (para usuarios antiguos sin hash).
        if (password === user.password) {
            isPasswordCorrect = true;
        } else {
            // Segundo, intenta con bcrypt (para usuarios nuevos registrados).
            try {
                if (bcrypt.compareSync(password, user.password)) {
                    isPasswordCorrect = true;
                }
            } catch (e) {
                // Se ignora si no es un hash de bcrypt.
            }
        }
        
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciales incorrectas (Contraseña inválida)' });
        }

        const token = jwt.sign(
            { 
                id: user.idUsuario, 
                role: user.nombreRol 
            }, 
            'PARALELEPIPEDO_FELIPE_NEDURO_SECRETO_JWT',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login exitoso',
            token: token, 
            role: user.nombreRol 
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


// ----------------------------------------------------------------------
// 2. MÉTODO: AuthController.register (Asegurando que exista)
// ----------------------------------------------------------------------
AuthController.register = async (req, res) => {
    // Campos que llegan del frontend (ci, email, password, name, phone)
    const { ci, email, password, name, phone } = req.body; 
    const roleName = 'Cliente'; 
    const usuarioA = 'CLIENTE_WEB'; 

    if (!ci || !email || !password || !name || !phone) {
        return res.status(400).json({ message: 'Todos los campos son requeridos para el registro.' });
    }

    try {
        // 1. Validaciones: CI y Email únicos
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }
        const existingCIUser = await User.getById(ci); 
        if (existingCIUser) {
            return res.status(409).json({ message: 'La Cédula de Identidad (CI) ya está en uso.' });
        }

        // 2. Obtener ID del Rol 'Cliente'
        const clientRole = await RolModel.findByName(roleName); 
        if (!clientRole) {
            return res.status(500).json({ message: 'Configuración de rol de Cliente no encontrada.' });
        }
        const idRol = clientRole.idRol;

        // 3. Hashear Contraseña (Usando bcrypt para seguridad en nuevos registros)
        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt);
        
        // 4. División de Nombre (simple: Nombre Apellido)
        const nameParts = name.trim().split(' ');
        const nombre1 = nameParts[0] || name;
        const apellido1 = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // 5. Inserción A: TUsuarios (Credenciales)
        await User.createUser({
            idUsuario: ci,      // CI es la PK/identificador de usuario
            idRol: idRol,
            password: password_hash,
            email: email,
            usuarioA: usuarioA
        });

        // 6. Inserción B: TClientes (Datos Personales)
        await Client.create({
            ci: ci,             // CI es la PK en TClientes
            nombre1: nombre1,
            apellido1: apellido1,
            telefono: phone,
            email: email,
            usuarioA: usuarioA
        });

        res.status(201).json({ message: 'Registro de cliente exitoso.' });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear cuenta.' });
    }
};

// ----------------------------------------------------------------------
// 3. EXPORTACIÓN: Exportamos el objeto completo
// ----------------------------------------------------------------------
module.exports = AuthController;