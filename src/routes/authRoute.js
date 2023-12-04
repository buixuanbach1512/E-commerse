const express = require('express');
const {
    createUser,
    loginUser,
    getAllUser,
    getOneUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    changePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishList,
    saveAddress,
    addToCart,
    getUserCart,
    createOrder,
    getOrder,
    getAllOrder,
    getOrderbyId,
    removeProdCart,
    updateQuantityCart,
    emptyCart,
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// auth
router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/login-admin', loginAdmin);
router.get('/refresh', handleRefreshToken);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, changePassword);
router.get('/logout', logout);

// cart
router.post('/add-to-cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, getUserCart);
router.put('/update-cart/:id/:quantity', authMiddleware, updateQuantityCart);
router.delete('/delete-cart/:id', authMiddleware, removeProdCart);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.post('/cart/order', authMiddleware, createOrder);

// order
router.get('/all-order', authMiddleware, isAdmin, getAllOrder);
router.get('/order', authMiddleware, getOrder);
router.get('/order/:id', authMiddleware, getOrderbyId);
router.post('/create-order', authMiddleware, createOrder);

// user
router.get('/all-users', getAllUser);
router.get('/wishlist', authMiddleware, getWishList);
router.get('/:id', authMiddleware, isAdmin, getOneUser);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/edit-user', authMiddleware, updateUser);
router.delete('/:id', deleteUser);

// block users
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);

module.exports = router;
