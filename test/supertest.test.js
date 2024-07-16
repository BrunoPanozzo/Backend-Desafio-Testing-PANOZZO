const mongoose = require('mongoose')
const supertest = require('supertest')
const { ADMIN_USER } = require('../src/config/config')
const requester = supertest('http://localhost:8080')
const { UserDAO } = require('../src/dao/factory')

describe('Testing de API Ecommerce', () => {

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

    let usersDao
    before(async function () {
        usersDao = UserDAO()

    })

    describe('Tests de USERS/PRODUCTS', () => {

        let chai
        let expect        

        before(async function () {
            chai = await import('chai')
            expect = chai.expect

            const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
            this.connection = mongooseConnection.connection
        })

        beforeEach(async function () {
            await this.connection.db.collection('users').deleteMany({})
            await this.connection.db.collection('products').deleteMany({})
            this.timeout(5000)
        })

        after(async function () {
            await this.connection.db.dropDatabase()
            await this.connection.close()
        })

        it('debe registrar un usuario nuevo e iniciar sesion', async () => {
            //register user
            const registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            const loginUserStatus = await loginUser(mockUser)
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
        })

        it('debe poder crear un producto nuevo', async () => {
            //register user
            const registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            let loginUserStatus = await loginUser(mockUser)
            let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`).send({})
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //create a product
            productMock.owner = mockUser.email
            const { statusCode, ok, body } = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(ok).to.be.true
            expect(statusCode).to.be.equal(201)
            expect(body.status).to.be.equal('success')
        })

        it('NO debe poder crear un producto nuevo', async () => {
            //register user
            const registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            let loginUserStatus = await loginUser(mockUser)
            let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //try to create a product
            productMock.owner = mockUser.email
            const { statusCode, ok, body } = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(ok).to.be.false
            expect(statusCode).to.be.equal(403)
        })

        it('debe eliminar un producto', async () => {
            //register user
            const registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            let loginUserStatus = await loginUser(mockUser)
            let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`).send({})
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //create a product
            productMock.owner = mockUser.email
            const createRequestStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(createRequestStatus.ok).to.be.true
            expect(createRequestStatus.statusCode).to.be.equal(201)
            expect(createRequestStatus.body.status).to.be.equal('success')
            //delete a product
            const productId = createRequestStatus.body.payload
            const deleteRequestStatus = await requester.delete(`/api/products/${productId.toString()}`).set('Cookie', cookie)
            expect(deleteRequestStatus.ok).to.be.true
            expect(deleteRequestStatus.statusCode).to.be.equal(200)            
        })
    })

    describe('Tests de USERS/CARTS', () => {

        let chai
        let expect
        before(async function () {
            chai = await import('chai')
            expect = chai.expect

            const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
            this.connection = mongooseConnection.connection
        })

        beforeEach(async function () {
            await this.connection.db.collection('users').deleteMany({})
            await this.connection.db.collection('products').deleteMany({})
            await this.connection.db.collection('carts').deleteMany({})
            this.timeout(5000)
        })

        after(async function () {
            await this.connection.db.dropDatabase()
            await this.connection.close()
        })
        
        it('debe poder agregar un producto a su carrito', async () => {
            //register user
            const registerUserStatus = await registerUser(mockUser)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            //login user
            let loginUserStatus = await loginUser(mockUser)
            let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`).send({})
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
            //relogin user
            loginUserStatus = await loginUser(mockUser)
            cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')
            //create a product
            productMock.owner = mockUser.email
            const createRequestStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
            expect(createRequestStatus.ok).to.be.true
            expect(createRequestStatus.statusCode).to.be.equal(201)
            expect(createRequestStatus.body.status).to.be.equal('success')
            //register userMock2
            const registerUserStatus2 = await registerUser(mockUser2)
            expect(registerUserStatus2.ok).to.be.true
            expect(registerUserStatus2.body.status).to.be.equals('success')
            //login userMock2
            let loginUserStatus2 = await loginUser(mockUser2)
            let cookie2 = loginUserStatus2.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
            expect(loginUserStatus2.ok).to.be.true
            expect(loginUserStatus2.body.status).to.be.equals('success')
            //add product to userMock2's cart
            const user2 = await usersDao.getUserByEmail(mockUser2.email)
            const cartId = user2.cart
            const productId = createRequestStatus.body.payload
            await requester.post(`/api/carts/${cartId.toString()}/products/${productId.toString()}`)

        })

        // it('NO debe poder agregar un producto a su carrito porque es OWNER del producto', async () => {
        //     //register user
        //     const registerUserStatus = await registerUser(mockUser)
        //     expect(registerUserStatus.ok).to.be.true
        //     expect(registerUserStatus.body.status).to.be.equals('success')
        //     //login user
        //     let loginUserStatus = await loginUser(mockUser)
        //     let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        //     //try to create a product
        //     productMock.owner = mockUser.email
        //     const { statusCode, ok, body } = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
        //     expect(ok).to.be.false
        //     expect(statusCode).to.be.equal(403)
        // })

        // it('debe poder vaciar su carrito', async () => {
        //     //register user
        //     const registerUserStatus = await registerUser(mockUser)
        //     expect(registerUserStatus.ok).to.be.true
        //     expect(registerUserStatus.body.status).to.be.equals('success')
        //     //login user
        //     let loginUserStatus = await loginUser(mockUser)
        //     let cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        //     //change rol to PREMIUM
        //     const userId = loginUserStatus.body.payload
        //     const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`).send({})
        //     expect(userPremiumStatus.statusCode).to.be.equal(200)
        //     expect(userPremiumStatus.ok).to.be.true
        //     //relogin user
        //     loginUserStatus = await loginUser(mockUser)
        //     cookie = loginUserStatus.headers['set-cookie'][0]; // cookie del encabezado de la respuesta
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        //     //create a product
        //     productMock.owner = mockUser.email
        //     const createRequestStatus = await requester.post('/api/products/create').set('Cookie', cookie).send(productMock)
        //     expect(createRequestStatus.ok).to.be.true
        //     expect(createRequestStatus.statusCode).to.be.equal(201)
        //     expect(createRequestStatus.body.status).to.be.equal('success')
        //     //delete a product
        //     const productId = createRequestStatus.body.payload
        //     const deleteRequestStatus = await requester.delete(`/api/products/${productId.toString()}`).set('Cookie', cookie)
        //     expect(deleteRequestStatus.ok).to.be.true
        //     expect(deleteRequestStatus.statusCode).to.be.equal(200)            
        // })
    })

})