const express = require('express');
const router = express.Router();

// import sub routers
const unitRoutes = require('./unitRoutes');
const materialRoutes = require('./rawMaterialRoutes');
const vendorRoutes = require('./vendorRoutes');
const poRoutes = require('./purchaseOrderRoutes');
const recipeRoutes = require('./recipeRoutes');
// further routers to be added: vendors, purchaseOrders, stock, recipes

router.use('/units', unitRoutes);
router.use('/materials', materialRoutes);
router.use('/vendors', vendorRoutes);
router.use('/purchase-orders', poRoutes);
router.use('/recipes', recipeRoutes);
router.use('/stock', require('./stockRoutes'));

module.exports = router;