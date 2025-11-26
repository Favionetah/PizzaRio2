const Order = require('../models/order.model');


const OrderController = {};

OrderController.createOrder = async (req, res) => {
    try {
        const { total, carrito, nombreClienteManual, metodoPago } = req.body;

        console.log("Datos recibidos:", req.body);

        // 1. DETERMINAR QUIÉN ES EL CLIENTE EN LA BASE DE DATOS
        let ciClienteFinal;
        let ciEmpleadoFinal;

        // Si el usuario logueado es ADMIN o CAJERO (Venta POS)
        if (req.user.role === 'Administrador' || req.user.role === 'Cajero') {
            // En POS, el cliente en BD es el "GENERICO"
            ciClienteFinal = nombreClienteManual;

            // Y el empleado responsable es el usuario logueado (si coincide con CIEmpleado)
            // O usamos un default si tu sistema de IDs de usuario es diferente al de empleados
            // Por ahora, mantenemos tu hardcode '1234567' o usamos req.user.id si aplica.
            // Vamos a dejarlo genérico en el modelo por seguridad, 
            // pero aquí definimos que es una venta asistida.
        }
        // Si el usuario logueado es CLIENTE (Venta Web)
        else {
            ciClienteFinal = req.user.id; // El ID del usuario ES el CI del cliente
        }

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío" });
        }

        // 2. Llamamos al modelo con el CI correcto
        const idPedido = await Order.create({
            ciCliente: ciClienteFinal,
            total,
            items: carrito,
            metodoPago: metodoPago || null, // Agregamos el método de pago
            // Opcional: Pasamos el nombre real que escribió el cajero para guardarlo en descripción o logs
            nombreReferencia: nombreClienteManual
        });

        res.status(201).json({
            message: "¡Pedido recibido con éxito!",
            idPedido: idPedido
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar el pedido" });
    }
};
////////////////////////////////////////////////////////////////////////
OrderController.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.getAllPending();
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener pedidos pendientes" });
    }
};

OrderController.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Viene de la URL
        const { estado } = req.body; // Viene del JSON (ej: { "estado": "Entregado" })

        await Order.updateStatus(id, estado);

        res.status(200).json({ message: `Pedido #${id} actualizado a ${estado}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el estado" });
    }
};

// --- FUNCIONES PARA EL CLIENTE ---

OrderController.getMyHistory = async (req, res) => {
    try {
        // El ID del cliente viene del Token (middleware)
        const ciCliente = req.user.id;

        const orders = await Order.getByClient(ciCliente);
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial" });
    }
};

// --- FUNCIONES PARA EL ADMIN ---
OrderController.getAllHistory = async (req, res) => {
    try {
        const orders = await Order.getAllHistory();
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial global" });
    }
};

// --- FUNCIONES PARA HISTORIAL CON FILTROS (POS/ADMIN) ---
OrderController.getAllOrders = async (req, res) => {
    try {
        const filters = {
            fecha: req.query.fecha,
            cliente: req.query.cliente,
            pizza: req.query.pizza
        };

        const orders = await Order.getAllOrders(filters);
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial de pedidos" });
    }
};

module.exports = OrderController;