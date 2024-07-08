const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../config/config')
const { PUBLIC, SUPER_ADMIN, USER, ADMIN, USER_PREMIUM } = require('../config/policies.constants')

class BaseRouter {

    constructor() {
        this.router = Router()

        //param validations        

        this.router.param('pid', (req, res, next, value) => {
            const isValid = /^[a-z0-9]+$/.test(value)
            if (!isValid)
                return res.status(400).send('Parámetro inválido')
            //return res.sendUserError('Parámetro inválido')                
            req.pid = value
            next()
        })

        this.router.param('cid', (req, res, next, value) => {
            const isValid = /^[a-z0-9]+$/.test(value)
            if (!isValid)
                return res.status(400).send('Parámetro inválido')
            //return res.sendUserError('Parámetro inválido')                 
            req.cid = value
            next()
        })

        this.init()
    }

    getRouter() {
        return this.router
    }

    init() {
        // va implementado en las clases hijas        
    }

    get(path, policies, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.get(path, this.generateCustomResponse, this.handlePolicies(policies), this.customizeCallbacks(callbacks))
    }

    post(path, policies, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.post(path, this.generateCustomResponse, this.handlePolicies(policies), this.customizeCallbacks(callbacks))
    }

    put(path, policies, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.put(path, this.generateCustomResponse, this.handlePolicies(policies), this.customizeCallbacks(callbacks))
    }

    delete(path, policies, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.delete(path, this.generateCustomResponse, this.handlePolicies(policies), this.customizeCallbacks(callbacks))
    }

    customizeCallbacks(callbacks) {
        // para cada callback, se genera un middleware dentro de un try/catch
        //paramas contiene los parametros de cada middleware de la forma (req, res, next)
        return callbacks.map(callback => async (...params) => {
            try {
                //llamo a cada middleware
                // en el 1er argumento viene una referenca, si en el callback se llegase a utilizar "this", o sea esta clase
                // en el 2do argumento, viene un array de parámetros que usa el callback
                await callback.apply(this, params)
            } catch (err) {
                //console.error(err)

                // nuestra función flecha es un middleware también, entonces sabemos que params será [req, res, next]
                const [, res,] = params
                //res.status(500).send(err)
                res.sendServerError(err)
            }
        })
    }

    generateCustomResponse(req, res, next) {
        res.sendSuccess = payload => {
            req.logger.info('Success: ' + payload)
            res.send({ status: 'success', payload })
        }
        res.sendCreated = payload => {
            req.logger.info('Success: ' + payload)
            res.status(201).send({ status: 'success', payload })
        }
        res.sendUserError = error => {
            req.logger.error('Error: ' + error)
            res.status(400).send({ status: 'error', error })
        }
        res.sendUnauthorizedError = error => {
            req.logger.warning('Unauthorization error: ' + error)
            res.status(401).send({ status: 'error', error })
        }
        res.sendNotFoundError = error => {
            req.logger.error('Not found error: ' + error)
            res.status(404).send({ status: 'error', error })
        }
        res.sendServerError = error => {
            req.logger.fatal('Server error: ' + error)
            res.status(500).send({ status: 'error', error })
        }

        next()
    }

    handlePolicies(policies) {
        return (req, res, next) => {
            if (policies.includes(PUBLIC)) //cualquiera puede entrar
                return next()

            //habilito el siguiente caso de uso para poder probar desde POSTMAN y no tener que iniciar sesión
            if (policies.includes(USER) ||
                policies.includes(USER_PREMIUM) ||
                policies.includes(ADMIN) ||
                policies.includes(SUPER_ADMIN))
                return next()
            //

            const authHeader = req.headers.authorization
            if (!authHeader) {
                // return res.status(401).send({ status: 'error', error: 'Unauthorized' })
                return res.sendUnauthorizedError('NO autorizado.')
            }

            const [, token] = authHeader.split(' ')
            jwt.verify(token, SECRET, (err, payload) => {
                if (err) {
                    return res.status(403).send({ status: 'error', error: 'Token inválido.' })
                }

                let userRol = payload.rol.toUpperCase()
                if (!policies.includes(userRol)) {
                    return res.status(403).send({ status: 'error', error: 'No posee los permisos necesarios.' })
                }

                req.user = payload
                next()
            })
        }
    }

}

module.exports = BaseRouter