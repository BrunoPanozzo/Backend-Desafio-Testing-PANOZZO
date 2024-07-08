const CartsServices = require('../services/carts/carts.service')

const { CartDAO } = require('../dao/factory')
const { CartDTO } = require('../dao/dto/cart.dto')
const { CustomError } = require('../services/errors/CustomError')
const { ErrorCodes } = require('../services/errors/errorCodes')

class CartsController {

    constructor() {
        const cartsDAO = CartDAO()
        this.cartsService = new CartsServices(cartsDAO)
    }

    async getCarts(req, res) {
        try {
            const carts = await this.cartsService.getCarts()
            const cartsDTOs = carts.map(cart => new CartDTO(cart))

            // HTTP 200 OK
            // res.status(200).json(carts)
            res.sendSuccess(cartsDTOs)
            return
        }
        catch (err) {
            //console.log(err)
            // return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async getCartById(req, res) {
        try {
            let cartId = req.cid;

            let cartById = await this.cartsService.getCartById(cartId)
            if (!cartById) {
                return cartById === false
                    // HTTP 404 => el ID es válido, pero no se encontró ese carrito
                    // return res.status(404).json(`El carrito con código '${cartId}' no existe.`)
                    ? res.sendNotFoundError(`El carrito con código '${cartId}' no existe.`)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }

            // HTTP 200 OK => se encontró el carrito
            // res.status(200).json(cartById)
            res.sendSuccess(new CartDTO(cartById))
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async addCart(req, res) {
        try {
            const { products } = req.body

            const cart = await this.cartsService.addCart(products)

            if (!cart) return res.sendServerError('No se pudo crear el carrito')

            // HTTP 201 OK => carrito creado exitosamente
            // res.status(201).json(`Carrito creado exitosamente.`)
            res.sendCreated(`Carrito creado exitosamente.`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async addProductToCart(req, res) {
        try {
            let cartId = req.cid
            let prodId = req.pid
            let quantity = +req.body.quantity
           
            //console.log(quantity)
            
            const result = await this.cartsService.addProductToCart(cartId, prodId, quantity)
            if (result)
                // HTTP 200 OK => carrito modificado exitosamente
                // res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${prodId} al carrito con ID ${cartId}.`)
                res.sendSuccess(`Se agregaron ${quantity} producto/s con ID ${prodId} al carrito con ID ${cartId}.`)
            else
                //HTTP 400 Bad Request
                // res.status(400).json({ error: "El servidor no pudo entender la solicitud debido a una sintaxis incorrecta." })
                //res.sendUserError("El servidor no pudo entender la solicitud debido a una sintaxis incorrecta.")
                throw CustomError.createError({
                    name: 'InvalidAction',
                    cause: `No se pudo agregar el producto '${prodId}' al carrito '${cartId}'.`,
                    message: 'Error trying to add a product to a cart',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async updateCartProducts(req, res) {
        try {
            let cartId = req.cid
            const { products } = req.body

            await this.cartsService.updateCartProducts(cartId, products)

            // HTTP 200 OK => se encontró el carrito
            // res.status(200).json(`Los productos del carrito con ID ${cartId} se actualizaron exitosamente.`)
            res.sendSuccess(`Los productos del carrito con ID ${cartId} se actualizaron exitosamente.`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async deleteCart(req, res) {
        try {
            let cartId = req.cid

            await this.cartsService.deleteCart(cartId)
            // HTTP 200 OK
            // res.status(200).json(`Carrito borrado exitosamente.`)
            res.sendSuccess(`Carrito borrado exitosamente.`)

            // await this.cartsService.deleteAllProductsFromCart(cartId)
            // res.sendSuccess(`Se eliminaron todos los productos del carrito con ID ${cartId}.`)                
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            let cartId = req.cid
            let prodId = req.pid

            const result = await this.cartsService.deleteProductFromCart(cartId, prodId)

            if (result)
                // HTTP 200 OK => carrito modificado exitosamente
                // res.status(200).json(`Se eliminó el producto con ID ${prodId} del carrito con ID ${cartId}.`)
                res.sendSuccess(`Se eliminó el producto con ID ${prodId} del carrito con ID ${cartId}.`)
            else {
                //HTTP 400 Bad Request
                // res.status(400).json({ error: "El servidor no pudo entender la solicitud debido a una sintaxis incorrecta." })
                res.sendUserError("El servidor no pudo entender la solicitud debido a una sintaxis incorrecta.")
            }
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    async purchaseCart(req, res) {
        try {
            let cartId = req.cid
            const userEmail = req.session.user.email;

            let remainingCart = await this.cartsService.purchaseCart(cartId, userEmail)
            if (remainingCart.length == 0)
                res.sendSuccess(`Se realizó con éxito la compra total del carrito con ID ${cartId}.`)
            else//: res.sendSuccess(`Se realizó con éxito la compra parcial del carrito con ID ${cartId}.`) 
                res.sendSuccess(remainingCart)
        }
        catch (err) {
            //console.error(err)
            return res.sendServerError(`El servidor no pudo completar el proceso de compra del carrito con ID ${cartId}, reintente en unos segundos...`)
        }
    }


}

module.exports = CartsController