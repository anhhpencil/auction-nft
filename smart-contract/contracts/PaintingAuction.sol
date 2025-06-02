// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PaintingAuction is ERC721URIStorage, ReentrancyGuard {
    uint public endTime;
    address public winner;
    bool public auctionEnded;
    bool public nftMinted;

    uint public tokenId;

    mapping(address => uint) public bids;
    address[] private bidders;

    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    event FundsWithdrawn(address indexed bidder, uint amount);
    event NFTMinted(address indexed to, uint tokenId);

    constructor(
        string memory name,
        string memory symbol,
        uint _durationInSeconds
    ) ERC721(name, symbol) {
        endTime = block.timestamp + _durationInSeconds;
    }

    modifier onlyBeforeEnd() {
        require(block.timestamp < endTime, "Auction ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= endTime, "Auction not yet ended");
        _;
    }

    receive() external payable {
        bid();
    }

    function bid() public payable onlyBeforeEnd {
        require(msg.value > 0, "No ETH sent");
        if (bids[msg.sender] == 0) {
            bidders.push(msg.sender);
        }
        bids[msg.sender] += msg.value;
        emit BidPlaced(msg.sender, msg.value);
    }

    function endAuction() public onlyAfterEnd {
        require(!auctionEnded, "Already ended");

        uint highestBid = 0;
        address highestBidder;

        for (uint i = 0; i < bidders.length; i++) {
            address addr = bidders[i];
            uint totalBid = bids[addr];
            if (totalBid > highestBid) {
                highestBid = totalBid;
                highestBidder = addr;
            }
        }

        auctionEnded = true;
        winner = highestBidder;
        emit AuctionEnded(winner, highestBid);
    }

    function mintNFT(string memory tokenURI) public onlyAfterEnd nonReentrant {
        require(msg.sender == winner, "Only winner can mint");
        require(!nftMinted, "Already minted");

        tokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftMinted = true;
        emit NFTMinted(msg.sender, tokenId);
    }

    function withdraw() public onlyAfterEnd nonReentrant {
        require(msg.sender != winner, "Winner cannot withdraw");
        uint amount = bids[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    // Optional: to get all bidders (not gas-efficient)
    function getBidders(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (address[] memory, uint256 nextOffset, uint256 totalBidders)
    {
        totalBidders = bidders.length;
        uint256 size = limit;
        if (size == 0) {
            size = 1;
        }

        if (size > totalBidders - offset) {
            size = totalBidders - offset;
        }

        address[] memory listBidder = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            listBidder[i] = bidders[offset + i];
        }

        return (listBidder, offset + size, totalBidders);
    }
}
