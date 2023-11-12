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
        // Filter
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.collation({ locale: 'vi' }).sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error('This page does not exist');
        }
        console.log(page, limit, skip);

        const product = await query;
        res.json(product);
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
