const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

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

userSchema.methods.removeToken = function (token) {
    let user = this
    return user.update({
        $pull: {
            tokens: { token }
        }
    })
}

userSchema.statics.findByToken = function (token) {
    let User = this
    let decoded

    try {
        decoded = jwt.verify(token, 'abc123')
    } catch (err) {
        return Promise.reject()
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

userSchema.statics.findByCredentials = function (email, password) {
    let User = this
    return User.findOne({email})
        .then(user => {
            if (!user) {
                return Promise.reject('There\'s no user with that Email')
            }
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (!res) {
                        reject('Wrong password!')
                    } else {
                        resolve(user)
                    }
                }) 
            })      
        })
}

userSchema.pre('save', function (next) {
    let user = this
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}