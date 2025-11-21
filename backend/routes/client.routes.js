const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const OrderController = require('../controllers/order.controller'); // <-- Importar nuevo
const { authMiddleware } = require('../middleware/auth'); // <-- Importar seguridad

// GET Productos (Público)
router.get('/products', ProductController.getAllProducts);

// POST Pedidos (Privado - Requiere Login)
router.post('/orders', authMiddleware, OrderController.createOrder);

router.get('/orders/my-history', authMiddleware, OrderController.getMyHistory);

module.exports = router;