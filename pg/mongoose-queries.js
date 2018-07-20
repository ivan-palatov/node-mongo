// const {ObjectID} = require('mongodb')

const {mongoose} = require('../server/db/mongoose')
const {Todo} = require('../server/models/todo')
const {User} = require('../server/models/user')

// const id = '5b50d0c01d78351ba831909d'

// if (!ObjectID.isValid(id)) {
//     console.log('ID is not valid')
// }

// Todo.find({  _id: id })
//     .then(todos => console.log('Todos', todos))
//     .catch(err => console.log(err))

// Todo.findOne({  _id: id })
//     .then(todo => console.log('Todo', todo))
//     .catch(err => console.log(err))

// Todo.findById(id)
//     .then(todo => {
//         if (!todo) {
//             return console.log('Id not found')
//         }
//         console.log('Todo by id', todo)
//     })
//     .catch(err => console.log(err))


User.findById('5b505b3325a04716cc7a64bb')
    .then(user => {
        if (!user) {
            return console.log('User not found!')
        }
        console.log('User:', user)
    })
    .catch(err => console.log('Something went wrong: id is not valid'))