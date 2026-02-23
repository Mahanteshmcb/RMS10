const express = require('express');
const c = require('../controllers/menuItemController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

router.get('/', authorize('view_menu'), c.list);
router.post('/', authorize('manage_menu'), c.create);
router.get('/:id', authorize('view_menu'), c.get);
router.put('/:id', authorize('manage_menu'), c.update);
router.delete('/:id', authorize('manage_menu'), c.remove);

// variants nested
router.get('/:menuItemId/variants', authorize('view_menu'), c.listVariants);
router.post('/:menuItemId/variants', authorize('manage_menu'), c.createVariant);
router.put('/variants/:variantId', authorize('manage_menu'), c.updateVariant);
router.delete('/variants/:variantId', authorize('manage_menu'), c.removeVariant);

module.exports = router;