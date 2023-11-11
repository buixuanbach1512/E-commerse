const express = require('express');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const {
    createProduct,
    getAProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const router = express.Router();

router.get('/', getAllProduct);
router.post('/', authMiddleware, isAdmin, createProduct);
router.get('/:id', getAProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
