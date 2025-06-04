const path = require('path');
const mongoose = require('mongoose');
const { ethers } = require('ethers');

const { v4: uuidv4 } = require('uuid');
const { Auction, Bidder } = require('../models');
const { ipfsService, imageService, blockchainService } = require('../services');

const { connectRabbitMQ } = require('../libs/rabbitmq');
const { mongoose: mongooseCfg } = require('../config/config');


let bidBuffer = [];
let flushTimeout = null;
let withdrawBuffer = [];
let withdrawFlushTimeout = null;

const flushBidBuffer = async () => {
    if (bidBuffer.length === 0) return;

    const bulkOps = [];
    for (const { contractAddress, bidder, amount } of bidBuffer) {
        const auction = await Auction.findOne({ address: contractAddress });
        if (!auction) continue;
        const amountInEther = ethers.formatEther(amount);

        const existing = await Bidder.findOne({ address: bidder, auctionId: auction.id });
        if (existing) {

            bulkOps.push({
                updateOne: {
                    filter: { id: existing.id },
                    update: { $inc: { amountBid: Number(amountInEther) } }
                }
            });
        } else {
            bulkOps.push({
                insertOne: {
                    document: {
                        id: uuidv4(),
                        amountBid: Number(amountInEther),
                        address: bidder,
                        auctionId: auction.id,
                        isRefuned: false,
                        isWinner: false
                    }
                }
            });
        }
    }

    if (bulkOps.length > 0) await Bidder.bulkWrite(bulkOps);
    bidBuffer = [];
};

const flushWithdrawBuffer = async () => {
    if (withdrawBuffer.length === 0) return;

    const auctionsMap = {};
    const ops = [];

    for (const { contractAddress, from } of withdrawBuffer) {
        let auction = auctionsMap[contractAddress];
        if (!auction) {
            auction = await Auction.findOne({ address: contractAddress });
            if (!auction) continue;
            auctionsMap[contractAddress] = auction;
        }

        ops.push({
            updateOne: {
                filter: { auctionId: auction.id, address: from },
                update: { isRefuned: true },
            }
        });
    }

    if (ops.length > 0) {
        await Bidder.bulkWrite(ops);
    }

    withdrawBuffer = [];
};

(async () => {
    await mongoose.connect(mongooseCfg.url, {
    });

    const conn = await connectRabbitMQ();
    const channel = await conn.createChannel();

    await channel.assertQueue('bid-events');
    await channel.assertQueue('nft-minted');
    await channel.assertQueue('withdrawn-events');
    await channel.assertQueue('auction-ended');
    await channel.assertQueue('refund-batch');

    channel.consume('bid-events', async (msg) => {
        const data = JSON.parse(msg.content.toString());
        bidBuffer.push(data);
        channel.ack(msg);

        if (!flushTimeout) {
            flushTimeout = setTimeout(async () => {
                await flushBidBuffer();
                flushTimeout = null;
            }, 500);
        }
    });

    channel.consume('withdrawn-events', async (msg) => {
        const data = JSON.parse(msg.content.toString());
        withdrawBuffer.push(data);
        channel.ack(msg);

        if (!withdrawFlushTimeout) {
            withdrawFlushTimeout = setTimeout(async () => {
                await flushWithdrawBuffer();
                withdrawFlushTimeout = null;
            }, 500); // flush every 500ms
        }
    });

    channel.consume('auction-ended', async (msg) => {
        const { contractAddress, winner: winnerAddress } = JSON.parse(msg.content.toString());
        channel.ack(msg);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Find auction + bidder
            const result = await Auction.aggregate([
                {
                    $match: {
                        address: contractAddress,
                    },
                },
                {
                    $lookup: {
                        from: "bidders",
                        let: { auctionId: "$id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$auctionId", "$$auctionId"],
                                    },
                                },
                            },
                            {
                                $match: {
                                    address: winnerAddress,
                                },
                            },
                        ],
                        as: "bidder",
                    },
                },
            ]);

            if (!result?.length || result[0].bidder.length === 0) {
                console.log("Auction or winner not found.");
                return;
            }
            const auction = result[0];
            const tokenURI = 'https://stevedsimkins.mypinata.cloud/ipfs/QmfKsRfqkWYuShSMDghMpLt8SQnWyPhDaEe8JUauM8E7Uz'; // hardcode for the image

            // 2. Mint NFT
            const txHash = await blockchainService.mintNFT(auction.address, winnerAddress, tokenURI);

            // 3. Generate image and upload to IPFS
            const outputPath = path.join(__dirname, `../anotation/${auction._id}.jpg`);

            await imageService.generateAnnotatedImage(path.join(__dirname, `../anotation/base.jpg`), outputPath, 'WINNER', txHash);

            const ipfsUrl = await ipfsService.uploadToPinata(outputPath);

            console.log(`Mint NFT to winner: ${ipfsUrl}`)
            // 4. Update auction
            await Auction.updateOne(
                { id: auction.id },
                {
                    $set: {
                        status: 'minted',
                        winnerAddress,
                        mintTxHash: txHash,
                        ipfsUrl,
                    },
                },
                { session }
            );

            // 5. Update winner bidder
            await Bidder.findOneAndUpdate(
                { address: winnerAddress, auctionId: auction.id },
                { $set: { isRefunded: true, isWinner: true } },
                { session }
            );

            await session.commitTransaction();


            channel.sendToQueue('refund-batch', Buffer.from(JSON.stringify({
                contractAddress,
                offset: 0,
                batchSize: 20
            })));

        } catch (err) {
            console.error('auction-ended failed', err);
            await session.abortTransaction();
            channel.nack(msg);
        } finally {
            session.endSession();
        }
    });

    channel.consume('refund-batch', async (msg) => {
        const { contractAddress, offset = 0, batchSize = 20, retry = 0 } = JSON.parse(msg.content.toString());

        try {
            const { txHash, events } = await blockchainService.refundBatch(contractAddress, offset, batchSize);
            console.log(`Refund batch success at offset ${offset}: ${txHash}`);

            if (events?.length > 0) {
                channel.sendToQueue('refund-batch', Buffer.from(JSON.stringify({
                    contractAddress,
                    offset: offset + batchSize,
                    batchSize,
                })));
            }

            channel.ack(msg);
        } catch (err) {
            console.error(`Refund batch failed at offset ${offset}:`, err);

            if (retry < 3) {
                setTimeout(() => {
                    channel.sendToQueue('refund-batch', Buffer.from(JSON.stringify({
                        contractAddress,
                        offset,
                        batchSize,
                        retry: retry + 1,
                    })));
                }, 5000);
            } else {
                console.error(`Refund batch failed permanently at offset ${offset}`);
            }

            channel.ack(msg);
        }
    });


})();

