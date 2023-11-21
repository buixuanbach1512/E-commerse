const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { getAllBrand, getABrand, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');

router.get('/', getAllBrand);
router.get('/:id', authMiddleware, isAdmin, getABrand);
router.post('/', authMiddleware, isAdmin, createBrand);
router.put('/:id', authMiddleware, isAdmin, updateBrand);
router.delete('/:id', authMiddleware, isAdmin, deleteBrand);

module.exports = router;
