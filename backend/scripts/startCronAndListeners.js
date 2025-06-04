const mongoose = require('mongoose');

const cron = require('node-cron');
const { endAuctionJob } = require('../jobs/handleAuction');
const { listenToEvents } = require('../events/eventListener');
const { Auction } = require('../models');
const { mongoose: mongooseCfg } = require('../config/config');
(async () => {
    await mongoose.connect(mongooseCfg.url, {
    });
    console.log('✅ Connected to MongoDB');

    Auction.watch([{ $match: { operationType: 'insert' } }])
        .on('change', async (data) => {
            const newAuction = data.fullDocument;
            if (newAuction.status === 'active') {
                console.log(`🆕 Detected new Auction: ${newAuction.address}`);
                await listenToEvents(newAuction.address);
            }
        });

    // Run cron every minute
    cron.schedule('* * * * *', async () => {
        console.log('🔄 Running auction ending cronjob...');
        await endAuctionJob();
    });

    // Start listeners for all auctions
    const auctions = await Auction.find({ status: 'active' }).limit(100); // Should improve this
    for (const auction of auctions) {
        console.log(`📡 Listening to events for ${auction.address}`);
        await listenToEvents(auction.address);
    }
})();