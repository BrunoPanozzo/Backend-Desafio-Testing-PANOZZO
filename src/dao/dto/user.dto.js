class UserDTO {

    constructor(user) {
        this.id = user._id.toString()
        this.firstName = user.firstName
        this.lastName = user.lastName,
        this.email = user.email
        this.age = user.age
        this.rol = user.rol
        this.cart = user.cart
    }
        
}
module.exports = { UserDTO }