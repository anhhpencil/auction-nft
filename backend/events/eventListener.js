const { ethers } = require('ethers');
const AuctionArtifact = require('../contracts/PaintingAuction.json');

const { blockchain } = require('../config/config')
const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);

const { connectRabbitMQ } = require('../libs/rabbitmq');

const listenToEvents = async (contractAddress) => {
    const contract = new ethers.Contract(contractAddress, AuctionArtifact.abi, provider);
    const conn = await connectRabbitMQ();
    const channel = await conn.createChannel();

    await channel.assertQueue('bid-events');
    await channel.assertQueue('auction-ended');
    await channel.assertQueue('nft-minted');
    await channel.assertQueue('withdrawn');

    contract.on('BidPlaced', (bidder, amount) => {
        console.log("Listened BidPlaced")
        channel.sendToQueue('bid-events', Buffer.from(JSON.stringify({ contractAddress, bidder, amount: amount.toString() })));
    });

    contract.on('AuctionEnded', (winner, amount) => {
        console.log("Listened AuctionEnded")
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
