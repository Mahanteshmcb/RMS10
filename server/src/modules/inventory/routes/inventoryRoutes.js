const express = require('express');
const router = express.Router();

// import sub routers
const unitRoutes = require('./unitRoutes');
const materialRoutes = require('./rawMaterialRoutes');
// further routers to be added: vendors, purchaseOrders, stock, recipes

router.use('/units', unitRoutes);
router.use('/materials', materialRoutes);

module.exports = router;