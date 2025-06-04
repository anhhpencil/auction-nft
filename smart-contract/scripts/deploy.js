// scripts/deploy.js
const hre = require("hardhat");

async function main(durationInSeconds = 300) { // default is 5 minutes
    const PaintingAuction = await hre.ethers.getContractFactory("PaintingAuction");
    const auction = await PaintingAuction.deploy("PaintingNFT", "PAINT", durationInSeconds);
    await auction.waitForDeployment();

    console.log("Auction deployed to:", await auction.getAddress());
    console.log("Auction ends at (timestamp):", (await auction.endTime()).toString());
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
