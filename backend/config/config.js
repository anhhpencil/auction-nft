const path = require('path');

const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
    .keys({
        PORT: Joi.number().required(),
        MONGODB_URL: Joi.string().required().description('Mongo DB url'),

        RPC_URL: Joi.string().required(),
        ADMIN_PRIVATE_KEY: Joi.string().required(),

        PINATA_API_KEY: Joi.string().required(),
        PINATA_API_SECRET: Joi.string().required(),
        PINATA_API_URL: Joi.string().required(),
        PINATA_GATEWAY: Joi.string().required(),

        RABBITMQ_URL: Joi.string().required(),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    port: envVars.PORT || 5000,

    mongoose: {
        url: envVars.MONGODB_URL,
        options: {},
    },

    blockchain: {
        rpcUrl: envVars.RPC_URL,
        adminKey: envVars.ADMIN_PRIVATE_KEY
    },

    pinata: {
        apiKey: envVars.PINATA_API_KEY,
        apisecret: envVars.PINATA_API_SECRET,
        url: envVars.PINATA_API_URL,
        gateway: envVars.PINATA_GATEWAY
    },

    rabbitMq: {
        url: envVars.RABBITMQ_URL,
    }
};
