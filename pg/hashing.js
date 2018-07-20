const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const pw = '123!abvg'

// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(pw, salt, (err, hash) => {
//         console.log(hash)
//     })
// })

const hashedPw = '$2a$10$Bv0GmP1bMluaJxCF0nGqKu4mnteKOHImz6wKi6BZC0th00OSKpiJ6'

bcrypt.compare(pw, hashedPw, (err, res) => {
    console.log(res)
})

// const data = {
//     id: 10
// }

// const token = jwt.sign(data, '123abc')
// console.log(token)
// const decoded = jwt.verify(token, '123abc')
// console.log(decoded)

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