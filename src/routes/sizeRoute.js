const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {} = require('../controllers/colorController');
const { createSize, getAllSize, getASize, updateSize, deleteSize } = require('../controllers/sizeController');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createSize);
router.get('/', getAllSize);
router.get('/:id', authMiddleware, isAdmin, getASize);
router.put('/:id', authMiddleware, isAdmin, updateSize);
router.delete('/:id', authMiddleware, isAdmin, deleteSize);

module.exports = router;
