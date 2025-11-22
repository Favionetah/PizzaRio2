// Archivo: backend/models/rol.model.js (Paso 2.B)

const db = require('../config/db');

const RolModel = {};

/**
 * Busca un rol en la DB por su nombre (ej: 'Cliente').
 * @param {string} roleName - Nombre del rol a buscar.
 * @returns {object|undefined} Objeto Rol o undefined.
 */
RolModel.findByName = async (roleName) => {
    try {
        const query = `
            SELECT idRol, nombreRol
            FROM troles
            WHERE nombreRol = ? AND estadoA = 1
        `;
        const [rows] = await db.query(query, [roleName]);
        // Devuelve el primer resultado (el rol)
        return rows[0]; 
    } catch (error) {
        console.error("Error al buscar rol por nombre:", error);
        throw error;
    }
};

module.exports = RolModel;