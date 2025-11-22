const db = require('../config/db');

const Product = {};

Product.getAll = async () => {
    try {
        const [pizzas] = await db.query ( //Listado de Pizzas
            `
            SELECT 
                idPizza AS id, 
                nombrePizza AS nombre,
                precio,
                imagen,
                descripcion,
                'Pizzas' AS categoria
            FROM TPizza
            WHERE estadoA = 1
            `
        );

        const [otros] = await db.query ( //Listado de Productos
            `
            SELECT 
                idProducto AS id,
                nombreProducto AS nombre,
                precio,
                descripcion,
                tipoProducto AS categoria
            FROM TProductos
            WHERE estadoA = 1
            `
        );

        return [...pizzas, ...otros];
    } catch (error) {
        throw error;   
    }
};

module.exports = Product;