const config = require("../../config/config")
const { USER, USER_PREMIUM } = require("../../config/policies.constants")
const { hashPassword } = require("../../utils/hashing")
const userModel = require("./models/user.model")

class UserDAO {

    constructor() { }

    async init() { }

    async login(email) {
        try {
            const user = await userModel.findOne(email)
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUsers() {
        try {
            const users = await userModel.find()
            return users.map(u => u.toObject())
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserById(id) {
        try {
            const user = await userModel.findById(id)
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await userModel.findOne({ email })
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserByCartId(cartId) {
        try {
            const user = await userModel.findOne({ cart: cartId })
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async saveUser(user) {
        try {
            const savedUser = await userModel.create(user)
            return savedUser.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async validarPasswordsRepetidos(email, pass) {
        try {
            const user = await userModel.findOne({ email })
            return hashPassword(pass) == user.password
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateUserPassword(email, pass) {
        try {
            const updatedUser = await userModel.updateOne(email, { $set: { password: pass } })
            //return updatedUser.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async changeRole(userId) {
        try {
            const user = await this.getUserById(userId)
            if (user) {
                if (user.rol == USER)
                    user.rol = USER_PREMIUM
                else if (user.rol == USER_PREMIUM)
                    user.rol = USER
                else
                    //en cualquier otro caso, no se puede cambiar el rol
                    return false

                //si llegue a este punto, cambió el rol
                await userModel.updateOne( {_id: userId}, { $set: { rol: user.rol } })
                return true
            }
            else
                return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteUser(userId) {
        try {
            await userModel.deleteOne({ _id: userId })
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

}

module.exports = { UserDAO }