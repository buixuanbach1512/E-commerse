const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');
const slugify = require('slugify');

const createBrand = asyncHandler(async (req, res) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const createCate = await Brand.create(req.body);
        res.json(createCate);
    } catch (e) {
        throw new Error(e);
    }
});
const getAllBrand = asyncHandler(async (req, res) => {
    try {
        const allCate = await Brand.find();
        res.json(allCate);
    } catch (e) {
        throw new Error(e);
    }
});
const getABrand = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const aCate = await Brand.findById({ _id: id });
        res.json(aCate);
    } catch (e) {
        throw new Error(e);
    }
});
const updateBrand = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        validateMongoDbId(id);
        const updateCate = await Brand.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.json(updateCate);
    } catch (e) {
        throw new Error(e);
    }
});
const deleteBrand = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const deleteCate = await Brand.findByIdAndDelete(id);
        res.json('Delete Brand Successfully');
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = { createBrand, getAllBrand, getABrand, updateBrand, deleteBrand };
