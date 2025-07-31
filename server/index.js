require('dotenv').config();
const app = require('./app');
const db = require('./config/db'); // This is now a promise
const PORT = process.env.PORT || 5000;

// Start server after DB connection
db
  .then(({ mysqlPool, redisClient }) => {
    // Make DB connections available globally
    app.locals.mysqlPool = mysqlPool;
    app.locals.redisClient = redisClient;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');

      try {
        server.close();
        if (mysqlPool) await mysqlPool.end();
        if (redisClient) await redisClient.quit();
        console.log('Server shut down gracefully');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch(err => {
    console.error('Fatal error during startup:', err);
    process.exit(1);
  });