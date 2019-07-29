const request = require('request');

const ehrServerHost = process.env.EHR_SERVER_HOST;
const ehrAuthenticateUrl = `${ehrServerHost}/login?username=${process.env.EHR_SERVER_USERNAME}&password=${process.env.EHR_SERVER_PASSWORD}&organization=${process.env.EHR_SERVER_ORGANIZATION}&format=json`;
const fetchOPTTemplateUrl = `${ehrServerHost}/templates/`;

const getEHRServerToken = (callback) => {
    request(ehrAuthenticateUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        (err, response, body) => {
            let res = JSON.parse(body);
            if (err) {
                callback(err);
            } else {
                callback(null, res);
            }
        });
};

const fetchOPTTemplate = (token, templateId, callback) => {
    request(`${fetchOPTTemplateUrl}${templateId}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/xml',
                'Authorization':`Bearer ${token}`
            }
        },
        (err, response, body) => {
            let res = JSON.parse(body);
            if (err) {
                callback(err);
            } else {
                callback(null, res);
            }
        });
};

module.exports = {getEHRServerToken, fetchOPTTemplate};