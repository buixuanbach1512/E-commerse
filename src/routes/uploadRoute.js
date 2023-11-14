const express = require('express');
const { uploadImages } = require('../controllers/uploadController');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const { uploadPhoto } = require('../middlewares/uploadImages');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, uploadPhoto.array('images', 10), uploadImages);

module.exports = router;
