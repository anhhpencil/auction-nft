const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;
const userSchema = new Schema(
    {
        id: { type: String, required: true, unique: true, default: uuidv4 },
        username: { type: String, required: true },
        address: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Create index
userSchema.index({ address: 1 })
userSchema.index({ username: 1 })

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

module.exports = mongoose.model('Bidder', userSchema);
