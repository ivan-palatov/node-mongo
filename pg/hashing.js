const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')

const data = {
    id: 10
}

const token = jwt.sign(data, '123abc')
console.log(token)
const decoded = jwt.verify(token, '123abc')
console.log(decoded)

// const message = "Some string"
// const sha = SHA256(message).toString()
// console.log(sha)

// const data = {
//     id: 22
// }

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'some salt').toString()
// }

// // Man in the middle (hacker 3000 lul)
// // token.data.id = 5
// // token.hash = SHA256(JSON.stringify(token.data)).toString()

// const resultHash = SHA256(JSON.stringify(token.data) + 'some salt').toString()
// if (resultHash === token.hash) {
//     console.log('Data was not changed')
// } else {
//     console.log('Data was changed')
// }