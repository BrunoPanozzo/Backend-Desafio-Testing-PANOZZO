const BaseRouter = require('./router')

const { USER, ADMIN, SUPER_ADMIN, PUBLIC } = require('../config/policies.constants')

const { verifyToken } = require('../utils/jwt')
const passportMiddleware = require('../middlewares/passport.middleware')

const JwtController = require('../controllers/jwt.controller')

const withController = callback => {
    return (req, res) => {
        const jwtController = new JwtController()
        return callback(jwtController, req, res)
    }
}

class JwtRouter extends BaseRouter {
    init() {

        this.post('/login', [PUBLIC], withController((controller, req, res) => controller.login(req, res)))

        this.get('/private', [ADMIN, SUPER_ADMIN], verifyToken, withController((controller, req, res) => controller.private(req, res)))

        this.get('/current', [USER, ADMIN, SUPER_ADMIN], passportMiddleware('jwt') /*passport.authenticate('jwt', {session: false})*/, withController((controller, req, res) => controller.current(req, res)))

    }
}
    
module.exports = JwtRouter