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
// revenue by category
router.get('/dashboard/revenue-by-category', authorize('view_reports'), c.revenueByCategory);
// revenue by payment method
router.get('/dashboard/revenue-by-payment', authorize('view_reports'), c.paymentMethods);

// generic JSON upload (stored in data_uploads table)
router.post('/upload', authorize('view_reports'), express.json(), c.upload);
// list existing uploads
router.get('/uploads', authorize('view_reports'), c.getUploads);

module.exports = router;
