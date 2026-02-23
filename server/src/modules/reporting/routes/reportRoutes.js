const express = require('express');
const c = require('../controllers/reportController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

// sales aggregation by day
router.get('/sales', authorize('view_reports'), c.sales);
// top selling menu items
router.get('/top-items', authorize('view_reports'), c.topItems);
// dashboard summary
router.get('/dashboard/summary', authorize('view_reports'), c.summary);
// active orders
router.get('/dashboard/active-orders', authorize('view_reports'), c.activeOrders);

module.exports = router;
