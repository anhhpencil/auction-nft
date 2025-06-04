# Painting Represented as an NFT 

We are building an auction system where each painting is represented as an NFT and auctioned on the Ethereum blockchain.

## 📚 Table of Contents

1. [Technologies Used](#technologies-used)  
   - [Smart Contracts](#smart-contracts)  
   - [Backend & Infrastructure](#backend--infrastructure)  
2. [Backend Architecture](#backend-architecture)  
   - [1. API Services](#1-api-services)  
   - [2. Event Listener](#2-event-listener)  
   - [3. Message Broker (RabbitMQ)](#3-message-broker-rabbitmq)  
   - [4. Workers](#4-workers)  
   - [5. Database (MongoDB)](#5-database-mongodb)  
3. [Backend Code Layout](#backend-code-layout)  
4. [API Endpoints](#api-endpoints)  
   - [Create an Auction](#create-an-auction)  
   - [Get Bidders in an Auction](#get-bidders-in-an-auction)  
5. [How to Run](#how-to-run)  
   - [Run the Backend Server](#1-run-the-backend-server)  
   - [Place a Bid (Smart Contract)](#2-trying-to-place-a-bid)  
6. [Improvements](#improvements)

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
```bash
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

```
## API Endpoints

### Create an auction
- **Endpoint:** `POST /api/v1/auction`
- **Description:** Create a new auction.

- **Request Body:**
  - `durationInSeconds`: The duration (in seconds) until the auction ends.
  - `name`: The name of the auction.
  - `symbol`: The symbol representing the auction.

- **Response:**
  - `200 OK`: Returns the created auction.
  - `400 Bad Request`: If there is a validation error.
  - `401 Unauthorized`: If the user is not authenticated.

- **Example:**

```bash
curl -X POST http://localhost:8080/api/v1/auction \
-H "Content-Type: application/json" \
-d '{"durationInSeconds": 300, "name": "PaintingNFT", "symbol": "PAINT"}'
```


## Get bidders in an auction

- **Endpoint:** `GET /api/v1/auction/bidders`
- **Description:** Retrieve all bidders for a specific auction.

- **Query Parameters:**
  - `auctionId` (required): The ID of the auction.
  - `limit` (optional): Number of bidders per page.
  - `page` (optional): Page number for pagination.

- **Response:**
  - `200 OK`: Returns a paginated list of bidders.
  - `400 Bad Request`: If `auctionId` is missing or invalid.
  - `401 Unauthorized`: If the user is not authenticated.

- **Example:**

```bash
curl -X GET "http://localhost:8080/api/v1/auction/bidders?auctionId=abc123&page=1&limit=10" \
-H "Content-Type: application/json"
```


## How to Run

### 1. Run the backend server

- Navigate to the `backend` folder:
  - Create a `.env` file from `.env.sample`
  - Build and start the services using Docker:
    ```bash
    docker buildx build --platform=linux/amd64 -t your-app-name . --no-cache
    docker compose up --build
    ```

- 🔗 **API available at**: [http://localhost:3000](http://localhost:3000)  
- 🐇 **RabbitMQ UI**: [http://localhost:15672](http://localhost:15672)  
  - Username/Password: `guest` / `guest`  
- 🗄️ **MongoDB connection**: `mongodb://localhost:27017`

- You can create an auction using the following endpoint:
  ```http
  POST /api/v1/auction
  ```

---

### 2. Trying to place a bid

- Navigate to the `smart-contract` folder:

  - Compile the smart contract:
    ```bash
    npx hardhat compile
    ```

  - Create a `.env` file from `.env.sample`

  - Navigate to the `scripts` folder

  - Try placing a bid using:
    ```bash
    npx hardhat run scripts/bid.js --network sepolia
    ```

# Improvements
- Implemented authentication for protected routes
- Investigated canvas library for annotation, but encountered compatibility issues with Docker on macOS