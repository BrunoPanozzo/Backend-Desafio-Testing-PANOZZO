const BaseRouter = require('./router')

const { userIsLoggedIn, userIsNotLoggedIn, userIsAdmin, userIsNotAdmin, userIsAdminOrPremium } = require('../middlewares/auth.middleware')

const ViewsController = require('../controllers/views.controller')
const { PUBLIC, USER, ADMIN, SUPER_ADMIN } = require('../config/policies.constants')

const withController = callback => {
    return (req, res) => {
        const controller = new ViewsController()
        return callback(controller, req, res)
    }
}

class ViewRouter extends BaseRouter {
    init() {

        //endpoints de Products y Carts
        
        this.get('/products', [USER, ADMIN, SUPER_ADMIN], userIsLoggedIn, withController((controller, req, res) => controller.getProducts(req, res)))

        this.get('/products/detail/:pid', [USER, ADMIN, SUPER_ADMIN], userIsLoggedIn, withController((controller, req, res) => controller.getProductDetail(req, res)))

        this.get('/products/addcart/:pid', [USER], userIsLoggedIn, userIsNotAdmin, withController((controller, req, res) => controller.addProductToCart(req, res)))

        this.get('/carts/:cid', [USER], userIsLoggedIn, withController((controller, req, res) => controller.getCartById(req, res)))

        this.get('/realtimeproducts', [ADMIN, SUPER_ADMIN], /*userIsLoggedIn, userIsAdminOrPremium,*/ withController((controller, req, res) => controller.getRealTimeProducts(req, res)))

        this.get('/products/create', [ADMIN, SUPER_ADMIN], userIsLoggedIn, userIsAdminOrPremium, withController((controller, req, res) => controller.createProduct(req, res)))

        //endpoints de Messages

        this.get('/chat', [PUBLIC], withController((controller, req, res) => controller.chat(req, res)))

        //endpoints de Login/Register

        this.get('/', [PUBLIC], withController((controller, req, res) => controller.home(req, res)))

        this.get('/login', [PUBLIC], userIsNotLoggedIn, withController((controller, req, res) => controller.login(req, res)))
        
        this.get('/reset_password/:email/token/:token', [PUBLIC], userIsNotLoggedIn, withController((controller, req, res) => controller.resetPassword(req, res)))

        this.get('/forget_password', [PUBLIC], userIsNotLoggedIn, withController((controller, req, res) => controller.forgetPassword(req, res)))

        this.get('/register', [PUBLIC], userIsNotLoggedIn, withController((controller, req, res) => controller.register(req, res)))

        this.get('/profile', [USER, ADMIN, SUPER_ADMIN], userIsLoggedIn, withController((controller, req, res) => controller.profile(req, res)))

        //endpoint de mockings

        this.get('/mockingproducts/', [USER, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.mockingProducts(req, res)))

        this.get('/mockingusers', [USER, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.mockingUsers(req, res)))

        //endpoint testLogger

        this.get('/loggertest', [PUBLIC, USER, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.loggerTest(req, res)))

    }

}

module.exports = ViewRouter