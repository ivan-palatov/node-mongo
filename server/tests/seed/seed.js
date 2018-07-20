const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const {Todo} = require('../../models/todo')
const {User} = require('../../models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const users = [
    {
        _id: userOneId,
        email: 'ivan@example.com',
        password: 'userOnePass',
        tokens: [
            { access: 'auth', token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString() }
        ]
    },
    {
        _id: userTwoId,
        email: 'Alexis@example.com',
        password: 'userTwoPass'
    }
]

const Todos = [
    { _id: new ObjectID(), text: 'First test todo'},
    { _id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 123456}
]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(Todos)
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save()
        let userTwo = new User(users[1]).save()

        return Promise.all([userOne, userTwo])
    }).then(() => done())
}

module.exports = {Todos, users, populateTodos, populateUsers}