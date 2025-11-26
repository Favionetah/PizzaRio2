const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoice.controller');

// ⚠️ IMPORTANTE:
// Quitamos el middleware porque NO existe y causaba errores.
// Si luego quieres proteger estas rutas, lo hacemos bien más tarde.

// Generar y descargar PDF de factura
router.get('/:idPedido/pdf', InvoiceController.generatePDF);

// Obtener datos de factura (JSON)
router.get('/:idPedido', InvoiceController.getInvoiceData);

module.exports = router;
