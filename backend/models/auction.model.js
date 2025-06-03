const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;
const auctionSchema = new Schema(
    {
        id: { type: String, required: true, unique: true, default: uuidv4 },
        endsAt: { type: Date, required: true },
        address: { type: String, required: true },
        ipfsUrl: { type: String, required: true },
        winnerAddress: { type: String },
        mintTxHash: { type: String },
        status: { type: String, default: 'active' }, // 'active' | 'ended' | 'minted'
    },
    {
        timestamps: true,
    }
);

// Create index
auctionSchema.index({ address: 1 })
auctionSchema.index({ endsAt: 1 })

// add plugin that converts mongoose to json
auctionSchema.plugin(toJSON);
auctionSchema.plugin(paginate);

module.exports = mongoose.model('Auction', auctionSchema);
