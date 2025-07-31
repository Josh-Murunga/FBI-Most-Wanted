const mysql = require('mysql2/promise');
const redis = require('redis');

// Create reusable connections
let mysqlPool;
let redisClient;

const createDBConnection = async () => {
    try {
        // MySQL Connection Pool
        mysqlPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test MySQL connection
        const connection = await mysqlPool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();

        // Redis Client
        redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            }
        });

        // Connect to Redis
        await redisClient.connect();
        console.log('Connected to Redis');

        // Test Redis connection
        await redisClient.set('server-status', 'running');
        const status = await redisClient.get('server-status');
        console.log(`Redis test: server-status = ${status}`);

        return { mysqlPool, redisClient };
    } catch (err) {
        console.error('Database connection error:', err);
        throw err; // Rethrow to be caught in index.js
    }
};

// Export the connection promise
module.exports = createDBConnection();