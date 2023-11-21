const Color = require('../models/colorModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');

const createColor = asyncHandler(async (req, res) => {
    try {
        const createCol = await Color.create(req.body);
        res.json(createCol);
    } catch (e) {
        throw new Error(e);
    }
});
const getAllColor = asyncHandler(async (req, res) => {
    try {
        const allColor = await Color.find();
        res.json(allColor);
    } catch (e) {
        throw new Error(e);
    }
});
const getAColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const aColor = await Color.findById(id);
        res.json(aColor);
    } catch (e) {
        throw new Error(e);
    }
});
const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateCol = await Color.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCol);
    } catch (e) {
        throw new Error(e);
    }
});
const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteCol = await Color.findByIdAndDelete(id);
        res.json({ message: 'Delete Color Succesfully!' });
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = { createColor, getAllColor, getAColor, updateColor, deleteColor };
