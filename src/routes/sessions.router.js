const BaseRouter = require('./router')

const passport = require('passport')
const passportMiddleware = require('../middlewares/passport.middleware')

const SessionsController = require('../controllers/sessions.controller')
const { PUBLIC, USER, ADMIN, SUPER_ADMIN, USER_PREMIUM } = require('../config/policies.constants')

const withController = callback => {
    return (req, res) => {
        const controller = new SessionsController()
        return callback(controller, req, res)
    }
}

class SessionRouter extends BaseRouter {
    init() {

        this.post('/login', [PUBLIC], passportMiddleware('login'), withController((controller, req, res) => controller.login(req, res)))

        this.get('/faillogin', [PUBLIC], withController((controller, req, res) => controller.failLogin(req, res)))

        this.post('/reset_password/:token', [PUBLIC], passport.authenticate('reset_password', { failureRedirect: '/api/sessions/failreset_password' }), withController((controller, req, res) => controller.resetPassword(req, res)))

        this.post('/forget_password', [PUBLIC], withController((controller, req, res) => controller.forgetPassword(req, res)))

        this.get('/failreset_password', [PUBLIC], withController((controller, req, res) => controller.failResetPassword(req, res)))

        // agregamos el middleware de passport para el register
        this.post('/register', [PUBLIC], passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), withController((controller, req, res) => controller.register(req, res)))

        this.get('/failregister', [PUBLIC], withController((controller, req, res) => controller.failRegister(req, res)))

        this.get('/github', [PUBLIC], passport.authenticate('github', { scope: ['user:email'] }), () => { })

        this.get('/githubcallback', [PUBLIC], passport.authenticate('github', { failureRedirect: '/login' }), withController((controller, req, res) => controller.githubCallback(req, res)))

        this.get('/google', [PUBLIC], passport.authenticate('google', { scope: ['profile', 'email'] }), () => { })

        this.get('/googlecallback', [PUBLIC], passport.authenticate('google', { failureRedirect: '/login' }), withController((controller, req, res) => controller.googleCallback(req, res)))

        this.get('/logout', [USER, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.logout(req, res)))

        this.get('/current', [USER, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.current(req, res)))

        this.put('/premium/:uid', [USER, USER_PREMIUM, ADMIN, SUPER_ADMIN], withController((controller, req, res) => controller.changeRole(req, res)))

    }
}

module.exports = SessionRouter