const { esPositivo } = require('../middlewares/product.middleware')
const { CustomError } = require('../services/errors/CustomError')
const { ErrorCodes } = require('../services/errors/errorCodes')
const { generateInvalidProductDataError } = require('../services/products/error')

const CartsServices = require('../services/carts/carts.service')
const ProductsServices = require('../services/products/products.service')

const { CartDAO, ProductDAO } = require('../dao/factory')

const productDAO = ProductDAO()
const productsServices = new ProductsServices(productDAO)
const cartDAO = CartDAO()
const cartsServices = new CartsServices(cartDAO)

module.exports = {
    validateNewCart: async (req, res, next) => {
        try {
            const { products } = req.body

            //valido que cada producto que quiero agregar a un carrito exista y que su quantity sea un valor positivo
            products.forEach(async producto => {
                const prod = await productsServices.getProductById(producto._id)
                if (!prod) {
                    return prod === false
                        // HTTP 404 => el ID es válido, pero no se encontró ese producto
                        //return res.status(404).json(`El producto con código '${prodId}' no existe.`)
                        ? res.status(404).json(`No se puede crear el carrito porque no existe el producto con ID '${producto._id}'.`)
                        : res.status(500).json({ message: 'Something went wrong!' })
                }

                //valido además que su campo quantity sea un valor positivo
                if (!esPositivo(producto.quantity)) {
                    //res.status(400).json({ error: `El valor de quantity del producto con ID '${producto._id}' es inválido.` })
                    //return
                    throw CustomError.createError({
                        name: 'InvalidCartData',
                        cause: `El valor de quantity del producto con ID '${producto._id}' es inválido.`,
                        message: 'Error trying to create a new cart',
                        code: ErrorCodes.INVALID_TYPES_ERROR
                    })
                }
            })
            //exito, continuo al endpoint
            return next()
        }
        catch (err) {
            res.status(400).json({ error: `No se puede crear el carrito.` })
        }
    },
    validateCart: async (req, res, next) => {
        try {
            let cartId = req.params.cid;

            const cart = await cartsServices.getCartById(cartId)
            if (!cart) {
                //res.status(400).json({ error: `No existe el carrito con ID '${cartId}'.` })
                //return
                throw CustomError.createError({
                    name: 'CartNotFound',
                    cause: `No existe el carrito con ID '${cartId}'.`,
                    message: 'Error trying to get a cart',
                    code: ErrorCodes.NOT_FOUND
                })
            }
            //exito, continuo al endpoint
            return next()
        }
        catch (err) {
            //res.status(400).json({ error: `No existe el carrito con ID '${req.params.cid}'.` })
            throw CustomError.createError({
                name: 'CartNotFound',
                cause: `No existe el carrito con ID '${req.params.cid}'.`,
                message: 'Error trying to get a cart',
                code: ErrorCodes.NOT_FOUND
            })
        }
    }
}
