const fs = require('fs')

class ProductDAO {
    //variables internas
    #products
    static #lastID_Product = 0

    //constructor
    constructor(pathname) {
        this.#products = []
        this.path = `${__dirname}/../products.json`         
    }

    init = async () => {
        this.#products = await this.getProducts()
        ProductDAO.#lastID_Product = this.#getHigherID()
    }

    //métodos internos
    #getHigherID = () => {
        let higherID = 0
        this.#products.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada producto nuevo
    #getNuevoID = () => {
        ProductDAO.#lastID_Product += 1
        return ProductDAO.#lastID_Product;
    }

    //leer el archivo de productos e inicializar el array de objetos
    async #readProductsFromFile() {
        try {
            const fileProductsContent = await fs.promises.readFile(this.path)
            this.#products = JSON.parse(fileProductsContent)
        }
        catch (err) {
            return []
        }
    }

    //guardar el array de productos en un archivo
    async #updateProductsFile() {
        const fileProductsContent = JSON.stringify(this.#products, null, '\t')
        await fs.promises.writeFile(this.path, fileProductsContent)
    }

    //devolver todo el arreglo de productos leidos a partir de un archivo de productos
    async getProducts(filters) {
        try {
            await this.#readProductsFromFile()
            return this.#products
        }
        catch (err) {
            console.error({ error: err })
            return []
        }
    }

    //buscar en el arreglo de productos un producto con un ID determinado. Caso contrario devolver msje de error
    async getProductById(prodId) {
        try {
            const producto = this.#products.find(item => item.id === prodId)
            if (producto)
                return producto
            else {
                console.error(`El producto con id "${prodId}" no existe.`)
                return
            }
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //buscar en el arreglo de productos un producto con un CODE determinado. Caso contrario devolver msje de error
    getProductByCode = async (prodCode) => {
        try {
            const producto = this.#products.find(item => item.code === prodCode)
            if (producto)
                return producto
            else {
                console.error(`El producto con código "${prodCode}" no existe.`)
                return
            }
        }
        catch (err) {
            console.error(err)
            return null
        }
    }
    
    //agregar, si sus campos de datos son válidos, un producto al arreglo de productos inicial y al archivo correspondiente
    async addProduct(title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        category) {
        try {
            const product = {
                id: this.#getNuevoID(),
                title,
                description,
                price: Number(price),
                thumbnail,
                code,
                stock: Number(stock),
                status,
                category
            }
    
            this.#products.push(product)
    
            await this.#updateProductsFile()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //actualizar, si sus campos modificados son válidos, un producto en el arreglo de productos inicial y en el archivo correspondiente
    async updateProduct(product, prodId) {
        try {
            const existingProductIdx = this.#products.findIndex(item => item.id === prodId)
       
            // actualizar los datos de ese producto en el array
            const productData = { ...this.#products[existingProductIdx], ...product, id: prodId }
            this.#products[existingProductIdx] = productData
    
            await this.#updateProductsFile()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //dado un ID de producto, eliminar el mismo del arreglo de productos y del archivo correspondiente. Caso contrario devolver msje de error
    async deleteProduct(prodId) {
        try {
            const producto = this.#products.find(item => item.id === prodId)
            if (producto) {
                this.#products = this.#products.filter(item => item.id !== prodId)
                await this.#updateProductsFile()
            }
            else {
                console.error(`El producto con código \"${prodId}\" no existe`)
                return
            }
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async decrementProductStock(prodId, quantity) {
        try {
            const existingProductIdx = this.#products.findIndex(item => item.id === prodId)
       
            // actualizar los datos del stock ese producto en el array
            this.#products[existingProductIdx].stock -= quantity
    
            await this.#updateProductsFile()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }
    
    getID(product) {
        return product.id
    }

}

module.exports = { ProductDAO }