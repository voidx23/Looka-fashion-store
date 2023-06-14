require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayout = require('express-ejs-layouts')
const connectDB = require('./config/connection')
const session = require('express-session');
const bodyParser = require('body-parser')


var app = express();


connectDB();


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', './layout/layout')

app.use(expressLayout)

//session config
app.use(session
  ({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } //24 hours
  }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {


  const cartCount = req.cartCount;
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500 || 404);


  res.render('error');
  // res.render('user/errorPage',{userloggedIn:req.session.userloggedIn,cartCount});
});

module.exports = app;
