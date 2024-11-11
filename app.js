// Import required modules and configure environment variables
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');

// Import route handlers

const authRoutes = require('./app/user/routeUser');
const fituresRouter = require('./app/fitures/features');
const documentRouter = require('./app/documentation/documentation');
const partisipansRouter = require('./app/partisipans/partisipans');
const landingPageRouter = require('./app/landingpage/landing');
const menuRouter = require('./app/menu/menurouter');
const indexRouter = require('./app/index');

// Initialize Express application
const app = express();

// Connect to MongoDB using Mongoose
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
0;
app.use('/images', express.static(path.join(__dirname, 'images')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/auth', authRoutes);
app.use('/landing', landingPageRouter);
app.use('/fitures', fituresRouter);
app.use('/doc', documentRouter);
app.use('/partisipans', partisipansRouter);
app.use('/menu', menuRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
