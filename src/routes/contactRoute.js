const express = require('express');
const {
    createContact,
    updateContact,
    deleteContact,
    getContact,
    getallContact,
} = require('../controllers/contactController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', createContact);
router.put('/:id', authMiddleware, isAdmin, updateContact);
router.delete('/:id', authMiddleware, isAdmin, deleteContact);
router.get('/:id', getContact);
router.get('/', getallContact);

module.exports = router;
