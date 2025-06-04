const Joi = require('joi');

const createAuction = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        symbol: Joi.string().required(),
        durationInSeconds: Joi.number().required(),
    }),
};


const getAuction = {
    query: Joi.object().keys({
        limit: Joi.number().integer().default(1),
        page: Joi.number().integer().default(1),
    }),
};


module.exports = {
    createAuction,
    getAuction,
};
