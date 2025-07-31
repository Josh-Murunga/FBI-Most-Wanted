const bcrypt = require('bcryptjs');
const { generateToken, decodeToken } = require('../utils/jwt');

// User Registration Controller
const register = async (req, res) => {
    try {
        const { mysqlPool } = req.app.locals;
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const [existing] = await mysqlPool.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const [result] = await mysqlPool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Get the created user (without password)
        const [users] = await mysqlPool.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = users[0];

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            error: 'Server error during registration',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// User Login Controller
const login = async (req, res) => {
    try {
        const { mysqlPool } = req.app.locals;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const [users] = await mysqlPool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Remove password before sending response
        delete user.password;

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            error: 'Server error during login',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// User Logout Controller
const logout = async (req, res) => {
    try {
        const { redisClient } = req.app.locals;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];

        // Add token to Redis blacklist with expiration
        const decoded = decodeToken(token);
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - currentTime;

        if (ttl > 0) {
            await redisClient.set(`blacklist:${token}`, 'true');
            await redisClient.expire(`blacklist:${token}`, ttl);
        }

        res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({
            error: 'Server error during logout',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = { register, login, logout };