const { ethers } = require('ethers');
const AuctionArtifact = require('../contracts/PaintingAuction.json');

const { blockchain } = require('../config/config')
const provider = new ethers.JsonRpcProvider(blockchain.rpcUrl);
const signer = new ethers.Wallet(blockchain.adminKey, provider);


const getAuctionContract = (address) => {
    return new ethers.Contract(address, abi, signer);
}

const deployAuction = async (duration, name, symbol) => {
    const duration = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
    const factory = new ethers.ContractFactory(AuctionArtifact.abi, AuctionArtifact.bytecode, signer);
    const contract = await factory.deploy(name, symbol, duration);
    await contract.waitForDeployment();
    return contract.target;
};
const endAuction = async (contractAddress) => {
    const contract = getAuctionContract(contractAddress);
    await contract.endAuction();
};
const mintNFT = async (contractAddress, toAddress, tokenURI) => {
    const contract = getAuctionContract(contractAddress);
    const tx = await contract.mintNFT(tokenURI, toAddress);
    const receipt = await tx.wait();
    return receipt.hash;
};

async function refundBatch(contractAddress, offset, limit) {
    const contract = getAuctionContract(contractAddress);

    const estimatedGas = await contract.estimateGas.refundBatch(offset, limit);
    const tx = await contract.refundBatch(offset, limit, {
        gasLimit: estimatedGas.mul(12).div(10), // +20% buffer
    });

    const receipt = await tx.wait();
    return {
        txHash: receipt.transactionHash,
        events: receipt.logs,
    };
}


module.exports = {
    deployAuction,
    endAuction,
    mintNFT,
    refundBatch,
}