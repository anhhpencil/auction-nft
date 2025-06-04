const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const { pinata } = require('../config/config')


const uploadToPinata = async (filePath) => {
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    const res = await axios.post(`${pinata.url}/pinFileToIPFS`, data, {
        maxContentLength: Infinity,
        headers: {
            ...data.getHeaders(),
            pinata_api_key: `${pinata.apiKey}`,
            pinata_secret_api_key: `${pinata.apisecret}`,
        },
    });

    return `${pinata.gateway}/${res.data.IpfsHash}`;
};


module.exports = { uploadToPinata }

