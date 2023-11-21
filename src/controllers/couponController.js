const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const createCoup = await Coupon.create(req.body);
        res.json(createCoup);
    } catch (e) {
        throw new Error(e);
    }
});

const getAllCoupon = asyncHandler(async (req, res) => {
    try {
        const getAllCoup = await Coupon.find();
        res.json(getAllCoup);
    } catch (e) {
        throw new Error(e);
    }
});

const getACoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getACoup = await Coupon.findById(id);
        res.json(getACoup);
    } catch (e) {
        throw new Error(e);
    }
});

const updateCoupon = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const updateCoup = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCoup);
    } catch (e) {
        throw new Error(e);
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const deleteCoup = await Coupon.findByIdAndDelete(id);
        res.json({
            message: 'Delete Coupon Successfully!',
        });
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = { createCoupon, getAllCoupon, getACoupon, updateCoupon, deleteCoupon };
