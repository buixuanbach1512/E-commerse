const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {
    getAllCategory,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

router.get('/', getAllCategory);
router.get('/:id', getACategory);
router.post('/', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

module.exports = router;
