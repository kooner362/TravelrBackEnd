var express = require('express');
var passport = require('passport');
var Message = require('../models/message')

var router = express.Router();

// Retrieving all messages by admin
router.get('/messages', function(req, res, next){
  Message.find({}, function(err, messages){
    res.send(messages);
  });
});

// Sending a new message to be displayed to all logged in users
router.post('/messages', function(req, res, next){
  var incoming = req.body.message;
  var newMessage = new Message({
    message: incoming
  });
  newMessage.save(function(err, save) {
    if(err){
      return err;
    }
    else{
      res.send(save);
    }
  });
});

// Deleting a message given an id
router.delete('/messages/:id', function(req, res, next){
  var id = req.params.id
  Message.findOneAndRemove({'_id': id}, function(err, message){
    if (err){
      return (err)
    }
    else if (message){
      res.send(message);
    }
    else {
      res.send("Message doesn't exits");
    }
  });
});

module.exports = router;
