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

app.post('/todos', authenticate, (req, res) => {
    let todo = new Todo({ text: req.body.text, _creator: req.user._id })

    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err))
})

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id })
        .then(todos => {
            res.send({todos})
        })
        .catch(err => res.status(400).send(err))
})

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id)) {
       return  res.status(404).send({ error: 'ID is invalid!' })
    }
    Todo.findOne({ _id: id, _creator: req.user._id })
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ error: 'Todo with that ID does not exist' })
            }
            res.send({todo})
        })
        .catch(err => {
            res.status(404).send({ error: 'Something went wrong' })
        })
})

app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({ error: 'ID is invalid!' })
    }
    try {
        const todo = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
        if (!todo) {
            return res.status(404).send({ error: 'Todo with that ID does not exist'})
        }
        res.send({todo})
    } catch (e) {
        res.status(400).send({ error: 'Something went wrong' })
    }
})

app.patch('/todos/:id', authenticate, (req, res) => {
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
    Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, {$set: body}, {new: true})
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

app.post('/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password'])
        const user = new User(body)
        await user.save()
        const token = await user.generateAuthToken()
        res.header('x-auth', token).send(user)
    } catch (error) {
        res.status(400).send({error})
    }
})

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)
})

app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password'])
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.header('x-auth', token).send(user)
    } catch (error) {
        res.status(400).send({error})
    }     
})

app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token)
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})


app.listen(port, () => console.log(`Started on port ${port}`))

module.exports = {app}