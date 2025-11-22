// Archivo: backend/models/client.model.js

const db = require('../config/db'); // Asumo que tienes la conexión importada

const Client = {};

// Asume que la función recibe los datos del cliente, incluyendo el CI
Client.create = async ({ ci, nombre1, nombre2 = null, apellido1, apellido2 = null, telefono, email, usuarioA }) => {
    try {
        const query = `
            INSERT INTO tclientes 
                (CICliente, nombre1, nombre2, apellido1, apellido2, telefono, email, usuarioA)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            ci, 
            nombre1, 
            nombre2, 
            apellido1, 
            apellido2, 
            telefono, 
            email, 
            usuarioA
        ]);
        return result;
    } catch (error) {
        console.error("Error al crear cliente:", error);
        throw error;
    }
};

module.exports = Client;