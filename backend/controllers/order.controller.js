const Order = require('../models/order.model');


const OrderController = {};

OrderController.createOrder = async (req, res) => {
    try {
        const { total, carrito } = req.body;

        const ciCliente = req.user.id;

        if (!carrito || carrito.length === 0) {
            return res.result(400).json({message: "El carrito está vacio"});
        }

        const idPedido = await Order.create({
            ciCliente,
            total,
            items: carrito

        });

        res.status(201).json({
            message: "Pedido Exitoso",
            idPedido: idPedido
        });

    } catch (error) {
        console.error("Error en la creacion de pedido:", error);
        res.status(500).json({ message: "Error al Procesar Pedido" });
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

module.exports = OrderController;