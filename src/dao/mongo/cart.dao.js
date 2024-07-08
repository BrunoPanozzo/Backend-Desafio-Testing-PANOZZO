const cartModel = require("./models/cart.model")

class CartDAO {

    constructor() { }

    init() { }

    async getCarts() {
        try {
            const carts = await cartModel.find()
            return carts.map(d => d.toObject())
        }
        catch (err) {
            return []
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await cartModel.findOne({ _id: cartId }).populate('products._id')
            return cart?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    generarIdUnico() {
        return new Date().getTime().toString()
    }

    async addCart(products) {
        try {
            let newCart = await cartModel.create({
                id: this.generarIdUnico(),
                products
            })
            return newCart.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async addProductToCart(cartId, prodId, quantity) {
        try {
            //obtengo el carrito
            const cart = await this.getCartById(cartId)
            if (!cart) return false

            //obtengo los productos del carrito        
            const productsFromCart = cart.products
            const productIndex = productsFromCart.findIndex(item => item._id._id.toString() === prodId)
            if (productIndex != -1) {
                //existe el producto en el carrito, actualizo sólo su cantidad
                productsFromCart[productIndex].quantity += quantity
            }
            else { //no existe, debo crearlo
                let newProduct = {
                    _id: prodId,
                    quantity: quantity
                }
                productsFromCart.push(newProduct);
            }
            await cartModel.updateOne({ _id: cartId }, cart)
            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async updateCartProducts(cartId, products) {
        try {
            //obtengo el carrito
            const cart = await this.getCartById(cartId)
            if (!cart) return null

            cart.products = products

            await cartModel.updateOne({ _id: cartId }, cart)
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteCart(cartId) {
        try {
            await cartModel.deleteOne({ _id: cartId })
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteAllProductsFromCart(cartId) {
        try {
            //obtengo el carrito
            const cart = await this.getCartById(cartId)
            if (!cart) return null

            cart.products = []
            await cartModel.updateOne({ _id: cartId }, cart)
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteProductFromCart(cartId, prodId) {
        try {
            //obtengo el carrito
            const cart = await this.getCartById(cartId)
            if (!cart) return false

            //obtengo los productos del carrito        
            const productsFromCart = cart.products
            const productIndex = productsFromCart.findIndex(item => item._id._id.toString() === prodId)
            if (productIndex != -1) {
                //existe el producto en el carrito, puedo eliminarlo
                productsFromCart.splice(productIndex, 1)
                await cartModel.updateOne({ _id: cartId }, cart)
                return true
            }
            else {
                //no existe el producto en el carito, imposible de eliminar
                return false
            }
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    getID(cart) {
        return cart._id
    }

}

module.exports = { CartDAO } 