const ApiError = require('../utils/ApiError');
const { STATUS_CODE } = require('../config/internal-code');

const { Auction, Bidder } = require('../models');

const blockchainService = require('./blockchain.service');

const createAuction = async (durationInSeconds, name, symbol) => {
    // Do we should consider different name and symbol?
    const auctionAddress = await blockchainService.deployAuction(durationInSeconds, name, symbol)
    const endsTime = new Date(Date.now() + durationInSeconds * 1000);
    console.log(`Deploy succesfull to : ${auctionAddress}`);
    const newAuction = await Auction.create({
        address: auctionAddress,
        endsAt: endsTime,
    })

    return { auctionAddress, auctionId: newAuction.id, endsAt: newAuction.endsAt, };
};

const getAuction = async (filter, options) => {
    const auctions = await Auction.paginate(filter, options);
    const { results, totalPages, totalResults } = auctions;

    return { totalBook: totalResults, auctions: results, totalPages };
}

const getBidders = async (filter, options) => {
    const auction = await Auction.findOne({ id: filter.auctionId });
    if (!auction) {
        throw new ApiError(STATUS_CODE.EXISTED_VALUE, 'The auction has not existed.');
    }


    const bidders = await Bidder.paginate(filter, options);
    const { results, totalPages, totalResults } = bidders;


    return { totalBook: totalResults, bidders: results, totalPages };

}

module.exports = {
    createAuction,
    getAuction,
    getBidders,
}