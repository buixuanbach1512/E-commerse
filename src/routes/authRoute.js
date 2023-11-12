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
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/refresh', handleRefreshToken);
router.put('/change-pass', authMiddleware, changePassword);

router.get('/all-users', getAllUser);
router.get('/:id', authMiddleware, isAdmin, getOneUser);
router.put('/edit-user', authMiddleware, updateUser);
router.delete('/:id', deleteUser);

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser);

module.exports = router;
