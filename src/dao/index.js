// const { ProductDAO } = require("./fs/product.dao");
// const { CartDAO } = require("./fs/cart.dao");
// const { UserDAO } = require("./fs/user.dao");

const { ProductDAO } = require("./mongo/product.dao");
const { CartDAO } = require("./mongo/cart.dao");
const { UserDAO } = require("./mongo/user.dao");

module.exports = {
    Product: ProductDAO,
    Cart: CartDAO,
    User: UserDAO
}