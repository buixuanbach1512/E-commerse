const express = require('express');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const {
    createProduct,
    getAProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImage,
} = require('../controllers/productController');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);
router.get('/:id', getAProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImage);
router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

router.get('/', getAllProduct);
module.exports = router;
