const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _= require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});


UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject= user.toObject();

    return _.pick(user, ['_id', 'name']);
};

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, '123');

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};


UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, '123');
    } catch (e) {
        return Promise.reject();
    }

   return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
   });
};

UserSchema.pre('save', function(next) {
    let user = this;

    if (user.isModified('password')){
        
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next()
            });
        });
        
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = {User};