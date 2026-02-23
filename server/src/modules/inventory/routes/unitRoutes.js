const express = require('express');
const c = require('../controllers/unitController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/', authorize('manage_inventory'), c.list);
router.post('/', authorize('manage_inventory'), c.create);
router.put('/:id', authorize('manage_inventory'), c.update);
router.delete('/:id', authorize('manage_inventory'), c.remove);

module.exports = router;