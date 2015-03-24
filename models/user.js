var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: {
        username: String,
        email: String,
        password: String
    },
    username: String,
    password: String
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    console.log(password, this.password);
    // return bcrypt.compareSync(password, this.local.password);
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);