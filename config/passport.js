var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
   User.findById(id, function(err, user){
       done(err, user);
   });
});

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password2 = req.body.password2;
    req.checkBody('firstName', 'First name is required').notEmpty();
    req.checkBody('lastName', 'Last name is required').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email}, function(err, user) {
       if (err) {
           return done(err);
       }
       if (user){
           return done(null, false, {message: 'Email is already registered.'});
       }
       else if (!user){
         var newUser = new User();
         newUser.firstName = firstName;
         newUser.lastName = lastName;
         newUser.email = email;
         newUser.password = newUser.encryptPassword(password);
         newUser.save(function(err){
            if (err) {
                throw err;
            }
            return done(null, newUser);
         });
       }
    });
}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'User not found'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        return done(null, user);
    });
}));
