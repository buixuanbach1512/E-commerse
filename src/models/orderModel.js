const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        shippingInfo: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            mobile: { type: String, required: true },
            other: { type: String, default: null },
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                color: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Color',
                },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        orderedAt: { type: Date, default: Date.now() },
        month: { type: String, default: new Date().getMonth() + 1 },
        totalPrice: { type: Number, required: true },
        totalPriceAfterDiscount: { type: Number, required: true },
        orderStatus: { type: String, default: 'Đã đặt hàng' },
        payment: String,
    },
    {
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Order', orderSchema);
