var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var message = new Schema({
  message: String
});


module.exports = mongoose.model('Message', message);
