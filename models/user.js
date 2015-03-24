var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: {
        username: String,
        password: String
    },
    isAdmin: Boolean
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    console.log('valid password called');
    // return bcrypt.compareSync(password, this.local.password);
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);