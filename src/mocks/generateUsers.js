const { fakerES: faker } = require('@faker-js/faker')

const generateUser = () => {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        age: faker.number.int({ min: 0, max: 99 }),
        email: faker.internet.email(),
        password: faker.internet.password(),
        rol: faker.person.jobDescriptor(),
        cart: []        
    }
}

module.exports = { generateUser }