//aqui va la conexion a la base de datos

const mysql = require('mysql2');


//"pool" es un conjunto de conexiones a la base de datos que se pueden reutilizar
//es similar a CreateConnection pero mas eficiente
const pool = mysql.createPool({
    host: 'localhost',
    database: 'pizzeriario_db',
    user: 'root',
    //password: '123456',
    //database: 'pizzeriario_db',
    password: '123456',
    //password: 'MTG13',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

module.exports = pool.promise(); //exportamos la conexion para usarla en otros archivos