const mongoose = require('mongoose');
const { Auction } = require('../models');
const { blockchainService } = require('../services');


const handleAuctionConclusion = async (auction) => {
    try {
        await blockchainService.endAuction(auction.address);

        console.log(`✔ Auction ${auction.id} concluded. Winner: ${winnerAddress}`);
    } catch (err) {
        await session.abortTransaction();
        console.error(`❌ Failed to conclude auction ${auction.id}:`, err);
    } finally {
        session.endSession();
    }
};
const endAuctionJob = async () => {
    const now = new Date();
    const expiredAuctions = await Auction.find({ endsAt: { $lt: now }, status: 'active' });

    for (const auction of expiredAuctions) {
        await handleAuctionConclusion(auction);
    }
};


module.exports = { endAuctionJob }