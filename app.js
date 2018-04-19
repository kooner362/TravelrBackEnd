var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expresshbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var index = require('./routes/index');
var messages = require('./routes/api');

var app = express();




var cred = 'csc309:123csc309!';
mongoose.connect('mongodb://'+ cred +'@cluster0-shard-00-00-ejgpa.'+
'mongodb.net:27017,cluster0-shard-00-01-ejgpa.mongodb.net:27017,cluster0'+
'-shard-00-02-ejgpa.mongodb.net:27017/csc309?ssl=true&replicaSet=Cluster0'+
'-shard-0&authSource=admin', {useMongoClient: true});
require('./config/passport');

// view engine setup
app.engine('.hbs', expresshbs({defaultLayout: 'layouts', extname: '.hbs'}));
app.set('view engine', '.hbs');




// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'assets/images', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
    name: 'teleportApp',
    secret: 'secretPassword',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {maxAge: 180 * 60 * 4000} //Three HOURS before it removes from db

}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('assets'))
app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/api', messages);
app.use('/', index);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
