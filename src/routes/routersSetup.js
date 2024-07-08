// routers
const CartRouter = require('./carts.router')
const ProductRouter = require('./products.router')
const ViewRouter = require('./views.router')
const SessionRouter = require('./sessions.router')
const JwtRouter = require('./jwt.router')

module.exports = {
    //configurar los routers
    routers : [
        { path: '/api/products', router: new ProductRouter().getRouter() },
        { path: '/api/carts', router: new CartRouter().getRouter() },
        { path: '/', router: new ViewRouter().getRouter() },
        { path: '/api/sessions', router: new SessionRouter().getRouter() },
        { path: '/api', router: new JwtRouter().getRouter() }
    ]
}