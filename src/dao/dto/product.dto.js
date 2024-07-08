class ProductDTO {

    constructor(product) {
        this.id = product._id.toString()
        this.title = product.title
        this.description = product.description
        this.price =  product.price
        this.thumbnail = product.thumbnail    
        this.stock  = product.stock
        this.category= product.category        
        this.quantity = product.quantity
    }

}
module.exports = { ProductDTO }
