const mongoose = require('mongoose')
const supertest = require('supertest')
const { ADMIN_USER } = require('../src/config/config')
const requester = supertest('http://localhost:8080')
const { UserDAO, ProductDAO } = require('../src/dao/factory')

describe('Testing de API Ecommerce', () => {

    const mockUser = {
        firstName: 'Tester',
        lastName: 'Tester',
        email: 'tester@gmail.com',
        password: 'tester123',
        age: 35,
        cart: null
    }

    const mockUser2 = {
        firstName: 'Tester2',
        lastName: 'Tester2',
        email: 'tester2@gmail.com',
        password: 'tester123',
        age: 35,
        cart: null
    }

    const mockUser3 = {
        firstName: 'Tester',
        lastName: 'Tester',
        email: '',
        password: 'tester123',
        age: 35,
        cart: null
    }

    const productMock = {
        title: "Galaxy Watch5 Bluetooth (44mm) Graphite",
        description: "Pantalla táctil SAMOLED de 1.4'. Apto para descarga de aplicaciones. Resiste hasta 50m bajo el agua. Con GPS y mapas integrados. Batería de 40 h de duración y carga rápida. Conectividad por Bluetooth y wifi. Capacidad de la memoria interna de 7.5GB.",
        price: 174999,
        thumbnail: "[smartwatch5.png]",
        code: "Moviles3",
        stock: 10,
        status: true,
        category: "Moviles",
        owner: ADMIN_USER
    }

    //register user
    const registerUser = async (user) => {
        return await requester.post('/api/sessions/register').send(user)
    }

    //login user 
    const loginUser = async (user) => {
        const userToLogin = { email: user.email, password: user.password }
        return await requester.post('/api/sessions/login').send(userToLogin)
        //return result.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
    }

    //logout user 
    const logoutUser = async (user) => {
        const userToLogout = { email: user.email, password: user.password }
        return await requester.post('/api/sessions/logout').send(userToLogout)
    }

    let chai
    let expect
    let usersDao
    let productsDao
    let registerUserStatus
    let registerUserStatus2
    let loginUserStatus
    let loginUserStatus2
    let createProductStatus
    before(async function () {
        chai = await import('chai')
        expect = chai.expect

        usersDao = UserDAO()
        productsDao = ProductDAO()

        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongooseConnection.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    describe('Tests de USERS/PRODUCTS', () => {
        it('debe registrar un usuario nuevo e iniciar sesion', async () => {
            //register user
            registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            loginUserStatus = await loginUser(mockUser)
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
        })

        it('debe poder crear un producto nuevo, cambio el rol del user a PREMIUM previamente', async () => {
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //create a product
            productMock.owner = mockUser.email
            createProductStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(createProductStatus.ok).to.be.true
            expect(createProductStatus.statusCode).to.be.equal(201)
            expect(createProductStatus.body.status).to.be.equal('success')
        })

        it('NO debe poder crear un producto nuevo, cambio el rol del user a USER previamente', async () => {
            //change rol to USER
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //try to create a product
            productMock.owner = mockUser.email
            createProductStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(createProductStatus.ok).to.be.false
            expect(createProductStatus.statusCode).to.be.equal(403)
        })

        it('debe poder eliminar un producto', async () => {
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //delete a product
            const product = await productsDao.getProductByCode(productMock.code)
            const productId = product._id
            const deleteRequestStatus = await requester.delete(`/api/products/${productId.toString()}`).set('Cookie', cookie)
            expect(deleteRequestStatus.ok).to.be.true
            expect(deleteRequestStatus.statusCode).to.be.equal(200)
        })
    })

    describe('Tests de USERS/CARTS', () => {
        it('debe poder agregar un producto a su carrito', async () => {
            //create a product
            productMock.owner = mockUser.email
            createProductStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(createProductStatus.ok).to.be.true
            expect(createProductStatus.statusCode).to.be.equal(201)
            expect(createProductStatus.body.status).to.be.equal('success')
            //register userMock2
            registerUserStatus2 = await registerUser(mockUser2)
            expect(registerUserStatus2.ok).to.be.true
            expect(registerUserStatus2.body.status).to.be.equals('success')
            //login userMock2
            loginUserStatus2 = await loginUser(mockUser2)
            let cookie2 = loginUserStatus2.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus2.ok).to.be.true
            expect(loginUserStatus2.body.status).to.be.equals('success')
            //add product to userMock2's cart
            const user2 = await usersDao.getUserByEmail(mockUser2.email)
            const cartId = user2.cart
            const productId = createProductStatus.body.payload
            let addProductToCartStatus = await requester.post(`/api/carts/${cartId.toString()}/products/${productId.toString()}`).set('Cookie', cookie2).send({ quantity: 1 })
            expect(addProductToCartStatus.ok).to.be.true
            expect(addProductToCartStatus.status).to.be.equal(200)
            expect(addProductToCartStatus.body.status).to.be.equals('success')
        })

        it('debe poder eliminar un producto de su carrito', async () => {
            let cookie2 = loginUserStatus2.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            //delete product from userMock2's cart
            const user2 = await usersDao.getUserByEmail(mockUser2.email)
            const cartId = user2.cart
            const productId = createProductStatus.body.payload
            let addProductToCartStatus = await requester.delete(`/api/carts/${cartId.toString()}/products/${productId.toString()}`).set('Cookie', cookie2)
            expect(addProductToCartStatus.ok).to.be.ok
            expect(addProductToCartStatus.statusCode).to.be.equal(200)
            expect(addProductToCartStatus.body.status).to.be.equals('success')
        })

        it('NO debe poder agregar un producto a su carrito porque es OWNER del producto', async () => {
            //login userMock
            loginUserStatus = await loginUser(mockUser)
            let cookie1 = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //add product to userMock's cart
            const user = await usersDao.getUserByEmail(mockUser.email)
            const cartId = user.cart
            const productId = createProductStatus.body.payload
            let addProductToCartStatus = await requester.post(`/api/carts/${cartId.toString()}/products/${productId.toString()}`).set('Cookie', cookie).send({ quantity: 1 })
            expect(addProductToCartStatus.ok).to.be.false
            expect(addProductToCartStatus.statusCode).to.be.equal(500)
            expect(addProductToCartStatus.body.status).to.be.equals('error')
        })
    })

    describe('Tests de USERS', () => {
        it('no debe registrar un usuario con datos inválidos', async () => {
            //register invalid user
            registerUserStatus = await registerUser(mockUser3)
            expect(registerUserStatus.ok).to.be.false
            expect(registerUserStatus.statusCode).to.be.equals(302)
        })

        it('no debe registrar un usuario repetido', async () => {
            //register user again
            registerUserStatus = await registerUser(mockUser)            
            expect(registerUserStatus.ok).to.be.false
            expect(registerUserStatus.statusCode).to.be.equals(302)

        })

        it('debe permitir cambiar el rol a un usuario', async () => {
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true

        })
    })

})