const express = require('express');
const db = require('../../../config/db');
const Order = require('../models/order');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

// modify an existing open order by adding an item
router.post('/orders/:id/items', authorize('modify_order'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = req.body; // expect menu_item_id, variant_id, quantity, price
    await Order.addItem(req.restaurantId, id, item);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// could add other waiter-specific endpoints later

module.exports = router;