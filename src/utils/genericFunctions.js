const {errorMessages} = require('../utils/constants');

const returnResponseObj = (statusCode = 500) => {
    return { status: false, message: errorMessages[`${statusCode}`] };
}

module.exports = {returnResponseObj};