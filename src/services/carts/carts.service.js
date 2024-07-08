const ProductsServices = require('../products/products.service')
const TicketsServices = require('../tickets/tickets.service')
const SessionsServices = require('../sessions/sessions.service')

const { ProductDAO, TicketDAO, UserDAO } = require('../../dao/factory')
const { USER_PREMIUM } = require('../../config/policies.constants')

class CartsServices {

    constructor(dao) {
        this.dao = dao

        const productDAO = ProductDAO()
        this.productsService = new ProductsServices(productDAO)

        const ticketDAO = TicketDAO()
        this.ticketsService = new TicketsServices(ticketDAO)

        const userDAO = UserDAO()
        this.sessionsService = new SessionsServices(userDAO)
    }

    async getCarts() {
        return await this.dao.getCarts()
    }

    async getCartById(cartId) {
        return await this.dao.getCartById(cartId)
    }

    async addCart(products) {
        return await this.dao.addCart(products)
    }

    async addProductToCart(cartId, prodId, quantity) {
        const product = await this.productsService.getProductById(prodId)
        if (!product)
            return false
        const productOwner = await this.sessionsService.getUserByEmail(product.owner)
        if (!productOwner)
            return false
        const cartUser = await this.sessionsService.getUserByCartId(cartId)
        if (!cartUser) 
            return false
        //si el dueño del carrito es owner del producto que quiere agregar, y sigue siendo usuario PREMIUM, está prohibido
        if ((cartUser.email == productOwner.email) && (cartUser.rol == USER_PREMIUM))
            return false
        else        
            return await this.dao.addProductToCart(cartId, prodId, quantity)
    }

    async updateCartProducts(cartId, products) {
        return await this.dao.updateCartProducts(cartId, products)
    }

    async deleteCart(cartId) {
        return await this.dao.deleteCart(cartId)
    }

    async deleteAllProductsFromCart(cartId) {
        return await this.dao.deleteAllProductsFromCart(cartId)
    }

    async deleteProductFromCart(cartId, prodId) {
        return await this.dao.deleteProductFromCart(cartId, prodId)
    }

    async purchaseCart(cartId, userEmail) {
        let cart = await this.getCartById(cartId)

        let productFromStock
        let productIdFromCart
        let purchasedAmount = 0

        for (const productFromCart of cart.products) {
            productIdFromCart = this.productsService.getID(productFromCart)
            productFromStock = await this.productsService.getProductById(productIdFromCart)

            if (productFromCart.quantity <= productFromStock.stock) { //hay stock puede comprar el producto 
                //actualizo el stock disponible del producto
                await this.productsService.decrementProductStock(productIdFromCart, productFromCart.quantity)
                purchasedAmount += (productFromCart.quantity * productFromStock.price)

                //elimino del carrito el producto
                this.deleteProductFromCart(cartId, this.productsService.getID(productIdFromCart).toString())
            }
        }

        //verifico si pudo comprar algun producto, en cuyo caso purchasedAmount > 0
        if (purchasedAmount > 0) {
            //creo el nuevo ticket con la compra total/parcial
            const newTicket = {
                purchase_datetime: Date.now(),
                purchaser: userEmail,
                amount: purchasedAmount,
            }
            await this.ticketsService.addTicket(newTicket)
        }
        //retorno el carrito actualizado, vacío si compró todo, o con los IDs de aquellos productos sin stock
        cart = await this.getCartById(cartId)
        return cart.products
    }

    getID(cart) {
        return this.dao.getID(cart)
    }

}

module.exports = CartsServices