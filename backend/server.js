const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors()); //conecta con el Frontend
app.use(express.json()); //para que entienda json que envia el Frontend (ej: el Login)

const authRoutes = require('./routes/auth.routes');
const posRoutes = require('./routes/pos.routes.js');
const clientRoutes = require('./routes/client.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const mapRoutes = require('./routes/map.routes');
//const productRoutes = require('./routes/product.routes.js');


app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', mapRoutes);
//app.use('/api/products', productRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//ruta de prueba para verificar si funciona xd
app.get('/', (req, res) => {
    res.send('El API de PIZZA RIO Funcionaaaaaaa');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


