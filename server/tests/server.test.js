const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/todo')

const Todos = [
    { _id: new ObjectID(), text: 'First test todo'},
    { _id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 123456}
]

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(Todos)
    }).then(() => done())
})

describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        const text = 'Test todo text'
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find({text})
                    .then(todos => {
                        expect(todos.length).toBe(1)
                        expect(todos[0].text).toBe(text)
                        done()
                    })
                    .catch(err => done(err))
            })
    })

    it('Should not create invalid todo', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(2)
                        done()
                    })
                    .catch(err => done(err))
            })
    })
})

describe('GET /todos', () => {
    it('Should get all todos', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('Should return todo doc', done => {
        request(app)
            .get(`/todos/${Todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(Todos[0].text)
            })
            .end(done)

    })
    it('Should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
    })
    it('Should return 404 for non-object IDs', done => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('Should remove a todo', done => {
        const hexID = Todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexID)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.findById(hexID)
                    .then(todo => {
                        expect(todo).toNotExist()
                        done()
                    })
                    .catch(err => done(err))
            })
    })
    it('Should return 404 if todo not found', done => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
    })
    it('Should return 404 if ObjectID is invalid', done => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('Should update todo', done => {
        const hexID = Todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${hexID}`)
            .send({ completed: true, text: 'Some text' })
            .expect(200)
            .expect(res => {
                const {text, completed, completedAt} = res.body.todo
                expect(text).toBe('Some text')
                expect(completed).toBe(true)
                expect(completedAt).toBeA('number')
            })
            .end(done)
    })
    it('Should clear completedAt when todo is not completed', done => {
        const hexID = Todos[1]._id.toHexString()
        request(app)
            .patch(`/todos/${hexID}`)
            .send({ completed: false, text: 'Some text 2' })
            .expect(200)
            .expect(res => {
                const {text, completed, completedAt} = res.body.todo
                expect(text).toBe('Some text 2')
                expect(completed).toBe(false)
                expect(completedAt).toNotExist()
            })
            .end(done)
    })
})