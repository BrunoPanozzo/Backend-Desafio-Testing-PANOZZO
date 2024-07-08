const winston = require('winston');

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'blue',
        http: 'green',
        debug: 'white'
    }
}
winston.addColors(customLevelsOptions.colors)


const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        })
    ]
})

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: winston.format.simple()
        })
    ]
})

const logger = process.env.NODE_ENV == 'production'
    ? prodLogger
    : devLogger

/**
 * @type {import('express').RequestHandler}
 */
const useLogger = (req, res, next) => {
    req.logger = logger
    req.logger.http(`Request at endpoint: ${req.url}`)
    next()
}

module.exports = { useLogger }
