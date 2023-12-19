const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['XXL', 'XL', 'L', 'M', 'S'],
    },
});

//Export the model
module.exports = mongoose.model('Size', sizeSchema);
