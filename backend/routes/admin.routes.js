const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');

// 1. Controlador existente para Cajeros
const CashierController = require('../controllers/cashier.controller');

// 2. NUEVO: Controlador para Horarios (el que creamos en el paso anterior)
const AdminController = require('../controllers/admin.controller');

// Definimos el "Guardia" para no repetir código: Solo Administrador
const adminGuard = [authMiddleware, checkRole(['Administrador'])];


// --- RUTAS DE GESTIÓN DE CAJEROS (LO QUE YA TENÍAS) ---
router.get('/cashiers', adminGuard, CashierController.listCashiers);
router.post('/cashiers', adminGuard, CashierController.createCashier);
router.get('/cashiers/:id', adminGuard, CashierController.getCashier);
router.put('/cashiers/:id', adminGuard, CashierController.updateCashier);
router.delete('/cashiers/:id', adminGuard, CashierController.deactivateCashier);


// --- GESTIÓN DE HORARIOS ---
router.get('/init-data', adminGuard, AdminController.getData);
router.post('/base-schedule', adminGuard, AdminController.createBaseSchedule); // <-- NUEVA
router.get('/employee/:ci/schedule', adminGuard, AdminController.getEmployeeSchedule);
router.post('/schedule', adminGuard, AdminController.assignSchedule);
router.put('/schedule/:id', adminGuard, AdminController.updateSchedule); // <-- NUEVA
router.delete('/schedule/:id', adminGuard, AdminController.deleteSchedule);


module.exports = router;