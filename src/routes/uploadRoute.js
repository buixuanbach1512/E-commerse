const express = require('express');
const { uploadImages, deleteImages } = require('../controllers/uploadController');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

router.post('/upload-img', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages);
router.delete('/delete-img/:id', authMiddleware, isAdmin, deleteImages);

module.exports = router;
