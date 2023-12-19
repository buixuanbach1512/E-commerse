const { generateToken } = require('../configs/jwtToken');
const { generateRefreshToken } = require('../configs/refreshToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const validateMongoDbId = require('../utils/validateMongoDbId');
const sendEmail = require('./emailController');
const crypto = require('crypto');
const uniqid = require('uniqid');

const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error('User Already Exists');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        if (findUser.isBlocked === false) {
            const refreshToken = generateRefreshToken(findUser._id);
            const updateUser = await User.findByIdAndUpdate(
                findUser._id,
                {
                    refreshToken: refreshToken,
                },
                { new: true },
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 12 * 60 * 60 * 1000,
            });
            res.json({
                _id: findUser?._id,
                name: findUser?.name,
                email: findUser?.email,
                address: findUser?.address,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id),
            });
        } else {
            throw new Error('Tài khoản đã bị khóa!!!');
        }
    } else {
        throw new Error('Thông tin không hợp lệ');
    }
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email });
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        if (findAdmin.role !== 'admin') throw new Error('Not Authorised');
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin._id,
            {
                refreshToken: refreshToken,
            },
            { new: true },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 12 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            name: findAdmin?.name,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookie');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error('No Refresh Token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token');
        }
        const accessToken = generateToken(user?.id);
        res.json({ accessToken });
    });
});

// Logout

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookie');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);
    }
    await User.findOneAndUpdate(
        { refreshToken },
        {
            refreshToken: '',
        },
    );
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204);
});

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getAll = await User.find();
        res.json(getAll);
    } catch (e) {
        throw new Error(e);
    }
});

const getOneUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const user = await User.findById({ _id: id });
        res.json(user);
    } catch (e) {
        throw new Error(e);
    }
});

const updateUser = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);
        const updateUser = await User.findByIdAndUpdate(
            { _id },
            {
                name: req?.body.name,
                email: req?.body.email,
                address: req?.body.address,
                mobile: req?.body.mobile,
            },
            {
                new: true,
            },
        );
        res.json(updateUser);
    } catch (e) {
        throw new Error(e);
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const deleteUser = await User.findByIdAndDelete({ _id: id });
        res.json(deleteUser);
    } catch (e) {
        throw new Error(JSON.stringify(e));
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            },
        );
        res.json({
            message: 'User Blocked',
        });
    } catch (e) {
        throw new Error(e);
    }
});
const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            },
        );
        res.json({
            message: 'User Unblocked',
        });
    } catch (e) {
        throw new Error(e);
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const findUser = await User.findOne({ email });
    if (!findUser) throw new Error('User not found with this email');
    try {
        const token = await findUser.createPasswordResetToken();
        await findUser.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8000/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            text: 'Hey User',
            subject: 'Forgot Password Link',
            html: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error('Token Expired!');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    } catch (e) {
        throw new Error(e);
    }
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, color, price, quantity } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        let newCart = await new Cart({
            userId: _id,
            prodId: productId,
            quantity,
            price,
            color,
        }).save();
        res.json(newCart);
    } catch (e) {
        throw new Error(e);
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const getCart = await Cart.find({ userId: _id }).populate('userId').populate('prodId').populate('color');
        res.json(getCart);
    } catch (e) {
        throw new Error(e);
    }
});

const removeProdCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    validateMongoDbId(_id);
    try {
        const deleteProdCart = await Cart.deleteOne({ userId: _id, _id: id });
        res.json(deleteProdCart);
    } catch (e) {
        throw new Error(e);
    }
});

const updateQuantityCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { id, quantity } = req.params;
    validateMongoDbId(_id);
    try {
        const cartItem = await Cart.findOne({ userId: _id, _id: id });
        cartItem.quantity = quantity;
        cartItem.save();
        res.json(cartItem);
    } catch (e) {
        throw new Error(e);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.deleteMany({ userId: _id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { coupon } = req.body;
    try {
        const validCoupon = await Coupon.findOne({ code: coupon });
        if (validCoupon === null) {
            throw new Error('Mã giảm giá không tồn tại');
        }
        const user = await User.findById(_id);
        const cartUser = await Cart.find({ userId: user._id });
        let cartTotal = 0;
        for (let i = 0; i < cartUser.length; i++) {
            cartTotal = cartTotal + cartUser[i].quantity * cartUser[i].price;
        }
        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(0);
        res.json(totalAfterDiscount);
    } catch (e) {
        throw new Error(e);
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount, payment } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const order = await Order.create({
            user: _id,
            shippingInfo,
            orderItems,
            totalPrice,
            totalPriceAfterDiscount,
            payment,
        });
        let userCart = await Cart.find({ userId: _id });
        let update = userCart.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.prodId._id },
                    update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json(order);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrder = asyncHandler(async (req, res) => {
    try {
        const allOrder = await Order.find().populate('user').populate('orderItems.product');
        res.json(allOrder);
    } catch (e) {
        throw new Error(e);
    }
});

const getOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const order = await Order.find({ user: _id })
            .populate('user')
            .populate('orderItems.product')
            .populate('orderItems.color');
        res.json(order);
    } catch (e) {
        throw new Error(e);
    }
});

const getOrderbyId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const order = await Order.findById(id).populate('orderItems.product').populate('orderItems.color');
        res.json(order);
    } catch (e) {
        throw new Error(e);
    }
});

const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    validateMongoDbId(id);
    try {
        const order = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
            },
            {
                new: true,
            },
        );
        res.json(order);
    } catch (e) {
        throw new Error(e);
    }
});

const getCountOrderByMonth = asyncHandler(async (req, res) => {
    let month = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    let d = new Date();
    let endDate = '';
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
        d.setMonth(d.getMonth() - 1);
        endDate = month[d.getMonth()] + ' ' + d.getFullYear();
    }
    console.log(endDate);
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $lte: new Date(),
                    $gte: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: {
                    month: '$month',
                },
                count: { $sum: 1 },
                amount: { $sum: '$totalPriceAfterDiscount' },
            },
        },
    ]);
    res.json(data);
});

const getCountOrderByYear = asyncHandler(async (req, res) => {
    let month = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    let d = new Date();
    let endDate = '';
    d.setDate(1);
    for (let i = 0; i < 11; i++) {
        d.setMonth(d.getMonth() - 1);
        endDate = month[d.getMonth()] + ' ' + d.getFullYear();
    }
    console.log(endDate);
    const data = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $lte: new Date(),
                    $gte: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: {
                    compareDate: endDate,
                },
                count: { $sum: 1 },
                amount: { $sum: '$totalPriceAfterDiscount' },
            },
        },
    ]);
    res.json(data);
});

module.exports = {
    createUser,
    loginUser,
    loginAdmin,
    getAllUser,
    getOneUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    changePassword,
    forgotPasswordToken,
    resetPassword,
    getWishList,
    addToCart,
    getUserCart,
    removeProdCart,
    updateQuantityCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getAllOrder,
    getOrder,
    getOrderbyId,
    updateOrder,
    getCountOrderByMonth,
    getCountOrderByYear,
    logout,
};
