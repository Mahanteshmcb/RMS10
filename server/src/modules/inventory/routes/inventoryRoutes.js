const express = require('express');
const router = express.Router();

// import sub routers
const unitRoutes = require('./unitRoutes');
// further routers to be added: materials, vendors, purchaseOrders, stock, recipes

router.use('/units', unitRoutes);

module.exports = router;