const mongoose = require('mongoose');
const { USER } = require('../../../config/policies.constants');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    rol: {
        type: String,
        default: USER
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
})

module.exports = mongoose.model('User', userSchema, 'users');