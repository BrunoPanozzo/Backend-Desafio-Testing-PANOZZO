
const { ProductDAO } = require('../dao/factory')
const { CustomError } = require('../services/errors/CustomError')
const { ErrorCodes } = require('../services/errors/errorCodes')
const { generateInvalidProductDataError } = require('../services/products/error')
const ProductsServices = require('../services/products/products.service')

const productDAO = ProductDAO()
const productsServices = new ProductsServices(productDAO)

//validar un string permitiendo solo números y letras
const soloLetrasYNumeros = (cadena) => {
    return (/^[a-zA-Z0-9]+$/.test(cadena))
}

//validar permitiendo solo números positivos
const soloNumerosPositivos = (cadena) => {
    return ((/^[0-9]+$/.test(cadena)) && (+cadena > 0))
}

//validar permitiendo solo números positivos, más el cero
const soloNumerosPositivos_Y_Cero = (cadena) => {
    return ((/^[0-9]+$/.test(cadena)) && (+cadena >= 0))
}

//validar que un numero sea estrictamente positivo, incluido el 0
const esPositivo = (cadena) => {
    return soloNumerosPositivos_Y_Cero(cadena)
}

//validar los campos de un "objeto" producto
const validateProductData = (req, title, description, price, thumbnail, code, stock, status, category) => {
    //validar que el campo "title" no esté vacío        
    if (title.trim().length <= 0) {
        //console.error("El campo \"title\" es inválido")
        req.logger.error("El campo \"title\" es inválido")
        return false
    }
    //validar que el campo "description" no esté vacío
    if (description.trim().length <= 0) {
        //console.error("El campo \"description\" es inválido")
        req.logger.error("El campo \"description\" es inválido")
        return false
    }
    //validar que el campo "price" contenga sólo números
    if ((!soloNumerosPositivos(price)) || (typeof price != "number")) {
        //console.error("El campo \"price\" no es un número positivo")
        req.logger.error("El campo \"price\" no es un número positivo")
        return false
    }
    //el campo "thumbnail" puede estar vacío, por eso queda comentado la validacion anterior, solo
    //verificar que es un arreglo de strings
    if (!Array.isArray(thumbnail)) {
        req.logger.error("El campo \"thumbnail\" no respeta el formato esperado.")
        return false
    }
    else {
        let pos = -1
        do {
            pos++
        } while ((pos < thumbnail.length) && (typeof thumbnail[pos] == "string"));
        if (pos != thumbnail.length) {
            req.logger.error("El campo \"thumbnail\" no respeta el formato esperado.")
            return false
        }
    }
    //validar que el campo "status" sea booleano
    if (typeof status != "boolean") {
        //console.error("El campo \"status\" no es booleano")
        req.logger.error("El campo \"status\" no es booleano")
        return false
    }
    //validar que el campo "category"  no esté vacío
    if (category.trim().length <= 0) {
        //console.error("El campo \"category\" es inválido")
        req.logger.error("El campo \"category\" es inválido")
        return false
    }
    //validar que el campo "code" contenga sólo números y letras
    const codeAValidar = code.trim()
    if ((codeAValidar.length <= 0) || (!soloLetrasYNumeros(codeAValidar))) {
        //console.error("El campo \"code\" es inválido")
        req.logger.error("El campo \"code\" es inválido")
        return false
    }
    //validar que el campo "stock" contenga sólo números
    if ((!soloNumerosPositivos_Y_Cero(stock)) || (typeof stock != "number")) {
        //console.error("El campo \"stock\" no es un número")
        req.logger.error("El campo \"stock\" no es un número")
        return false
    }
    return true
}

