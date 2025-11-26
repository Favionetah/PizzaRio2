const db = require('../config/db');

const Invoice = {};

// Generar número de factura único
Invoice.generateInvoiceNumber = async () => {
    try {
        const year = new Date().getFullYear();
        const prefix = `FACT-${year}-`;

        // Obtener el último número de factura del año
        const [rows] = await db.query(
            `SELECT numeroFactura FROM tfacturas 
             WHERE numeroFactura LIKE ? 
             ORDER BY idFactura DESC LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNumber = 1;
        if (rows.length > 0) {
            const lastNumber = rows[0].numeroFactura.split('-')[2];
            nextNumber = parseInt(lastNumber) + 1;
        }

        // Formato: FACT-2025-00001
        return `${prefix}${String(nextNumber).padStart(5, '0')}`;
    } catch (error) {
        throw error;
    }
};

// Crear factura
Invoice.create = async (invoiceData) => {
    try {
        const { idPedido, nit, razonSocial, totalFactura } = invoiceData;

        // Generar número de factura único
        const numeroFactura = await Invoice.generateInvoiceNumber();

        const [result] = await db.query(
            `INSERT INTO tfacturas 
            (idPedido, numeroFactura, nit, razonSocial, totalFactura, fechaEmision, descuento, estadoA)
            VALUES (?, ?, ?, ?, ?, NOW(), 0.00, 1)`,
            [idPedido, numeroFactura, nit, razonSocial, totalFactura]
        );

        return {
            idFactura: result.insertId,
            numeroFactura
        };
    } catch (error) {
        console.error("Error al crear factura:", error);
        throw error;
    }
};

// Obtener factura por ID de pedido
Invoice.getByOrderId = async (idPedido) => {
    try {
        const [rows] = await db.query(
            `SELECT f.*, p.totalPedido, p.metodoPago, p.fechaPedido,
                    c.nombre1, c.apellido1, c.CICliente,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'nombre', COALESCE(pz.nombrePizza, prod.nombreProducto),
                                'cantidad', dp.cantidad,
                                'precioUnitario', dp.precioUnitario,
                                'subtotal', dp.subtotal
                            )
                        )
                        FROM tdetallepedidos dp
                        LEFT JOIN tpizza pz ON dp.idPizza = pz.idPizza
                        LEFT JOIN tproductos prod ON dp.idProducto = prod.idProducto
                        WHERE dp.idPedido = p.idPedido
                    ) AS items
             FROM tfacturas f
             JOIN tpedidos p ON f.idPedido = p.idPedido
             LEFT JOIN tclientes c ON p.CICliente = c.CICliente
             WHERE f.idPedido = ?`,
            [idPedido]
        );

        if (rows.length > 0) {
            // ✅ Quitar JSON.parse, items ya es array
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error("Error al obtener factura:", error);
        throw error;
    }
};

module.exports = Invoice;
