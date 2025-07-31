const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const wantedRoutes = require('./routes/wanted');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wanted', wantedRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
    res.send('FBI Wanted API Server is running');
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;