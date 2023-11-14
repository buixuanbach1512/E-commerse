const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');
const slugify = require('slugify');

const createCategory = asyncHandler(async (req, res) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const createCate = await Category.create(req.body);
        res.json(createCate);
    } catch (e) {
        throw new Error(e);
    }
});
const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const allCate = await Category.find();
        res.json(allCate);
    } catch (e) {
        throw new Error(e);
    }
});
const getACategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const aCate = await Category.findById({ _id: id });
        res.json(aCate);
    } catch (e) {
        throw new Error(e);
    }
});
const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        validateMongoDbId(id);
        const updateCate = await Category.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.json(updateCate);
    } catch (e) {
        throw new Error(e);
    }
});
const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const deleteCate = await Category.findByIdAndDelete({ _id: id });
        res.json('Delete Category Successfully');
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = { createCategory, getAllCategory, getACategory, updateCategory, deleteCategory };
