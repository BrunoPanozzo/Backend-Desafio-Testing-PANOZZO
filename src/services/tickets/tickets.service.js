class TicketsServices {
    
    constructor(dao) {
        this.dao = dao
    }
    
    generarCodeUnico() {
        return new Date().getTime().toString()
    }

    async addTicket(ticket) {
        let newTicket = {            
            code:this.generarCodeUnico(),
            ...ticket
        }

        return await this.dao.addTicket(newTicket)
    }
    
}

module.exports = TicketsServices