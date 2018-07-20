const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minLength: 4,
        trim: true,
        unique: true,
        validate: {
            validator: value => validator.isEmail(value),
            massage: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
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
})

userSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()
    return _.pick(userObject, ['_id', 'email'])
}

userSchema.methods.generateAuthToken = function () {
    let user = this
    const access = 'auth'
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()

    user.tokens = user.tokens.concat([{access, token}])

    return user.save().then(() => {
        return token
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}