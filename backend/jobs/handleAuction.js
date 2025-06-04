const { Auction } = require('../models');
const { blockchainService } = require('../services');

const handleAuctionConclusion = async (auction) => {

    try {
        await blockchainService.endAuction(auction.address);
        await Auction.findOneAndUpdate({ address: auction.address }, { $set: { status: "ended" } });
    } catch (err) {
        console.error(`❌ Failed to conclude auction ${auction.id}:`, err);
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