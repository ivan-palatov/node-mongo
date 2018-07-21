const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/todo')
const { User } = require('../models/user')
const {Todos, users, populateTodos, populateUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        const text = 'Test todo text'
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(1)
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('Should return todo doc', done => {
        request(app)
            .get(`/todos/${Todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(Todos[0].text)
            })
            .end(done)

    })
    it('Should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('Should return 404 for non-object IDs', done => {
        request(app)
            .get('/todos/123')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('Should not return todo doc created by other user', done => {
        request(app)
            .get(`/todos/${Todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)

    })
})

describe('DELETE /todos/:id', () => {
    it('Should remove a todo', done => {
        const hexID = Todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth', users[1].tokens[0].token)
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
                        expect(todo).toBeFalsy()
                        done()
                    })
                    .catch(err => done(err))
            })
    })
    it('Should return 404 if todo not found', done => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('Should return 404 if ObjectID is invalid', done => {
        request(app)
            .delete('/todos/123')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done)
    })
    it('Should not remove a todo if not owned', done => {
        const hexID = Todos[0]._id.toHexString()
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.findById(hexID)
                    .then(todo => {
                        expect(todo).toBeTruthy()
                        done()
                    })
                    .catch(err => done(err))
            })
    })
})

describe('PATCH /todos/:id', () => {
    it('Should update todo', done => {
        const hexID = Todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({ completed: true, text: 'Some text' })
            .expect(200)
            .expect(res => {
                const {text, completed, completedAt} = res.body.todo
                expect(text).toBe('Some text')
                expect(completed).toBe(true)
                // expect(completedAt).toBeA('number')
                expect(typeof completedAt).toBe('number')
            })
            .end(done)
    })
    it('Should not update todo if not created', done => {
        const hexID = Todos[0]._id.toHexString()
        request(app)
            .patch(`/todos/${hexID}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({ completed: true, text: 'Some text' })
            .expect(404)
            .end(done)
    })
    it('Should clear completedAt when todo is not completed', done => {
        const hexID = Todos[1]._id.toHexString()
        request(app)
            .patch(`/todos/${hexID}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({ completed: false, text: 'Some text 2' })
            .expect(200)
            .expect(res => {
                const {text, completed, completedAt} = res.body.todo
                expect(text).toBe('Some text 2')
                expect(completed).toBe(false)
                expect(completedAt).toBeFalsy()
            })
            .end(done)
    })
})

describe('GET /users/me', () => {
    it('Should return user if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString())
                expect(res.body.email).toBe(users[0].email)
            })
            .end(done)
    })
    it('Should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })
})

describe('POST /users', () => {
    it('Should create a user', done => {
        const email = 'example@example.com'
        const password = 'somePassword'

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy()
                expect(res.body._id).toBeTruthy()
                expect(res.body.email).toBe(email)
            })
            .end(err => {
                if (err) {
                    return done(err)
                }
                User.findOne({email})
                    .then(user => {
                        expect(user).toBeTruthy()
                        expect(user.password).not.toBe(password)
                        done()
                    })
                    .catch(err => done(err))
            })
    })
    it('Should return validation errors when user invalid', done => {
        const email = 'ivanexample.com'
        const password = '12345'

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done)
    })
    it('Should not create user if email is already in use', done => {
        const email = 'ivan@example.com'
        const password = '1234567da'

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done)
    })
})

describe('POST /users/login', () => {
    it('Should login user and return auth token', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeTruthy()
            })
            .end((err, res) => {
                if (err) {
                    done(err)
                }
                User.findById(users[1]._id)
                    .then(user => {
                        expect(user.toObject().tokens[1]).toMatchObject({access: 'auth', token: res.headers['x-auth']})
                        done()
                    })
                    .catch(err => done(err))
            })
    })
    it('Should reject invalid login', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'jopaKraba'
            })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeFalsy()
            })
            .end((err, res) => {
                if (err) {
                    done(err)
                }
                User.findById(users[1]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(1)
                        done()
                    })
                    .catch(err => done(err))
            })
    })
})

describe('DELETE /users/me/token', () => {
    it('Should remove auth token on logout', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    done(err)
                }
                User.findById(users[0]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0)
                        done()
                    })
                    .catch(err => done(err))
            })
    })
})