const db = require('../config/db');

const Order = {}

Order.create = async (orderData) => {
    const { ciCliente, total, items, metodoPago } = orderData;

    try {
        // INSERTAR LA CABECERA
        // Nota: Aquí estamos usando '1234567' fijo para el empleado para evitar errores
        // si el idUsuario del cajero no coincide con la tabla TEmpleados.
        // Si quieres ser estricto, deberías buscar el CIEmpleado basado en el usuario logueado.
        const [result] = await db.query(`
            INSERT INTO TPedidos 
            (CICliente, idSucursal, CIEmpleado, tipoPedido, estadoPedido, totalPedido, metodoPago, fechaPedido)
            VALUES (?, 'SC-01', '1234567', 'Para llevar', 'Pendiente', ?, ?, NOW())
        `,
            [ciCliente, total, metodoPago]);

        const idPedidoGenerado = result.insertId;
        for (const item of items) {
            let idPizza = null;
            let idProducto = null;

            if (item.categoria === 'Pizzas') {
                idPizza = item.id;
            } else {
                idProducto = item.id;
            }

            await db.query(
                `
                INSERT  INTO TDetallePedidos
                (idPedido, idPizza, idProducto, cantidad, precioUnitario, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [
                idPedidoGenerado,
                idPizza,
                idProducto,
                item.cantidad,
                item.precio,
                (item.precio * item.cantidad)
            ]);
        }

        return idPedidoGenerado;
    } catch (error) {
        console.error("Error al crear pedido: ", error);
        throw error;
    }
};

Order.getAllPending = async () => {
    try {
        const sql = `
            SELECT 
                p.idPedido, 
                p.fechaPedido, 
                p.totalPedido, 
                p.tipoPedido, 
                p.estadoPedido,
                CONCAT(c.nombre1, ' ', c.apellido1) AS nombreCliente,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'nombre', COALESCE(pz.nombrePizza, prod.nombreProducto),
                            'cantidad', dp.cantidad,
                            'precio', dp.precioUnitario
                        )
                    )
                    FROM TDetallePedidos dp
                    LEFT JOIN TPizza pz ON dp.idPizza = pz.idPizza
                    LEFT JOIN TProductos prod ON dp.idProducto = prod.idProducto
                    WHERE dp.idPedido = p.idPedido
                ) AS items
            FROM TPedidos p
            JOIN TClientes c ON p.CICliente = c.CICliente
            WHERE p.estadoPedido NOT IN ('Entregado', 'Cancelado')
            ORDER BY p.fechaPedido ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw error;
    }
};

// 2. PARA EL CAJERO: Cambiar estado (ej: de 'Pendiente' a 'En preparación')
Order.updateStatus = async (idPedido, nuevoEstado) => {
    try {
        const sql = `UPDATE TPedidos SET estadoPedido = ? WHERE idPedido = ?`;
        const [result] = await db.query(sql, [nuevoEstado, idPedido]);
        return result;
    } catch (error) {
        throw error;
    }
};

// 3. PARA EL CLIENTE: Ver su propio historial
Order.getByClient = async (ciCliente) => {
    try {
        const sql = `
            SELECT 
                p.idPedido, 
                p.fechaPedido, 
                p.totalPedido, 
                p.estadoPedido, 
                p.tipoPedido,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'nombre', COALESCE(pz.nombrePizza, prod.nombreProducto),
                            'cantidad', dp.cantidad,
                            'precio', dp.precioUnitario
                        )
                    )
                    FROM TDetallePedidos dp
                    LEFT JOIN TPizza pz ON dp.idPizza = pz.idPizza
                    LEFT JOIN TProductos prod ON dp.idProducto = prod.idProducto
                    WHERE dp.idPedido = p.idPedido
                ) AS items
            FROM TPedidos p
            WHERE p.CICliente = ?
            ORDER BY p.fechaPedido DESC
        `;
        const [rows] = await db.query(sql, [ciCliente]);
        return rows;
    } catch (error) {
        throw error;
    }
};


// 4. PARA EL ADMIN: Ver historial global
Order.getAllHistory = async () => {
    try {
        const sql = `
            SELECT 
                p.idPedido, 
                p.fechaPedido, 
                p.totalPedido, 
                p.estadoPedido, 
                p.tipoPedido,
                CONCAT(c.nombre1, ' ', c.apellido1) AS nombreCliente
            FROM TPedidos p
            JOIN TClientes c ON p.CICliente = c.CICliente
            ORDER BY p.fechaPedido DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw error;
    }
};

// 5. NUEVO: Obtener todos los pedidos con filtros (Para Historial POS/Admin)
Order.getAllOrders = async (filters) => {
    try {
        const { fecha, cliente, pizza } = filters;

        let sql = `
            SELECT DISTINCT
                p.idPedido, 
                p.fechaPedido, 
                p.totalPedido, 
                p.estadoPedido, 
                p.tipoPedido,
                CONCAT(c.nombre1, ' ', c.apellido1) AS nombreCliente,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'nombre', COALESCE(pz.nombrePizza, prod.nombreProducto),
                            'cantidad', dp.cantidad,
                            'precio', dp.precioUnitario
                        )
                    )
                    FROM TDetallePedidos dp
                    LEFT JOIN TPizza pz ON dp.idPizza = pz.idPizza
                    LEFT JOIN TProductos prod ON dp.idProducto = prod.idProducto
                    WHERE dp.idPedido = p.idPedido
                ) AS items
            FROM TPedidos p
            JOIN TClientes c ON p.CICliente = c.CICliente
            LEFT JOIN TDetallePedidos dp ON p.idPedido = dp.idPedido
            LEFT JOIN TPizza pz ON dp.idPizza = pz.idPizza
            WHERE 1=1
        `;

        const params = [];

        if (fecha) {
            sql += ` AND DATE(p.fechaPedido) = ?`;
            params.push(fecha);
        }

        if (cliente) {
            sql += ` AND (c.nombre1 LIKE ? OR c.apellido1 LIKE ?)`;
            params.push(`%${cliente}%`, `%${cliente}%`);
        }

        if (pizza) {
            sql += ` AND pz.nombrePizza LIKE ?`;
            params.push(`%${pizza}%`);
        }

        sql += ` GROUP BY p.idPedido ORDER BY p.fechaPedido DESC`;

        const [rows] = await db.query(sql, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = Order;