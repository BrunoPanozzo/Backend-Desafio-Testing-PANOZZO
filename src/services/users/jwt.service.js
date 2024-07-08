
const config = require('../../config/config')
const { ADMIN } = require('../../config/policies.constants')
const { isValidPassword } = require('../../utils/hashing')

class JwtServices {

    constructor(dao) {
        this.dao = dao
    }

    async login(email, password) {
        if (!email || !password) {
            // return res.status(400).json({ error: 'Credenciales inválidas!' })
            // return res.sendUserError('Credenciales inválidas!')
            throw new Error('invalid credentials')
        }

        //verifico si es el usuario "ADMIN"
        let user
        if (email === config.ADMIN_USER && password === config.ADMIN_USER_PASS) {
            user = {
                rol: ADMIN,
                firstName: "Coder",
                lastName: "House",
                email: email,
                password: password,
                age: 47,
                cart: null,
                _id: "dflksgd8sfg7sd890fg"
            }
        }
        else {
            // user = await userModel.findOne({ email })
            user = await this.dao.login(email)
            if (!user) {
                // return res.status(400).json({ error: 'El Usuario no existe!' })
                //return res.sendUserError('El Usuario no existe!')
                throw new Error('not found')
            }

            if (!isValidPassword(password, user.password)) {
                // return res.status(401).json({ error: 'Password inválida' })
               //return res.sendUnauthorizedError('Password inválida')
               throw new Error('invalid password')
            }
        }
        return user
    }

}

module.exports = JwtServices
