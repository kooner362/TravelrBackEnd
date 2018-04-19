var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      saved: [{city: String, comments: String}]
});

userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
