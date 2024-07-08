
const { ProductDAO: ProductMongoDAO } = require("./mongo/product.dao");
const { CartDAO: CartMongoDAO } = require("./mongo/cart.dao");
const { UserDAO: UserMongoDAO } = require("./mongo/user.dao");
const { TicketDAO: TicketMongoDAO } = require("./mongo/ticket.dao");

const { ProductDAO: ProductFSDAO } = require("./fs/product.dao");
const { CartDAO: CartFSDAO } = require("./fs/cart.dao");
const { UserDAO: UserFSDAO } = require("./fs/user.dao");
const { TicketDAO: TicketFSDAO } = require("./fs/ticket.dao");

const { PERSISTENCE } = require('../config/config')

// switch (PERSISTENCE) {
//     case "MONGO":
//         Product= ProductMongoDAO,
//         Cart= CartMongoDAO,
//         User= UserMongoDAO
//         break;

//     case "FILE":
//         Product= ProductFSDAO,
//         Cart= CartFSDAO,
//         User= UserFSDAO
//         break;
// }  
//
//module.exports = { Product, Cart, User }

const ProductDAO = () => {
    const productDAO = PERSISTENCE == "MONGO" ? new ProductMongoDAO() : new ProductFSDAO()
    productDAO.init()
    return productDAO
}
const CartDAO = () => {
    const cartDAO = PERSISTENCE == "MONGO" ? new CartMongoDAO() : new CartFSDAO()
    cartDAO.init()
    return cartDAO
}
const UserDAO = () => {
    const userDAO = PERSISTENCE == "MONGO" ? new UserMongoDAO() : new UserFSDAO()
    userDAO.init()
    return userDAO
}
const TicketDAO = () => {
    const ticketDAO = PERSISTENCE == "MONGO" ? new TicketMongoDAO() : new TicketFSDAO()
    ticketDAO.init()
    return ticketDAO
}

module.exports = { ProductDAO, CartDAO, UserDAO, TicketDAO }