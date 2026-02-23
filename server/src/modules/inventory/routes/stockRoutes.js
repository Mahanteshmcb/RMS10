const express = require('express');
const c = require('../controllers/inventoryStockController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/', authorize('manage_inventory'), c.list);
router.post('/', authorize('manage_inventory'), c.upsert);

module.exports = router;