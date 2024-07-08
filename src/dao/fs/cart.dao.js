const fs = require('fs')

class CartDAO {

    //variables internas
    #carts
    static #lastID_Cart = 0

    //constructor
    constructor() {
        this.#carts = []
        this.path = `${__dirname}/../carts.json`        
    }

    init = async () => {
        this.#carts = await this.getCarts()
        CartDAO.#lastID_Cart = this.#getHigherID()
    }

    //métodos internos

    #getHigherID = () => {
        let higherID = 0
        this.#carts.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada carrito nuevo
    #getNuevoID = () => {
        CartDAO.#lastID_Cart += 1
        return CartDAO.#lastID_Cart;
    }

    //leer el archivo de carritos e inicializar el array de objetos
    async #readCartsFromFile() {
        try {
            const fileCartsContent = await fs.promises.readFile(this.path)
            this.#carts = JSON.parse(fileCartsContent)
        }
        catch (err) {
            return []
        }
    }

    //guardar el array de carritos en un archivo
    async #updateCartsFile() {
        const fileCartsContent = JSON.stringify(this.#carts, null, '\t')
        await fs.promises.writeFile(this.path, fileCartsContent)
    }

    //métodos públicos

    //devolver todo el arreglo de carritos leidos a partir de un archivo de carritos
    async getCarts() {
        try {
            await this.#readCartsFromFile()
            return this.#carts
        }
        catch (err) {
            return []
        }
    }

    //buscar en el arreglo de carritos un carrito con un ID determinado. Caso contrario devolver msje de error
    async getCartById(cartId) {
        try {
            const cart = this.#carts.find(item => item.id === cartId)
            if (cart)
                return cart
            else {
                console.error(`El producto con código "${cartId}" no existe.`)
                return
            }
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //agregar un carrito al arreglo de carritos inicial y al archivo correspondiente
    async addCart(products) {
        try {
            const cart = {
                id: this.#getNuevoID(),
                products
            }
            
            this.#carts.push(cart)
    
            await this.#updateCartsFile()
            return cart
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //agregar un producto al array de productos de un carrito determinado
    async addProductToCart(cartId, prodId, quantity) {
        try {
            const cartIndex = this.#carts.findIndex(item => item.id === cartId)
            const productsFromCart = this.#carts[cartIndex].products
            const productIndex = productsFromCart.findIndex(item => item.id === prodId)
            if (productIndex != -1) {
                //existe el producto en el carrito, actualizo sólo su cantidad
                productsFromCart[productIndex].quantity += quantity
            }
            else {
                //nop existe el producto en el carito, debo crear la entrada completa
                const newProduct = {
                    id: prodId,
                    quantity: quantity
                }
                productsFromCart.push(newProduct)
            }
            await this.#updateCartsFile()
            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async updateCartProducts(cartId, products) {
        try {

        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteCart(cartId) {
        try {

        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteAllProductsFromCart(cartId) {
        try {

        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteProductFromCart(cartId, prodId) {
        try {

        }
        catch (err) {
            console.error(err)
            return false
        }
    }    
    
    getID(cart) {
        return cart.id
    }
    
}

module.exports = { CartDAO } 