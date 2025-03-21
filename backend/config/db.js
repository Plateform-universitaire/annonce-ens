// backend/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Rahimou22m...',
    database: 'uni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});





module.exports = pool;
