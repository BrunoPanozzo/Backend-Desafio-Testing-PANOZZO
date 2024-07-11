const mongoose = require('mongoose')
const { CartDAO } = require('../src/dao/factory')

describe('Testing Carts DAO with chai', () => {

    let chai
    let expect
    before(async function () {
        chai = await import('chai')
        expect = chai.expect

        this.cartsDao = CartDAO()
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongooseConnection.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })
    
    beforeEach(async function () {
        await this.connection.db.collection('carts').deleteMany({})
        this.timeout(5000)
    })

    it('Debe devolver un arreglo con todos los carritos', async function () {
        const result = await this.cartsDao.getCarts()
        expect(result).to.be.deep.equal([])
    })

    it('debe agregar un carrito nuevo', async function () {
        let products = [{
            _id: '661e819126c8b1e342774c40',
            quantity: 5
        },
        {
            _id: '661e816c26c8b1e342774c3d',
            quantity: 4
        }]
        const mockCart = await this.cartsDao.addCart(products)
        expect(mockCart._id.toString()).length.greaterThan(0)
    })

    it('debe devolver un carrito dado su Id', async function () {
        let products = [{
            _id: '661e819126c8b1e342774c40',
            quantity: 5
        },
        {
            _id: '661e816c26c8b1e342774c3d',
            quantity: 4
        }]
        const mockCart = await this.cartsDao.addCart(products)
        const cart = await this.cartsDao.getCartById(mockCart._id)
        expect(cart._id.toString()).length.greaterThan(0)
    })

    it('debe eliminar correctamente un carrito', async function () {
        let products = [{
            _id: '661e819126c8b1e342774c40',
            quantity: 5
        },
        {
            _id: '661e816c26c8b1e342774c3d',
            quantity: 4
        }]
        const mockCart = await this.cartsDao.addCart(products)
        await this.cartsDao.deleteCart(mockCart._id)
        const cart = await this.cartsDao.getCartById({ _id: mockCart._id.toString() })
        expect(cart).to.not.exist
    })

})