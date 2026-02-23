const express = require('express');
const { markReady } = require('../controllers/kdsController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/orders', authorize('view_menu'), listOrders);
router.post('/items/:itemId/ready', authorize('update_status'), markReady);

module.exports = router;