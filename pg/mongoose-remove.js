// const {ObjectID} = require('mongodb')

const {mongoose} = require('../server/db/mongoose')
const {Todo} = require('../server/models/todo')
const {User} = require('../server/models/user')


// Todo.remove({}) // удаляет всё из todos

// Todo.findOneAndRemove()

Todo.findByIdAndRemove('5b5199fb5b92071f58181013')
    .then(todo => console.log(todo))
    .catch(err => console.log(err))