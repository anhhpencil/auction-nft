const { ethers } = require('ethers');
const amqp = require('amqplib');
const AuctionArtifact = require('../contracts/PaintingAuction.json');

const { blockchain, rabbitMq } = require('../config/config')
const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);

const listenToEvents = async (contractAddress) => {
    const contract = new ethers.Contract(contractAddress, AuctionArtifact.abi, provider);
    const conn = await amqp.connect(rabbitMq.url);
    const channel = await conn.createChannel();

    await channel.assertQueue('bid-events');
    await channel.assertQueue('auction-ended');
    await channel.assertQueue('nft-minted');
    await channel.assertQueue('withdrawn');

    contract.on('BidPlaced', (bidder, amount) => {
        channel.sendToQueue('bid-events', Buffer.from(JSON.stringify({ contractAddress, bidder, amount: amount.toString() })));
    });

    contract.on('AuctionEnded', (winner, amount) => {
        channel.sendToQueue('auction-ended', Buffer.from(JSON.stringify({ contractAddress, winner, amount: amount.toString() })));
    });

    contract.on('NFTMinted', (to, tokenId) => {
        channel.sendToQueue('nft-minted', Buffer.from(JSON.stringify({ contractAddress, to, tokenId: tokenId.toString() })));
    });

    contract.on('FundsWithdrawn', (bidder, amount) => {
        channel.sendToQueue('withdrawn-events', Buffer.from(JSON.stringify({ contractAddress, bidder, amount: amount.toString() })));
    });
};

module.exports = { listenToEvents };
