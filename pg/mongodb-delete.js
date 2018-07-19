const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB: ', err)
    }
    const db = client.db('TodoApp')
    console.log('Connected to MongoDB')

    db.collection('Users').deleteMany({ name: 'Karina' })
        .then(res => console.log('Karinas deleted succesfuly'))
        .catch(err => console.log(err))

    db.collection('Users').findOneAndDelete({ _id: new ObjectID('5b503f59bcb71a372cacd262')})
        .then(res => console.log(res))
        .catch(err => console.log(err))


    // deleteMany
    // db.collection('Todos').deleteMany({ text: 'Do something already' })
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err))

    // deleteOne
    // db.collection('Todos').deleteOne({ text: 'Do something already' })
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err))

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({ completed: false })
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err))

    // client.close()
})