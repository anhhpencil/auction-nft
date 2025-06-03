const catchAsync = require('../utils/catchAsync');
const { auctionService } = require('../services')

/**
 * Create a new auction. 
 * By calling to blockchain
 */
const createAuction = catchAsync(async (req, res) => {

    const { ipfsUrl, durationInSeconds, name, symbol } = req.body;

    await auctionService.createAuction(ipfsUrl, durationInSeconds, name, symbol);

    res.send({});
});

/**
 * Get auction by either id, or status if they are present otherwise we will query all.
 * We do pagination based on limit & page params 
 */
const getAuction = catchAsync(async (req, res) => {

    const { auctionId, status, limit = 1, page = 1 } = req.query;

    const filter = { auctionId };

    if (status) {
        filter.status = status
    }
    const options = {
        sortBy: 'createdAt:desc', // sort order
        limit: Math.min(1, limit), // maximum results per page
        page, // page number
    };


    const auctions = await auctionService.getAuction(filter, options);

    res.send(auctions);
});


/***
 * Get all bidders for an auction
 */
const getBidders = catchAsync(async (req, res) => {

    const { auctionId, limit = 1, page = 1 } = req.query;

    const filter = { auctionId };

    const options = {
        sortBy: 'createdAt:desc', // sort order
        limit: Math.min(1, limit), // maximum results per page
        page, // page number
    };

    const bidders = await auctionService.getBidders(filter, options);

    res.send(bidders);
});


module.exports = {
    createAuction,
    getAuction,
    getBidders
}