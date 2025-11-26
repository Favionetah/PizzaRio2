const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// === RUTAS ===
const authRoutes = require('./routes/auth.routes');
const posRoutes = require('./routes/pos.routes.js');
const clientRoutes = require('./routes/client.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const mapRoutes = require('./routes/map.routes');
const productRoutes = require('./routes/product.routes.js');
const invoiceRoutes = require('./routes/invoice.routes.js');

app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);

// === ARCHIVOS ESTÁTICOS ===
// Carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Carpeta facturas
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// === RUTA DE PRUEBA ===
app.get('/', (req, res) => {
    res.send('El API de PIZZA RIO Funcionaaaaaaa 🎉');
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Puedes acceder a las facturas en: http://localhost:${PORT}/invoices/`);
});
