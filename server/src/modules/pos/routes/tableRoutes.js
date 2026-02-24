const express = require('express');
const c = require('../controllers/tableController');
const { authorize } = require('../../../core/auth/authorize');

const router = express.Router();

// auth removed for UI testing
router.get('/', /*authorize('view_menu'),*/ c.list);
router.post('/', /*authorize('manage_menu'),*/ c.create);
router.put('/:id', /*authorize('manage_menu'),*/ c.update);
router.delete('/:id', /*authorize('manage_menu'),*/ c.remove);

module.exports = router;