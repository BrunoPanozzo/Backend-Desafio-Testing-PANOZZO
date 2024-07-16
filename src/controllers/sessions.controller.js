const { UserDTO } = require("../dao/dto/user.dto")
const { UserDAO } = require("../dao/factory")
const { CustomError } = require("../services/errors/CustomError")
const { ErrorCodes } = require("../services/errors/errorCodes")
const SessionsServices = require('../services/sessions/sessions.service')
const { generateInvalidCredentialsError } = require("../services/users/errors")
const transport = require("../utils/transport")
const { SECRET, GMAIL_ACCOUNT } = require('../config/config')
const jwt = require('jsonwebtoken')

class SessionsController {

    constructor() {
        const userDAO = UserDAO()
        this.sessionsService = new SessionsServices(userDAO)
    }

    login(req, res) {
        try {
            const email = req.body.email
            if (!req.user) {
                //return res.status(400).send({ status: 'error', error: 'Credenciales inválidas!' })
                //return res.sendUserError('Credenciales inválidas!')
                throw CustomError.createError({
                    name: 'InvalidCredentials',
                    cause: generateInvalidCredentialsError(email),
                    message: 'Error trying to login a user',
                    code: ErrorCodes.INVALID_CREDENTIALS
                })
            }
            req.session.user = new UserDTO(req.user)

            // no es necesario validar el login aquí, ya lo hace passport!
            //return res.redirect('/products')
            //return res.sendSuccess(`El usuario '${req.user.email}' se logueó exitosamente.`)
            return res.sendSuccess(req.user._id)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    failLogin(req, res) {
        //res.send({ status: 'error', message: 'Login erróneo!' })
        //res.sendUnauthorizedError('Login erróneo!')
        throw CustomError.createError({
            name: 'InvalidCredentials',
            cause: generateInvalidCredentialsError(email),
            message: 'Error trying to login a user',
            code: ErrorCodes.INVALID_CREDENTIALS
        })
    }

    async resetPassword(req, res) {
        try {
            const token = req.params.token
            const { email, password } = req.body

            if (!token) {
                req.logger.info('Token no proporcionado')
            }

            jwt.verify(token, SECRET, async (err, decoded) => {
                if (err) {
                    req.logger.info('El link de recupero de contraseña no es válido o ha expirado.')
                    return res.redirect('/forget_password')
                }

                const passwordsEquals = await this.sessionsService.validarPasswordsRepetidos(email, password)
                if (!passwordsEquals) {
                    req.logger.info('No se pudo actualizar la contraseña porque ingresó la contraseña actual.')
                    return res.redirect('/login')
                }

                req.logger.info('Contraseña actualizada!!')
                res.redirect('/login')
            })
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async forgetPassword(req, res) {
        try {
            const { email } = req.body
            if (email) {
                try {
                    const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' })
                    const resetLink = `http://localhost:8080/reset_password/${email}/token/${token}`
                    await transport.sendMail({
                        from: GMAIL_ACCOUNT,
                        to: `${email}`,
                        subject: 'Solicitud de cambio de contraseña',
                        html: `<div>
                    <h1>Recupero de contraseña</h1>
                    <h2>HOLA "${email}"</h2>
                    <p>Para realizar el cambio de contraseña hacé click </p> <a href="${resetLink}">aquí</a>
                    <h4>Tenga en cuenta que el link expirará en una hora!!</h4>                        
                    </div>`,
                        attachments: []
                    })

                    // Si el envío de correo fue exitoso
                    res.sendSuccess('Email enviado con éxito!!')
                }
                catch (err) {
                    res.sendServerError(err)
                }
            }
            else
                //req.logger.info('Falta ingresar el email!!')
                throw CustomError.createError({
                    name: 'InvalidEmail',
                    cause: generateInvalidUserEmail(email),
                    message: 'Falta ingresar el email!!',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    failResetPassword(req, res) {
        //res.send({ status: 'error', message: 'No se pudo resetear la password!' })
        res.sendServerError('No se pudo resetear la password!')
    }

    register(req, res) {
        try {
            //console.log('usuario: ', req.user)
            // no es necesario registrar el usuario aquí, ya lo hacemos en la estrategia!
            //res.redirect('/login')
            res.sendSuccess(`El usuario '${req.user.email}' se registró exitosamente.`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    failRegister(req, res) {
        //res.send({ status: 'error', message: 'Registración errónea.!' })
        res.sendServerError('Registración errónea.!')
    }

    githubCallback(req, res) {
        try {
            req.session.user = new UserDTO(req.user)

            // no es necesario validar el login aquí, ya lo hace passport!
            return res.redirect('/products')
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    googleCallback(req, res) {
        try {
            req.session.user = new UserDTO(req.user)

            // no es necesario validar el login aquí, ya lo hace passport!
            return res.redirect('/products')
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    logout(req, res) {
        try {
            req.session.destroy(_ => {
                res.redirect('/')
            })
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    current(req, res) {
        try {
            if (!req.user)
                //return res.status(400).send({ status: 'error', error: 'No existe un usuario logeado!' })
                //return res.sendUserError('No existe un usuario logeado!')
                throw CustomError.createError({
                    name: 'UnauthorizedUser',
                    cause: generateInvalidCredentialsError(email),
                    message: 'User is not authorized',
                    code: ErrorCodes.UNAUTHORIZED_ERROR
                })

            req.session.user = new UserDTO(req.user)

            // no es necesario validar el login aquí, ya lo hace passport!
            return res.redirect('/profile')
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async changeRole(req, res) {
        try {
            const userId = req.params.uid
            const user = await this.sessionsService.changeRole(userId)
            if (!user) {
                return user === false
                    ? res.sendNotFoundError(`El usuario con código '${userId}' no existe.`)
                    : res.sendServerError(`No se pudo cambiar el rol del usuario '${userId}'`)
            }

            res.sendSuccess(`El usuario '${userId}' cambió su rol.`)
        }
        catch (err) {
            res.sendServerError(err)
        }

    }

}

module.exports = SessionsController