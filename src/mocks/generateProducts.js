const { fakerES: faker } = require("@faker-js/faker")

const generateProduct = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.string.alphanumeric(),
        price: faker.commerce.price(),
        thumbnail: [faker.image.url()],
        stock: faker.number.int({ min: 0, max: 200 }),
        // id: faker.database.mongodbObjectId(),
        status: faker.datatype.boolean(),
        category: faker.commerce.product()
    }
}

module.exports = { generateProduct }