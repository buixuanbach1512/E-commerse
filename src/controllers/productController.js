const { json } = require('body-parser');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (e) {
        throw new Error(e);
    }
});

const getAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const getOne = await Product.findById({ _id: id });
    res.json(getOne);
    try {
    } catch (e) {
        throw new Error(e);
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const getAll = await Product.find(req.query);
        res.json(getAll);
    } catch (e) {
        throw new Error(e);
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const updatePro = await Product.findByIdAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        res.json(updatePro);
    } catch (e) {
        throw new Error(e);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deletePro = await Product.findByIdAndDelete({ _id: id });
        res.json({
            message: 'Delete Product Successfully',
        });
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = { createProduct, getAProduct, getAllProduct, updateProduct, deleteProduct };
