const { Bidder, Auction } = require('../models');


const getAuctionHistory = async (filter, options) => {
    const bidders = await Bidder.paginate(filter, options);
    const { results, totalPages, totalResults } = bidders;

    if (results.length === 0) {
        return { totalBidders: totalResults, bidders: [], totalPages };
    }

    // Get unique auction IDs
    const auctionIds = [...new Set(results.map(item => item.auctionId))];

    const auctions = await Auction.find({ id: { $in: auctionIds } });

    const auctionMap = {};
    auctions.forEach(auction => {
        auctionMap[auction.id] = auction;
    });

    // Merge auction info into each bidder
    const mergedResults = results.map(bidder => ({
        ...bidder.toObject(),
        auction: auctionMap[bidder.auctionId] || null
    }));

    return {
        totalBidders: totalResults,
        bidders: mergedResults,
        totalPages
    };
};

module.exports = {
    getAuctionHistory
}