const validateNewProduct = async (req, res, next) => {
    const product = req.body

    product.thumbnail = [product.thumbnail]
    product.status = JSON.parse(product.status)

    product.price = +product.price
    product.stock = +product.stock

    const title = product.title
    const description = product.description
    const price = product.price
    const thumbnail = product.thumbnail
    const code = product.code
    const stock = product.stock
    const status = product.status
    const category = product.category

    try {
        if (validateProductData(req, title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category)) {
            //debo verificar también que el campo "code" no se repita
            const prod = await productsServices.getProductByCode(product.code)
            if (prod) {
                let msjeError = `No se permite agregar el producto con código '${product.code}' porque ya existe.`
                // HTTP 400 => code repetido
                //res.status(400).json({ error: msjeError })
                //return
                throw CustomError.createError({
                    name: 'InvalidProductData',
                    cause: `No se permite agregar el producto con código '${product.code}' porque ya existe.`,
                    message: 'Error trying to create a new product',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
            }
            //exito, continuo al endpoint
            return next()
        }

        // HTTP 400 => producto con valores inválidos
        //res.status(400).json({ error: "El producto que se quiere agregar posee algún campo inválido." })

        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateInvalidProductDataError({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
    catch (err) {
        //res.status(400).json({ error: "El producto que se quiere agregar posee algún campo inválido." })        
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateInvalidProductDataError({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
}

const validateUpdateProduct = async (req, res, next) => {

    const prodId = req.params.pid
    const product = req.body

    const title = product.title
    const description = product.description
    const price = product.price
    const thumbnail = product.thumbnail
    const code = product.code
    const stock = product.stock
    const status = product.status
    const category = product.category

    try {
        //primero debo verificar que el producto exista en mi array de todos los productos
        const prod = await productsServices.getProductById(prodId)
        if (!prod) {
            return prod === false
                // HTTP 404 => el ID es válido, pero no se encontró ese producto
                ? res.status(404).json(`El producto con ID '${prodId}' no se puede modificar porque no existe.`)
                : res.status(500).jsonServerError({ message: 'Something went wrong!' })
        }

        if (validateProductData(req, title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category)) {
            //verifico que el campo "code", que puede venir modificado, no sea igual al campo code de otros productos ya existentes
            let allProducts = await productsServices.getProducts(req.query)
            let producto = allProducts.docs.find(element => ((element.code === product.code) && (element._id != prodId)))
            if (producto) {
                let msjeError = `No se permite modificar el producto con código '${product.code}' porque ya existe.`
                // HTTP 400 => code repetido
                //res.status(400).json({ error: msjeError })
                //return
                throw CustomError.createError({
                    name: 'InvalidProductData',
                    cause: `No se permite modificar el producto con código '${product.code}' porque ya existe.`,
                    message: 'Error trying to modify a product',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
            }

            //exito, continuo al endpoint
            return next()
        }
        // HTTP 400 => producto con valores inválidos
        //res.status(400).json({ error: "El producto que se quiere modificar posee algún campo inválido." })
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateInvalidProductDataError({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category
            }),
            message: 'Error trying to modify a product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
    catch (err) {
        //res.status(400).json({ error: "El producto que se quiere modificar posee algún campo inválido." })
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateInvalidProductDataError({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category
            }),
            message: 'Error trying to modify a product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
}

const validateProduct = async (req, res, next) => {
    try {
        let prodId = req.params.pid;

        //primero debo verificar que el producto exista en mi array de todos los productos
        const prod = await productsServices.getProductById(prodId)
        if (!prod) {
            // HTTP 404 => no existe el producto
            //res.status(404).json({ error: `El producto con ID '${prodId}' no existe.` })
            //return
            throw CustomError.createError({
                name: 'ProductNotFound',
                cause: `El producto con ID '${prodId}' no existe.`,
                message: 'Error trying to get a product',
                code: ErrorCodes.NOT_FOUND
            })
        }

        //exito, continuo al endpoint
        return next()
    }
    catch (err) {
        //res.status(404).json({ error: `El producto con ID '${req.params.pid}' no existe.` })
        throw CustomError.createError({
            name: 'ProductNotFound',
            cause: `El producto con ID '${req.params.pid}' no existe.`,
            message: 'Error trying to get a product',
            code: ErrorCodes.NOT_FOUND
        })
    }
}

module.exports = { validateNewProduct, validateUpdateProduct, validateProduct, esPositivo }