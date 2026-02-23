const express = require('express');
const c = require('../controllers/purchaseOrderController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/', authorize('manage_inventory'), c.list);
router.post('/', authorize('manage_inventory'), c.create);
router.get('/:id', authorize('manage_inventory'), c.get);
router.put('/:id', authorize('manage_inventory'), c.update);
router.delete('/:id', authorize('manage_inventory'), c.delete);

// items
router.get('/:orderId/items', authorize('manage_inventory'), c.listItems);
router.post('/:orderId/items', authorize('manage_inventory'), c.addItem);
router.put('/:orderId/items/:itemId', authorize('manage_inventory'), c.updateItem);
router.delete('/:orderId/items/:itemId', authorize('manage_inventory'), c.deleteItem);

module.exports = router;
