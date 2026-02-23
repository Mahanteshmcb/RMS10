const express = require('express');
const { list, create, update, remove } = require('../controllers/categoryController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();
router.get('/', authorize('view_menu'), list);
router.post('/', authorize('manage_menu'), create);
router.put('/:id', authorize('manage_menu'), update);
router.delete('/:id', authorize('manage_menu'), remove);

module.exports = router;