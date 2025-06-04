const amqp = require('amqplib');

const { rabbitMq } = require('../config/config');

const connectRabbitMQ = async (retries = 5) => {
    while (retries) {
        try {
            const conn = await amqp.connect(rabbitMq.url);
            console.log('✅ Connected to RabbitMQ');
            return conn;
        } catch (err) {
            console.log(`❌ RabbitMQ not ready, retrying... (${retries})`);
            retries--;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    throw new Error('RabbitMQ not reachable');
};

module.exports = { connectRabbitMQ }