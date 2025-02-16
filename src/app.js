const express = require('express');
const connectDB = require('./database/database.js');
const authRouter = require('./router/authRouter');
const productRouter = require('./router/productRouter.js');
const cartRouter = require('./router/cartRouter.js');
const reviewRouter = require('./router/reviewRouter.js');
const searchRouter = require('./router/searchRouter.js');
const profileRouter = require('./router/profileRouter.js');
const cookieParser = require('cookie-parser');

const cors = require('cors');

const app = express();

//parsing
app.use(express.json());
app.use(cookieParser());

//cors
app.use(
  cors({
    origin: 'http://localhost:1234',
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

connectDB().then(() => {
  console.log('Database connection Successfull....');

  app.listen(3000, () => {
    console.log('Server started at Port no. 3000');
  });
});
