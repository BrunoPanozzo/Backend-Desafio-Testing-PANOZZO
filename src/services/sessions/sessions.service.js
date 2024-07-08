const config = require("../../config/config")
const { ADMIN } = require("../../config/policies.constants")
const { CartDAO } = require('../../dao/factory')
const cartDAO = CartDAO()

class SessionsServices {
    
    constructor(dao) {
        this.dao = dao
    }    

    async validarPasswordsRepetidos(email, password) {
        return await this.dao.validarPasswordsRepetidos(email, password)
    }

    async changeRole(userId) {
        return await this.dao.changeRole(userId)
    }
    
    async getUserById(userId)   {
        return await this.dao.getUserById(userId)
    }
    
    async getUserByEmail(email)   {
        if (email === config.ADMIN_USER) {
            let logedUser = {
                rol: ADMIN,
                firstName: "Coder",
                lastName: "House",
                email: config.ADMIN_USER,
                password: config.ADMIN_USER_PASS,
                age: 47,
                _id: "dflksgd8sfg7sd890fg",
                cart: null
            }
            return logedUser
        }
        return await this.dao.getUserByEmail(email)
    }
    
    async getUserByCartId(cartId)   {
        return await this.dao.getUserByCartId(cartId)
    }
}

module.exports = SessionsServices