const MongoStore = require('connect-mongo')
const session = require('express-session')
const { DBNAME, MONGO_URL } = require('../config/config')

const storage = MongoStore.create({
    dbName: DBNAME,
    mongoUrl: MONGO_URL,
    ttl: 60
})

module.exports = session({
    store: storage,
    secret: 'adasd127812be',
    resave: true,
    saveUninitialized: true
})