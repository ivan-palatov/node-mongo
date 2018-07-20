const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const app = express()
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
    const id = req.params.id
    if (!ObjectID.isValid(id)) {
       return  res.status(404).send({ error: 'Id is not found!' })
    }
    Todo.findById(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send({ error: 'User not found' })
            }
            res.send({todo})
        })
        .catch(err => {
            res.status(400).send({ error: 'Something went wrong' })
        })
})




app.listen(3000, () => console.log('Started on port 3000'))

module.exports = {app}