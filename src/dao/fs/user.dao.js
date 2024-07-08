const fs = require('fs')

class UserDAO {

    //variables internas
    #users
    static #lastID_User = 0

    //constructor
    constructor() {
        this.#users = []
        this.path = `${__dirname}/../users.json`        
    }

    init = async () => {
        this.#users = await this.getUsers()
        UserDAO.#lastID_User = this.#getHigherID()
    }

    //métodos internos

    #getHigherID = () => {
        let higherID = 0
        this.#users.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada user nuevo
    #getNuevoID = () => {
        UserDAO.#lastID_User += 1
        return UserDAO.#lastID_User;
    }

    //leer el archivo de users e inicializar el array de objetos
    async #readUsersFromFile() {
        try {
            const fileUsersContent = await fs.promises.readFile(this.path)
            this.#users = JSON.parse(fileUsersContent)
        }
        catch (err) {
            return []
        }
    }

    //guardar el array de users en un archivo
    async #updateUsersFile() {
        const fileUsersContent = JSON.stringify(this.#users, null, '\t')
        await fs.promises.writeFile(this.path, fileUsersContent)
    }

    async login(email) {
        try {
            
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUsers() {
        try {
            return this.#users 
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserById(id) {
        try {
            
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async saveUser(user) {
        try {
            
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateUserPassword(email, pass) {
        try {
            
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

}

module.exports = { UserDAO }