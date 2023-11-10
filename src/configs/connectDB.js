const mongoose = require('mongoose');

const connectDB = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log('DB Connected Successfully !!');
    } catch (e) {
        console.log('DB Error');
    }
};

module.exports = connectDB;
