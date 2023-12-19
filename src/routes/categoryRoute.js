const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {
    getAllCategory,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductCate,
} = require('../controllers/categoryController');

router.get('/', getAllCategory);
router.get('/prod-cate', getProductCate);
router.get('/:id', authMiddleware, isAdmin, getACategory);
router.post('/', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

module.exports = router;
