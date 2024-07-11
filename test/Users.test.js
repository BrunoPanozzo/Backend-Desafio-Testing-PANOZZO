//import mongoose from 'mongoose'
//import UserDAO from '../src/dao/factory'
//import Assert from 'assert'

const mongoose = require('mongoose')
const { UserDAO, CartDAO } = require('../src/dao/factory')
const Assert = require('assert')
const { USER } = require('../src/config/policies.constants')
const { hashPassword } = require('../src/utils/hashing')

const assert = Assert.strict

describe('Testing Users DAO with Assert', () => { 

    before (async function () {
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
        assert.strictEqual(Array.isArray(result), true)
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
        assert.ok(newUser._id)        
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
        assert.ok(user._id)
        assert.strictEqual(user.firstName, 'Tester')
    })
    
})