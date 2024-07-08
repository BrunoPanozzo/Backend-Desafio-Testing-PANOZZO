const generateInvalidUserDataError = ({ name, email, age }) => {
    return `Invalid user data:
    * name  : should be a non-empty String, received ${name} (${typeof name})
    * email : should be a non-empty String, received ${email} (${typeof email})
    * age   : should be a positive Number, received ${age} (${typeof age})`
}

const generateInvalidCredentialsError = (email) => {
    return `${email} has presented invalid credentials`
}

const generateInvalidUserEmail = ({ email }) => {
    return `Invalid email data:
    * email : should be a non-empty String, received ${email} (${typeof email})`
}

module.exports = { generateInvalidUserDataError, generateInvalidCredentialsError, generateInvalidUserEmail }