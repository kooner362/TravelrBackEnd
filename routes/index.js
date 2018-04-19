var express = require('express');
var passport = require('passport');
var User = require('../models/user')

var router = express.Router();

// GET home page
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/profile', isLoggedIn, function(req, res, next){
  //route which can only be used if logged in
  res.render('profile', {user: req.user});
});

// Registration page
router.get('/register', function(req, res, next){
  var messages = req.flash('error');
  res.render('register', {messages: messages, hasErrors: messages.length > 0});
});

// Registration authentication
router.post('/register', passport.authenticate('local.register', {
    successRedirect: '/profile',
    failureRedirect: '/register',
    failureFlash: true
}));

// Login authentication
router.post('/login', passport.authenticate('local.login',{
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

// Login page
router.get('/login', function (req, res, next) {
    var messages = req.flash('error');
    var successMsg = req.flash('success')[0];
    res.render('login', {successMsg: successMsg, noMessages: !successMsg,
      messages: messages, hasErrors: messages.length > 0});
});

// Logging a user out
router.get('/logout', isLoggedIn,function(req, res, next){
    req.logout();
    res.redirect('/');
});

// function to check whether a user is logged in, redirect to home page if not
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

// Retrieve all saved cities for the currently logged in user
router.get('/city/saved', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            res.send(doc.saved);
        }
    });
});

// Delete a given city from a currently logged in user
router.delete('/city/saved', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            var i = 0;
            var newArray = [];
            while (i < doc.saved.length) {
                if (doc.saved[i].city != req.body.city) {
                    newArray.push({'city': doc.saved[i].city, 'comments': doc.saved[i].comments});
                }
                i++;
            }
            User.findOneAndUpdate({'email': req.user.email}, {'saved': newArray}).then(function(newDoc) {
                if (!newDoc) {
                    res.send({'message': 'Invalid!', success: false});
                } else {
                    res.send({'message': 'City removed!', success: true});
                }
            });
        }
    });
});

// Save a city and a comment from the user
router.put('/city/saved', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            var i = 0;
            var newArray = [];
            while (i < doc.saved.length) {
                if (doc.saved[i].city == req.body.city) {
                    newArray.push({'city': doc.saved[i].city, 'comments': req.body.comments});
                } else {
                    newArray.push({'city': doc.saved[i].city, 'comments': doc.saved[i].comments});
                }
                i++;
            }
            User.findOneAndUpdate({'email': req.user.email}, {'saved': newArray}).then(function(newDoc) {
                if (!newDoc) {
                    res.send({'message': 'Invalid!', success: false});
                } else {
                    res.send({'message': 'Comment saved!', success: true});
                }
            });
        }
    });
});

// Save a city for a user
router.post('/city/save', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            var exists = false;
            for (var i = 0; i < doc.saved.length; i++) {
                if (doc.saved[i].city == req.body.city) {
                    exists = true;
                }
            }
            if (exists) {
                res.send({'message': 'City has already been saved!', success: false});
            } else {
                var newArray = doc.saved;
                newArray.push({'city': req.body.city, 'comments': req.body.comments});
                User.findOneAndUpdate({'email': req.user.email}, {'saved': newArray}).then(function(newDoc) {
                    if (!newDoc) {
                        res.send({'message': 'Invalid!', success: false});
                    } else {
                        res.send({'message': 'City saved!', success: true});
                    }
                });
            }
        }
    });
});

router.post('/city/remove', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            var i = 0;
            found = false;
            while (i < doc.length && !found) {
                if (doc[i].city == req.body.city) {
                    found = true;
                } else {
                    i += 1;
                }
            }
            var newArray = doc.saved;
            newArray.remove(i);
            User.findOneAndUpdate({'email': req.body.email}, {'saved': newArray}).then(function() {
                res.send({'message': 'City Removed!', success: true});
            });
        }
    });
});

router.post('/city/comment', function(req, res, next) {
    User.findOne({'email': req.user.email}).then(function(doc) {
        if (!doc) {
            res.send({'message': 'Invalid!', success: false});
        } else {
            var i = 0;
            found = false;
            while (i < doc.length && !found) {
                if (doc[i].city == req.body.city) {
                    found = true;
                } else {
                    i += 1;
                }
            }
            var newArray = doc.saved;
            newArray[i].comment = req.body.comment;
            User.findOneAndUpdate({'email': req.body.email}, {'saved': newArray}).then(function() {
                res.send({'message': 'Comment updated!', success: true});
            });
        }
    });
});

module.exports = router;
