const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        shippingInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            address: { type: String, required: true },
            province: { type: String, required: true },
            country: { type: String, required: true },
            other: { type: String, required: true },
            zipCode: { type: Number, required: true },
        },
        // paymentInfo: {
        //     orderId: { type: String, required: true },
        //     paymentId: { type: String, required: true },
        // },
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
        totalPrice: { type: Number, required: true },
        totalPriceAfterDiscount: { type: Number, required: true },
        orderStatus: { type: String, default: 'Ordered' },
    },
    {
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Order', orderSchema);
