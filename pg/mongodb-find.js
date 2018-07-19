// const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB: ', err)
    }
    const db = client.db('TodoApp')
    console.log('Connected to MongoDB')

    db.collection('Todos')
        .find({
            _id: new ObjectID('5b4f7f01a23ebe1b94831cd4') 
        })
        .toArray()
        .then(docs => {
            console.log('Todos')
            console.log(JSON.stringify(docs, null, 2))
        }, err => {
            console.log('Unable to fetch Todos', err)
        })

    db.collection('Todos')
        .find()
        .count()
        .then(count => {
            console.log(`Todos count: ${count}`)
        }, err => {
            console.log('Unable to fetch Todos', err)
        })

    db.collection('Users')
        .find({ name: 'Ivan' })
        .toArray()
        .then(docs => {
            console.log('Users with name Ivan')
            console.log(JSON.stringify(docs, null, 2))
        })
        .catch(err => console.log('Cant fetch users: ', err))

    client.close()
})