const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB: ', err)
    }
    const db = client.db('TodoApp')
    console.log('Connected to MongoDB')

    // db.collection('Todos').findOneAndUpdate({ _id: new ObjectID('5b503dc7bcb71a372cacd207') }, 
        // {
        //     $set: {
        //         completed: true
        //     }
        // }, { returnOriginal: false })
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err))

    db.collection('Users').findOneAndUpdate({ _id: new ObjectID('5b4f82a3d4e8461a34b87eda') },
        {
            $set: {name: 'Jenny'},
            $inc: {age: -2}
        }, { returnOriginal: false })
        .then(res => console.log(res))
        .catch(err => console.log(err))

    // client.close()
})