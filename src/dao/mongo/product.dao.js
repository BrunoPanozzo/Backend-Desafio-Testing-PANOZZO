const productModel = require("./models/product.model")

class ProductDAO {

    constructor() { }

    init() {  }

    async getProducts(filters) {
        try {
            let filteredProducts = await productModel.find()

            //busqueda general, sin filtros, devuelvo todos los productos en una sola página
            if (JSON.stringify(filters) === '{}') {
                filteredProducts = await productModel.paginate({}, { limit: filteredProducts.length })
                // return filteredProducts.docs.map(d => d.toObject({ virtuals: true }))                
                return filteredProducts
            }

            //busqueda general, sin filtros, solo esta avanzando o retrocediendo por las paginas
            let { page, ...restOfFilters } = filters
            if (page && JSON.stringify(restOfFilters) === '{}') {
                filteredProducts = await productModel.paginate({}, { page: page, lean: true })
                // return filteredProducts.docs.map(d => d.toObject({ virtuals: true }))
                return filteredProducts
            }

            if (!page) page = 1
            let { limit, category, availability, sort } = { limit: 10, page: page, availability: 1, sort: 'asc', ...filters }

            if (availability == 1) {
                if (category)
                    filteredProducts = await productModel.paginate({ category: category, stock: { $gt: 0 } }, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                    filteredProducts = await productModel.paginate({ stock: { $gt: 0 } }, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }
            else {
                if (category)
                    filteredProducts = await productModel.paginate({ category: category, stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                    filteredProducts = await productModel.paginate({ stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }

            return filteredProducts
            // return filteredProducts.map(d => d.toObject({ virtuals: true }))
        }
        catch (err) {
            console.error({ error: err })
            return []
        }
    }

    async getProductById(prodId) {
        try {
            const producto = await productModel.findOne({ _id: prodId })
            return producto?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //buscar en el arreglo de productos un producto con un CODE determinado. Caso contrario devolver msje de error
    getProductByCode = async (prodCode) => {
        try {
            const producto = await productModel.findOne({ code: prodCode })
            return producto?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async addProduct(title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        category,
        owner) {
        try {
            let newProduct = await productModel.create({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category,
                owner
            })
            return newProduct.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateProduct(productUpdated, prodId) {
        try {
            await productModel.updateOne({ _id: prodId }, productUpdated)
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteProduct(prodId) {
        try {
            await productModel.deleteOne({ _id: prodId })
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async decrementProductStock(producto, quantity) {
        try {
            const prodId = this.getID(producto)
            const prod = await this.getProductById(prodId)
            await productModel.updateOne({ _id: prodId }, { $set: { stock: prod.stock - quantity } })
        }
        catch (err) {
            console.error("err")
            return null
        }
    }

    getID(product) {
        return product._id
    }

}

module.exports = { ProductDAO }