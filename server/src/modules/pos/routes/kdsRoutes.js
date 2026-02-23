const express = require('express');
const { markReady } = require('../controllers/kdsController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.post('/items/:itemId/ready', authorize('update_status'), markReady);

module.exports = router;