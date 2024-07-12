const supertest = require('supertest')
const { ADMIN_USER } = require('../src/config/config')
const requester = supertest('http://localhost:8080')

describe('Testing de API Ecommerce', () => {

    describe('Tests /api/products', () => {
    
        let chai
        let expect
        before(async function () {
            chai = await import('chai')
            expect = chai.expect
        })
    
        it('el endpoint POST /api/products/create debe crear un producto correctamente', async () => {
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

            const { statusCode, ok, body } = await requester.post('/api/products/create').send(productMock)
            console.log(statusCode)
            console.log(ok)
            console.log(body)
            expect(ok).to.be.true
            expect(statusCode).to.be.equal(200)
            expect(body.status).to.be.equal('success')
            expect(body.payload).to.have.property('_id')
            expect(body.payload.name).to.be.equal('Tester')
            expect(body.payload.specie).to.be.equal('dog')
            expect(body.payload.adopted).to.be.false
            expect(body.payload.image).to.be.equal('')
        })

    })

})