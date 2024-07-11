const mongoose = require('mongoose')
const { ProductDAO } = require('../src/dao/factory')
const Assert = require('assert')
const { ADMIN } = require('../src/config/policies.constants')

const assert = Assert.strict

describe('Testing Products DAO with Assert', () => {

    before(async function () {
        this.productsDao = ProductDAO()
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongooseConnection.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        await this.connection.db.collection('products').deleteMany({})
        this.timeout(5000)
    })

    it('Debe devolver un arreglo con todos los productos', async function () {
        const result = await this.productsDao.getProducts({})
        assert.strictEqual(Array.isArray(result.docs), true)
    })

    it('debe agregar un producto nuevo', async function () {
        let title = "Galaxy Watch5 Bluetooth (44mm) Graphite"
        let description = "Pantalla táctil SAMOLED de 1.4'. Apto para descarga de aplicaciones. Resiste hasta 50m bajo el agua. Con GPS y mapas integrados. Batería de 40 h de duración y carga rápida. Conectividad por Bluetooth y wifi. Capacidad de la memoria interna de 7.5GB."
        let code = "Moviles3"
        let price = 174999
        let thumbnail = "[smartwatch5.png]"
        let stock = 10
        let status = true
        let category = "Moviles"
        let owner = ADMIN
        const mockProduct = await this.productsDao.addProduct(title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category,
            owner)
        assert.ok(mockProduct._id)
    })

    it('debe devolver un producto dado su Id', async function () {
        let title = "Galaxy Watch5 Bluetooth (44mm) Graphite"
        let description = "Pantalla táctil SAMOLED de 1.4'. Apto para descarga de aplicaciones. Resiste hasta 50m bajo el agua. Con GPS y mapas integrados. Batería de 40 h de duración y carga rápida. Conectividad por Bluetooth y wifi. Capacidad de la memoria interna de 7.5GB."
        let code = "Moviles3"
        let price = 174999
        let thumbnail = "[smartwatch5.png]"
        let stock = 10
        let status = true
        let category = "Moviles"
        let owner = ADMIN
        const mockProduct = await this.productsDao.addProduct(title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category,
            owner)

        const product = await this.productsDao.getProductById(mockProduct._id)
        assert.ok(product._id)
        assert.strictEqual(product.title, "Galaxy Watch5 Bluetooth (44mm) Graphite")
    })

    it('debe eliminar correctamente un producto', async function () {
        let title = "Galaxy Watch5 Bluetooth (44mm) Graphite"
        let description = "Pantalla táctil SAMOLED de 1.4'. Apto para descarga de aplicaciones. Resiste hasta 50m bajo el agua. Con GPS y mapas integrados. Batería de 40 h de duración y carga rápida. Conectividad por Bluetooth y wifi. Capacidad de la memoria interna de 7.5GB."
        let code = "Moviles3"
        let price = 174999
        let thumbnail = "[smartwatch5.png]"
        let stock = 10
        let status = true
        let category = "Moviles"
        let owner = ADMIN
        const mockProduct = await this.productsDao.addProduct(title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category,
            owner)
        await this.productsDao.deleteProduct(mockProduct._id)
        const product = await this.productsDao.getProductById({ _id: mockProduct._id.toString() })
        assert.equal(product, null)
    })
})