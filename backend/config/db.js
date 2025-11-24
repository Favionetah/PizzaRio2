//aqui va la conexion a la base de datos

const mysql = require('mysql2');


//"pool" es un conjunto de conexiones a la base de datos que se pueden reutilizar
//es similar a CreateConnection pero mas eficiente
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
<<<<<<< HEAD
    password: 'root',
=======
    password: 'MTG13',
>>>>>>> 66e8887750b5157c2a1b5380a0abf79ba8539c26
    database: 'pizzeria_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

module.exports = pool.promise(); //exportamos la conexion para usarla en otros archivos