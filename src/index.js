const express = require('express');
const connectDB = require('./configs/connectDB');

// Route
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const categoryRouter = require('./routes/categoryRoute');
const brandRouter = require('./routes/brandRoute');
const colorRouter = require('./routes/colorRoute');
const sizeRouter = require('./routes/sizeRoute');
const couponRouter = require('./routes/couponRoute');
const uploadRouter = require('./routes/uploadRoute');
const contactRouter = require('./routes/contactRoute');

const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/color', colorRouter);
app.use('/api/size', sizeRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contact', contactRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server is running at port:', PORT);
});
