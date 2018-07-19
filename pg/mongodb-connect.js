// const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB: ', err)
    }
    const db = client.db('TodoApp')
    console.log('Connected to MongoDB')

    // db.collection('Todos').insertOne({
    //     text: 'Something todo',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert Todo', err)
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2))
    // })

    // db.collection('Users').insertOne({
    //     name: 'Ivan',
    //     age: 22,
    //     location: 'Russia-parasha Kemerovo'
    // }, (err, res) => {
    //     if (err) {
    //         return console.log('Unable to insert user', err)
    //     }
    //     console.log(JSON.stringify(res.ops[0]._id.getTimestamp(), null, 2))
    // })    

    client.close()
})