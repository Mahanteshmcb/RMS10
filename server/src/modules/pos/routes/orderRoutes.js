const express = require('express');
const c = require('../controllers/orderController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/', authorize('view_menu'), c.list);
router.get('/:id', authorize('view_menu'), c.get);
router.post('/', authorize('create_orders'), c.create);
router.put('/:id/status', authorize('update_status'), c.updateStatus);
router.post('/:id/pay', authorize('create_orders'), c.pay);

module.exports = router;