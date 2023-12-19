const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
        },
        sold: {
            type: Number,
            default: 0,
        },
        quantity: {
            type: Number,
            require: true,
        },
        images: [
            {
                public_id: String,
                url: String,
            },
        ],
        color: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Color',
            },
        ],
        size: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Size',
            },
        ],
        tags: String,
        ratings: [
            {
                star: Number,
                comment: String,
                postedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
        totalRating: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Product', productSchema);
