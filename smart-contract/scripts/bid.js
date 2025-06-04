const { ethers } = require("ethers");

const amountToBid = "0.001";
const auctionAddress = process.env.AUCTION_ADDRESS;

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const tx = await wallet.sendTransaction({
        to: auctionAddress,
        value: ethers.parseEther(amountToBid),
    });

    await tx.wait();
    console.log(`✅ Bid of ${amountToBid} ETH sent from ${wallet.address}. Tx: ${tx.hash}`);
}

main().catch(console.error);
