const express = require('express');
const connectDB = require('./database/database.js');
const authRouter = require('./router/authRouter');
const productRouter = require('./router/productRouter.js');
const cartRouter = require('./router/cartRouter.js');
const reviewRouter = require('./router/reviewRouter.js');
const searchRouter = require('./router/searchRouter.js');
const profileRouter = require('./router/profileRouter.js');
const paymentRouter = require('./router/paymentRouter.js');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'key.env' });
const cors = require('cors');
const orderRouter = require('./router/orderRouter.js');

const app = express();

//parsing
app.use(express.json());
app.use(cookieParser());

//cors
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://imaginative-puppy-a4642f.netlify.app',
    ],
    credentials: true,
  })
);

//Routing
app.use('/', authRouter);
app.use('/', productRouter);
app.use('/', cartRouter);
app.use('/', reviewRouter);
app.use('/', searchRouter);
app.use('/', profileRouter);
app.use('/', paymentRouter);
app.use('/', orderRouter);

connectDB().then(() => {
  console.log('Database connection Successfull....');

  app.listen(3000, () => {
    console.log('Server started at Port no. 3000');
  });
});
