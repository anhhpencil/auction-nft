const catchAsync = require('../utils/catchAsync');
const { bidderService } = require('../services')

/**
 * Get aution history. We can use this endpoint either for get all autions for a bidder 
 * or get all bidders for an aution
 */
const getAuctionHistory = catchAsync(async (req, res) => {

    const { bidderAddress } = req.user // This one need get from JWT token, will improve in next version
    const { auctionId, page = 1, limit = 1 } = req.query;

    const filter = { address: bidderAddress };

    if (auctionId) {
        filter['auctionId'] = auctionId
    }

    const options = {
        sortBy: 'createdAt:desc', // sort order
        limit: Math.min(1, limit), // maximum results per page
        page, // page number
    };

    await bidderService.getAuctionHistory(filter, options);

    res.send({});
});


module.exports = {
    getAuctionHistory
}