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
// 2. MÉTODO: AuthController.register (Con Validaciones Completas)
// ----------------------------------------------------------------------
AuthController.register = async (req, res) => {
    // Campos que llegan del frontend
    const { ci, nombre1, nombre2, apellido1, apellido2, telefono, direccion, email, password } = req.body;
    const roleName = 'Cliente';
    const usuarioA = 'CLIENTE_WEB';

    // --- 1. VALIDACIONES BACKEND ---

    // 1.1 Campos obligatorios
    if (!ci || !email || !password || !nombre1 || !apellido1 || !telefono || !direccion) {
        return res.status(400).json({ message: 'Por favor complete todos los campos obligatorios.' });
    }

    // 1.2 Validar Longitudes (Constraints de BD)
    if (ci.length > 20) return res.status(400).json({ message: 'El CI no puede exceder 20 caracteres.' });
    if (nombre1.length > 50) return res.status(400).json({ message: 'El nombre no puede exceder 50 caracteres.' });
    if (nombre2 && nombre2.length > 50) return res.status(400).json({ message: 'El segundo nombre no puede exceder 50 caracteres.' });
    if (apellido1.length > 50) return res.status(400).json({ message: 'El apellido no puede exceder 50 caracteres.' });
    if (apellido2 && apellido2.length > 50) return res.status(400).json({ message: 'El segundo apellido no puede exceder 50 caracteres.' });
    if (telefono.length > 20) return res.status(400).json({ message: 'El teléfono no puede exceder 20 caracteres.' });
    if (email.length > 100) return res.status(400).json({ message: 'El email no puede exceder 100 caracteres.' });
    if (direccion.length > 255) return res.status(400).json({ message: 'La dirección no puede exceder 255 caracteres.' });

    // 1.3 Validar Formato Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
    }

    // 1.4 Validar Contraseña (Min 6 caracteres)
    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // 2. Validaciones de Unicidad: CI y Email
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }
        const existingCIUser = await User.getById(ci);
        if (existingCIUser) {
            return res.status(409).json({ message: 'La Cédula de Identidad (CI) ya está en uso.' });
        }

        // 3. Obtener ID del Rol 'Cliente'
        const clientRole = await RolModel.findByName(roleName);
        if (!clientRole) {
            return res.status(500).json({ message: 'Configuración de rol de Cliente no encontrada.' });
        }
        const idRol = clientRole.idRol;

        // 4. Hashear Contraseña
        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt);

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
            ci: ci,
            nombre1: nombre1,
            nombre2: nombre2 || null,
            apellido1: apellido1,
            apellido2: apellido2 || null,
            telefono: telefono,
            email: email,
            direccion: direccion,
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