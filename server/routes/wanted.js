const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const wantedController = require('../controllers/wanted');

// Apply authentication to all wanted routes
router.use(authenticate);

router.get('/', wantedController.getWantedList);
router.get('/search', wantedController.searchWanted);
router.get('/:uid', wantedController.getWantedPerson);

module.exports = router;