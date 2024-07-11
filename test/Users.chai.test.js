const mongoose = require('mongoose')
const { UserDAO, CartDAO } = require('../src/dao/factory')
const { USER } = require('../src/config/policies.constants')
const { hashPassword } = require('../src/utils/hashing')

describe('Testing Users DAO with chai', () => { 

    let chai
    let expect
    before (async function () {
        chai = await import('chai')
        expect = chai.expect

        this.usersDao = UserDAO()     
        this.cartsDao = CartDAO()   
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongooseConnection.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })
    
    beforeEach(async function () {
        await this.connection.db.collection('users').deleteMany({})
        this.timeout(5000)
    })

    it('debe devolver un arreglo con todos los usuarios', async function() {
        const result = await this.usersDao.getUsers()
        expect(result).to.be.deep.equal([])
    })

    it('debe agregar un usuario con un carrito vacío por defecto', async function () {
        const newCart = this.cartsDao.getID(await this.cartsDao.addCart([])) 
        const mockUser = {
            firstName: 'Tester',
            lastName: 'Tester',
            email: 'tester@gmail.com',
            password: 'tester123',
            rol: USER,
            age: 30,
            password: hashPassword('kjsdfg9087dfsg9'),
            cart: newCart
        }        
        const newUser = await this.usersDao.saveUser(mockUser)
        //expect(newUser._id).to.be.ok
        expect(newUser._id.toString()).length.greaterThan(0)
    })

    it('debe devolver un usuario por email', async function () {
        const newCart = this.cartsDao.getID(await this.cartsDao.addCart([])) 
        const mockUser = {
            firstName: 'Tester',
            lastName: 'Tester',
            email: 'tester@gmail.com',
            password: 'tester123',
            rol: USER,
            age: 30,
            password: hashPassword('kjsdfg9087dfsg9'),
            cart: newCart
        }        
        await this.usersDao.saveUser(mockUser)

        const user = await this.usersDao.getUserByEmail('tester@gmail.com')
        expect(user._id.toString()).length.greaterThan(0)
        expect(user.firstName).to.be.equal('Tester')
    })
    
    it('debe eliminar correctamente un usuario', async function () {
        const newCart = this.cartsDao.getID(await this.cartsDao.addCart([])) 
        const mockUser = {
            firstName: 'Tester',
            lastName: 'Tester',
            email: 'tester@gmail.com',
            password: 'tester123',
            rol: USER,
            age: 30,
            password: hashPassword('kjsdfg9087dfsg9'),
            cart: newCart
        }        
        const newUser = await this.usersDao.saveUser(mockUser)
        await this.usersDao.deleteUser(newUser._id)
        const user = await this.usersDao.getUserById({ _id: newUser._id.toString() })
        expect(user).to.not.exist
    })

})