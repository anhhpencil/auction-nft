const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;
const bidderSchema = new Schema(
    {
        id: { type: String, required: true, unique: true, default: uuidv4 },
        amountBid: { type: Number, required: true, default: 0 },
        address: { type: String, required: true },
        auctionId: { type: String, required: true },
        isRefunded: { type: Boolean, default: false },
        isWinner: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Create index
bidderSchema.index({ address: 1 })
bidderSchema.index({ auctionId: 1 })

// add plugin that converts mongoose to json
bidderSchema.plugin(toJSON);
bidderSchema.plugin(paginate);

module.exports = mongoose.model('Bidder', bidderSchema);
