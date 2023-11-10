const { generateToken } = require('../configs/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

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
        const user = await User.findById({ _id: id });
        res.json(user);
    } catch (e) {
        throw new Error(e);
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await User.findByIdAndDelete({ _id: id });
        res.json(deleteUser);
    } catch (e) {
        throw new Error(e);
    }
});

const updateUser = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
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

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
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

module.exports = { createUser, loginUser, getAllUser, getOneUser, deleteUser, updateUser, blockUser, unBlockUser };
