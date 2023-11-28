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
        const refreshToken = generateRefreshToken(findUser?._id);
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
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
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
        throw new Error(e);
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
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
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
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    } catch (e) {
        throw new Error(e);
    }
});

const saveAddress = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);
        const updateUser = await User.findByIdAndUpdate(
            { _id },
            {
                address: req?.body.address,
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

const addToCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
        if (alreadyExistCart) {
            alreadyExistCart.deleteOne();
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user._id,
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
        const getCart = await Cart.findOne({ orderBy: _id }).populate('products.product');
        res.json(getCart);
    } catch (e) {
        throw new Error(e);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOneAndRemove({ orderBy: _id });
        res.json(cart);
    } catch (e) {
        throw new Error(e);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { coupon } = req.body;
    try {
        const validCoupon = await Coupon.findOne({ name: coupon });
        if (validCoupon === null) {
            throw new Error('Invalid Coupon');
        }
        const user = await User.findById(_id);
        let { products, cartTotal } = await Cart.findOne({ orderBy: user._id }).populate('products.product');
        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
        await Cart.findOneAndUpdate({ orderBy: user._id }, { totalAfterDiscount }, { new: true });
        res.json(totalAfterDiscount);
    } catch (e) {
        throw new Error(e);
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        if (!COD) throw new Error('Create cash order failed');
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderBy: user._id });
        let finalAmout = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmout = userCart.totalAfterDiscount;
        } else {
            finalAmout = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: 'COD',
                amount: finalAmout,
                status: 'Thanh toán khi giao hàng',
                created: Date.now(),
                currency: 'vnd',
            },
            orderBy: user._id,
            orderStatus: 'Thanh toán khi giao hàng',
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: 'success' });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrder = asyncHandler(async (req, res) => {
    try {
        const allOrder = await Order.find().populate('products.product').populate('orderBy').exec();
        res.json(allOrder);
    } catch (e) {
        throw new Error(e);
    }
});

const getOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const order = await Order.findOne({ orderBy: _id }).populate('products.product').populate('orderBy').exec();
        res.json(order);
    } catch (e) {
        throw new Error(e);
    }
});

const getOrderbyId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const order = await Order.findById(id).populate('products.product').populate('orderBy').exec();
        res.json(order);
    } catch (e) {
        throw new Error(e);
    }
});

const updateOrder = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateO = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                $set: { 'paymentIntent.status': status },
            },
            { new: true },
        );
        res.json(updateO);
    } catch (e) {
        throw new Error(e);
    }
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
    saveAddress,
    addToCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getAllOrder,
    getOrder,
    getOrderbyId,
    updateOrder,
    logout,
};
