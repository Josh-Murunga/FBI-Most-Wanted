const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
    try {
        // Get database connections from app locals
        const { mysqlPool, redisClient } = req.app.locals;

        // Ensure database connections are available
        if (!mysqlPool || !redisClient) {
            console.error('Database connections not available in middleware');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token revoked. Please log in again' });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Fetch user from database
        const [users] = await mysqlPool.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request object
        req.user = users[0];
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = authenticate;