const db = require('../config/db');

const Order = {}

Order.create = async (orderData) => {
    const { ciCliente, total, items } = orderData;
    try {
        const [result] = await db.query(
            `
            INSERT INTO TPedidos
            (CICliente, idSucursal, CIEmpleado, tipoPedido, estadoPedido, totalPedido, fechaPedido)
            VALUES (?, 'SC-01', '1234567', 'Para llevar', 'Pendiente', ?, NOW())
            `
        , [ciCliente, total]);
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
        // Hacemos JOIN con TClientes para saber quién pidió
        // Filtramos solo los que NO están entregados ni cancelados
        const sql = `
            SELECT 
                p.idPedido, 
                p.fechaPedido, 
                p.totalPedido, 
                p.tipoPedido, 
                p.estadoPedido,
                CONCAT(c.nombre1, ' ', c.apellido1) AS nombreCliente
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
            SELECT idPedido, fechaPedido, totalPedido, estadoPedido, tipoPedido
            FROM TPedidos
            WHERE CICliente = ?
            ORDER BY fechaPedido DESC
        `;
        const [rows] = await db.query(sql, [ciCliente]);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = Order;