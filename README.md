# Painting Represented as an NFT 

We are building an auction system where each painting is represented as an NFT and auctioned on the Ethereum blockchain.

## Technologies Used

### Smart Contracts
- **Solidity** – Language for writing the NFT and auction logic.
- **Hardhat** – Smart contract development, testing, and deployment framework.
- **OpenZeppelin** – Reusable and secure contract standards (ERC-721, Ownable, etc.).
- **Ethereum Sepolia Testnet** – Blockchain test network used for deployment and validation.

### Backend & Infrastructure
- **Node.js** – Backend server for handling API requests and orchestrating contract deployment.
- **MongoDB** – Stores auction metadata, bid history, and NFT references.
- **RabbitMQ** – Message broker used to queue and distribute blockchain events reliably.
- **Pinata (IPFS)** – Decentralized storage service for NFT assets like images and metadata.
- **Ethers.js** – Communicates with Ethereum network and smart contracts.
- **Docker** – Containerization for API services, workers, and event listeners.

## Backend Architecture

The backend architecture follows an event-driven, scalable design with the following components:

![image](https://github.com/user-attachments/assets/4b7d2fe3-6a61-4db9-be9d-2b55cfe611fd)

### 1. API Services
The API layer is responsible for exposing endpoints to:
- Create and manage auctions.
- Trigger smart contract interactions (e.g. deploy new auctions, place bids).
- Serve auction and user data from the database.

### 2. Event Listener
This service subscribes to blockchain events emitted from deployed smart contracts (e.g. `BidPlaced`, `AuctionEnded`). It pushes relevant events into a message queue (RabbitMQ) for asynchronous processing, ensuring the system remains responsive and robust to blockchain latency.

### 3. Message Broker (RabbitMQ)
RabbitMQ acts as a decoupled communication layer between event listeners and workers. It ensures reliable delivery and load-balancing of blockchain events to downstream consumers.

### 4. Workers
Workers consume messages from RabbitMQ and handle heavy-lifting tasks like:
- Updating auction state in MongoDB.
- Generating annotated NFT images (e.g. with winner's name and transaction hash).
- Uploading NFT assets to IPFS via Pinata.

### 5. Database (MongoDB)
MongoDB is used to persist auction metadata, user bids. It acts as the central data source for both the API and internal services.


## Backend's layout code
backend/
├── config/                 # Configs: env vars, constants, internal logic configs
│   ├── config.js
│   └── internal-code.js
│
├── contracts/              # ABI, contract addresses, compiled artifacts
│   └── PaintingAuction.json
│
├── controllers/           # Handle incoming requests & delegate to services
│   ├── auction.controller.js
│   ├── bidder.controller.js
│   └── index.js
│
├── events/                # Web3 event listeners
│   └── eventListener.js
│
├── jobs/                  # Cron jobs, scheduled or long-running tasks
│   └── handleAuction.js
│
├── middlewares/           # Express middlewares: auth, error handling, logging
│   └── ...
│
├── models/                # Database models
│   └── ...
│
├── routes/                # Define API routes & attach controllers
│   └── ...
│
├── services/              # Business logic, interact with blockchain/db/api
│   ├── auction.service.js
│   ├── bidder.service.js
│   ├── blockchain.service.js
│   ├── image.service.js
│   ├── ipfs.service.js
│   └── index.js
│
├── utils/                 # Helper functions/utilities (e.g., formatters, error handlers)
│   └── ...
│
├── validation/            # Joi schemas for request data validation
│   └── ...
│
├── workers/               # Background workers, queues (e.g., Bull, RabbitMQ)
│   └── index.js
│
└── index.js               # Entry point (e.g., Express/Koa app setup)


