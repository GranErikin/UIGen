function buildRespose(success, data, message) {
    return {
        success,
        data,
        message
    }
}

module.exports= {buildRespose};