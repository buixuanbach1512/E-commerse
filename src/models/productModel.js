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
            type: String,
            enum: ['Adidas', 'Nike', 'LV'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        quantity: {
            type: Number,
            require: true,
        },
        image: [],
        color: {
            type: String,
            enum: ['Blue', 'Black', 'Red'],
        },
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
            type: String,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Product', productSchema);
