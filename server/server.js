require('./config/config')

const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')
const bcrypt = require('bcryptjs')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } =require('./middleware/authenticate')

const app = express()
const port = process.env.PORT

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    let todo = new Todo({ text: req.body.text })

    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err))
})

app.get('/todos', (req, res) => {
    Todo.find()
        .then(todos => {
            res.send({todos})
        })
        .catch(err => res.status(400).send(err))
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id)) {
       return  res.status(404).send({ error: 'ID is invalid!' })
    }
    Todo.findById(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ error: 'Todo with that ID does not exist' })
            }
            res.send({todo})
        })
        .catch(err => {
            res.status(400).send({ error: 'Something went wrong' })
        })
})

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ error: 'ID is invalid!' })
    }
    Todo.findByIdAndRemove(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ error: 'Todo with that ID does not exist'})
            }
            res.send({todo})
        })
        .catch(err => {
            res.status(400).send({ error: 'Something went wrong' })
        })
})

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ error: 'ID is invalid!' })
    }
    if (body.text.trim().length < 2) {
        return res.status(400).send({ error: 'Text is too short!' })
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false
        body.completedAt = null
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ error: 'Todo with that ID does not exist' })
            }
            res.send({todo})
        })
        .catch(err => {
            res.status(400).send({ error: 'Something went wrong' })
        })
})



/*
    USERS SECTION
*/

app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password'])
    let user = new User(body)
    user.save()
        .then(() => {
            return user.generateAuthToken()
        })
        .then(token => {
            res.header('x-auth', token).send(user)
        })
        .catch(err => res.status(400).send({err}))
})

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)
})

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password)
        .then(user => {
            user.generateAuthToken()
                .then(token => {
                    res.header('x-auth', token).send(user)
                })
                .catch(err => res.status(400).send({error: 'Something went wrong'}))
        })
        .catch(err => {
            res.status(400).send({error : err})
        })
})



app.listen(port, () => console.log(`Started on port ${port}`))

module.exports = {app}