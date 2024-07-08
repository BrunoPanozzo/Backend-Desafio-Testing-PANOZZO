const { generateToken } = require('../utils/jwt')
const JwtServices = require('../services/users/jwt.service')

const { UserDAO } = require('../dao/factory')
const { UserDTO } = require('../dao/dto/user.dto')

class JwtController {
    
    constructor() {
        const userDAO = UserDAO()
        this.service = new JwtServices(userDAO)     
    }

    #handleError(res, err) {
        if (err.message === 'not found') {
            //return res.status(404).json({ error: 'Not found' })
            res.sendNotFoundError(err)
        }

        if (err.message === 'invalid credentials') {
            //return res.status(400).json({ error: 'Invalid parameters' })
            res.sendUserError(err)
        }

        if (err.message === 'invalid password') {
            res.sendUnauthorizedError(err)
        }
        
        //return res.status(500).json({ error: err })
        return res.sendServerError(err)
    }

    async login(req, res) {
        try {
            const { email, password } = req.body

            const user = await this.service.login(email, password)

            const credentials = { id: user._id.toString(), email: user.email, rol: user.rol }
            const accessToken = generateToken(credentials)

            //le indico al cliente que guarde la cookie
            res.cookie('userToken', accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true })
            //envío el token
            // res.status(200).json({ status: 'success' })
            res.sendSuccess(`Bienvenido ${email}, ud se ha logeado exitosamente.!`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            //return res.sendServerError(err)
            return this.#handleError(res, err)
        }
    }

    private(req, res) {
        try {
            const { email } = req.authUser
            //res.send(`Bienvenido ${email}, este es contenido privado y protegido`)
            res.sendSuccess(`Bienvenido ${email}, este es contenido privado y protegido`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    current(req, res) {
        res.sendSuccess(new UserDTO(req.user))
    }

}

module.exports = JwtController