const ticketModel = require("./models/ticket.model")

class TicketDAO {

    constructor() { }

    async init() { }
    
    async addTicket(newTicket) {
        try {
            const savedTicket = await ticketModel.create(newTicket)
            return savedTicket.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }
}

module.exports = { TicketDAO }