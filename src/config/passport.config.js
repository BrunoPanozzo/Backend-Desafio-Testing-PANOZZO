const passport = require('passport')

const localStrategy = require('passport-local')
const githubStrategy = require('passport-github2')
const { Strategy, ExtractJwt } = require('passport-jwt')
const googleStrategy = require('passport-google-oauth20')

const { hashPassword, isValidPassword } = require('../utils/hashing')
const config = require('./config')

const LocalStrategy = localStrategy.Strategy
const GithubStrategy = githubStrategy.Strategy
const JwtStrategy = Strategy
const GoogleStrategy = googleStrategy.Strategy

const { UserDAO, CartDAO } = require('../dao/factory')
const { ADMIN } = require('./policies.constants')
const userDAO = UserDAO()
const cartDAO = CartDAO()

const initializeStrategy = () => {

    const cookieExtractor = req => req && req.cookies ? req.cookies['userToken'] : null

    //defino un middleware para extraer el current user a partir de un token guardado en una cookie
    passport.use('jwt', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.SECRET //secretCode
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload.user)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'register' y su estrategia asociada
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {  //esta es el callback donde se especifica cómo se debe registrar un user

        const { firstName, lastName, email, age } = req.body

        try {
            // user = await userModel.findOne({ email: username })
            const userAlreadyExists = await userDAO.login({ email: username })
            if (userAlreadyExists) {
                //ya existe un usuario con ese email
                return done(null, false)
            }

            //puedo continuar con la registración
            const newCart = cartDAO.getID(await cartDAO.addCart([])) //null         
            const newUser = {
                firstName,
                lastName,
                email,
                age: + age,
                
                password: hashPassword(password),
                cart: newCart
            }

            //const result = await userModel.create(newUser)
            const result = await userDAO.saveUser(newUser)

            // registro exitoso
            return done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'login' y su estrategia asociada
    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            if (!username || !password) {
                // return res.status(400).json({ error: 'Credenciales inválidas!' })
                return done(null, false, 'Credenciales inválidas!')
            }
            
            //verifico si es el usuario "ADMIN"
            let logedUser
            if (username === config.ADMIN_USER && password === config.ADMIN_USER_PASS) {
                logedUser = {
                    rol: ADMIN,
                    firstName: "Coder",
                    lastName: "House",
                    email: username,
                    password: password,
                    age: 47,
                    _id: "dflksgd8sfg7sd890fg",
                    cart: null
                }
            }
            else {
                //lo busco en la BD
                //user = await userModel.findOne({ email: username })
                logedUser = await userDAO.login({ email: username })
                if (!logedUser) {
                    // return res.status(401).send('No se encontró el usuario!')
                    return done(null, false, 'No se encontró el usuario!')
                }

                // validar el password
                if (!isValidPassword(password, logedUser.password)) {
                    // return res.status(401).json({ error: 'Password inválida!' })
                    return done(null, false, 'Password inválida!')
                }
            }

            // login exitoso
            // req.session.user = { id: user._id.toString(), email: user.email, age: user.age, firstName: user.firstName, lastName: user.lastName, rol: user.rol }
            return done(null, logedUser)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'reset_password' y su estrategia asociada
    passport.use('reset_password', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            if (!username || !password) {
                // return res.status(400).json({ error: 'Credenciales inválidas!' })
                return done(null, false)
            }

            //verifico si es el usuario "ADMIN", no se le puede cambiar la pass
            let logedUser
            if (username === config.ADMIN_USER) {
                return done(null, false)
            }

            //lo busco en la BD
            //logedUser = await userModel.findOne({ email: username })
            logedUser = await userDAO.login({ email: username })
            if (!logedUser) {
                // return res.status(400).send('No se encontró el usuario!')
                return done(null, false)
            }

            //await userModel.updateOne({ email: username }, { $set: { password: hashPassword(password) }})
            await userDAO.updateUserPassword({ email: username }, hashPassword(password))

            // reset password exitoso
            return done(null, logedUser)
        }
        catch (err) {
            done(err)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID: config.CLIENT_ID, 
        clientSecret: config.CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            //const user = await userModel.findOne({ email: profile._json.email })
            const logedUser = await userDAO.login({ email: profile._json.email })
            if (logedUser) {
                return done(null, logedUser)
            }

            // crear el usuario porque no existe    
            const newCart = cartDAO.getID(await cartDAO.addCart([])) //null        
            const fullName = profile._json.name
            const firstName = fullName.substring(0, fullName.lastIndexOf(' '))
            const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1)
            const newUser = {
                firstName,
                lastName,
                age: 30,
                email: profile._json.email,
                password: '',
                cart: newCart
            }
            //const result = await userModel.create(newUser)
            const result = await userDAO.saveUser(newUser)
            done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))
    
    passport.use('google', new GoogleStrategy({
        clientID: config.CLIENT_ID_GOOGLE,
        clientSecret: config.CLIENT_SECRET_GOOGLE,
        callbackURL: config.CALLBACK_URL_GOOGLE
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            //const user = await userModel.findOne({ email: email })
            const logedUser = await userDAO.login({ email: email })
            if (logedUser) {
                return done(null, logedUser)
            }

            // crear el usuario porque no existe
            const newCart = cartDAO.getID(await cartDAO.addCart([])) //null
            const firstName = profile._json.given_name
            const lastName = profile._json.family_name
            const newUser = {
                firstName,
                lastName,
                age: 30,
                email: email,
                password: '',
                cart: newCart
            }
            //const result = await userModel.create(newUser)
            const result = await userDAO.saveUser(newUser)
            done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))

    // al hacer register o login del usuario, se pasa el modelo de user al callback done
    // passport necesita serializar este modelo, para guardar una referencia al usuario en la sesión
    // simplemente se usa su id
    passport.serializeUser((user, done) => {
        // console.log('serialized!', user)
        if (user.email === config.ADMIN_USER) {
            // Serialización especial para el usuario 'adminCoder@coder.com'
            done(null, { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, rol: user.rol, cart: user.cart });
        } else {
            done(null, user._id)
        }
    })

    // para restaurar al usuario desde la sesión, passport utiliza el valor serializado y vuelve a generar al user
    // el cual colocará en req.user para que podamos usarlo
    passport.deserializeUser(async (id, done) => {
        // console.log('deserialized!', id)
        if (id.email === config.ADMIN_USER) {
            // Deserialización especial para el usuario 'adminCoder@coder.com'
            done(null, id);
        } else {
            //const user = await userModel.findById(id)
            const userFound = await userDAO.getUserById(id)
            done(null, userFound);
        }
    })

}

module.exports = initializeStrategy
