const { ProductDTO } = require("./product.dto")

class CartDTO {
    
    constructor(cart) {
        this.id = cart._id.toString()
        this.products = cart.products.map(product => new ProductDTO(product))
    }

}

module.exports = { CartDTO }