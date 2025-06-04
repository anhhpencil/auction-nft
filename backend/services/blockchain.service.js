const { ethers } = require('ethers');
const AuctionArtifact = require('../contracts/PaintingAuction.json');

const { blockchain } = require('../config/config')
const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);
const signer = new ethers.Wallet(blockchain.adminKey, provider);


const getAuctionContract = (address, abi) => {
    return new ethers.Contract(address, abi, signer);
}

const deployAuction = async (duration, name, symbol) => {
    const factory = new ethers.ContractFactory(AuctionArtifact.abi, AuctionArtifact.bytecode, signer);
    const contract = await factory.deploy(name, symbol, duration);
    await contract.waitForDeployment();
    return contract.target;
};
const endAuction = async (contractAddress) => {
    const contract = getAuctionContract(contractAddress, AuctionArtifact.abi);
    await contract.endAuction();
};
const mintNFT = async (contractAddress, toAddress, tokenURI) => {
    const contract = getAuctionContract(contractAddress, AuctionArtifact.abi);
    const tx = await contract.mintNFT(tokenURI, toAddress);
    const receipt = await tx.wait();
    return receipt.hash;
};

async function refundBatch(contractAddress, offset, limit) {
    const contract = getAuctionContract(contractAddress, AuctionArtifact.abi);

    const tx = await contract.refundBatch(offset, limit, {
    });

    const receipt = await tx.wait();
    return {
        txHash: receipt.hash,
        events: receipt.logs,
    };
}


module.exports = {
    deployAuction,
    endAuction,
    mintNFT,
    refundBatch,
}