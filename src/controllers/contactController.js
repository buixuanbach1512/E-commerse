const Contact = require('../models/contactModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');

const createContact = asyncHandler(async (req, res) => {
    try {
        const newContact = await Contact.create(req.body);
        res.json(newContact);
    } catch (error) {
        throw new Error(error);
    }
});
const updateContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updatedContact);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        res.json(deletedContact);
    } catch (error) {
        throw new Error(error);
    }
});
const getContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaContact = await Contact.findById(id);
        res.json(getaContact);
    } catch (error) {
        throw new Error(error);
    }
});
const getallContact = asyncHandler(async (req, res) => {
    try {
        const getallContact = await Contact.find();
        res.json(getallContact);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createContact,
    updateContact,
    deleteContact,
    getContact,
    getallContact,
};
