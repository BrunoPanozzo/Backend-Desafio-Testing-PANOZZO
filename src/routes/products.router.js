const BaseRouter = require('./router')

const { validateNewProduct, validateUpdateProduct, validateProduct } = require('../middlewares/product.middleware')

const ProducsController = require('../controllers/products.controller')
const { PUBLIC, USER, ADMIN, SUPER_ADMIN, USER_PREMIUM } = require('../config/policies.constants')
const { userIsAdmin, userIsLoggedIn, userIsAdminOrPremium } = require('../middlewares/auth.middleware')

const withController = callback => {
    return (req, res) => {
        const producsController = new ProducsController()
        return callback(producsController, req, res)
    }
}

class ProductRouter extends BaseRouter {
    init() {
        this.get('/all', [USER], withController((controller, req, res) => controller.getAllProducts(req, res)))

        this.get('/', [USER], withController((controller, req, res) => controller.getProducts(req, res)))

        this.post('/create', [ADMIN, USER_PREMIUM, SUPER_ADMIN], userIsLoggedIn, userIsAdminOrPremium, validateNewProduct, withController((controller, req, res) => controller.addProduct(req, res)))

        this.put('/:pid', [ADMIN, SUPER_ADMIN], /*userIsLoggedIn, userIsAdminOrPremium,*/ validateUpdateProduct, withController((controller, req, res) => controller.updateProduct(req, res)))

        this.delete('/:pid', [ADMIN, SUPER_ADMIN], /*userIsLoggedIn, userIsAdminOrPremium,*/ validateProduct, withController((controller, req, res) => controller.deleteProduct(req, res)))

        this.get('/:pid', [USER], validateProduct, withController((controller, req, res) => controller.getProductById(req, res)))
    }
}

module.exports = ProductRouter