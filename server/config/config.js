const env = process.env.NODE_ENV || 'development'

if (env === 'development' || env === 'test') {
    const config = require('./config.json')
    const envConfig = config[env]
    Object.keys(envConfig).forEach(key => {
        process.env[key] = envConfig[key]
    })
}
// JWT_SECRET был установлен на heroku c помощью heroku config:set JWT_SECRET=value