# Polygon AI Bridge Agent

A sophisticated AI-powered bridge agent built on Polygon that leverages Brian's AI capabilities for cross-chain transactions and DeFi operations. The system integrates with Polygon's Aggregated Blockchain technology and provides a unified bridge interface for seamless cross-chain interactions.

## Key Features

### AI Capabilities

- Intelligent transaction analysis and routing using Brian AI
- Natural language processing for user commands
- Smart contract code generation
- Automated parameter extraction and validation
- Real-time market analysis and recommendations

### Cross-Chain Operations

- Seamless token bridging between supported chains: (WIP)
  - Ethereum (Mainnet)
  - Polygon (POS)
  - Sepolia Testnet
  - Amoy Testnet
- Gas optimization across chains
- Transaction validation and security checks
- Bridge fee estimation

### DeFi Integration

- Token swaps with best rate finding
- Portfolio management and tracking
- Real-time token price feeds
- Gas fee optimization
- NFT operations and floor price tracking

### User Interface

- Intuitive chat-based interface
- Real-time transaction status updates
- Portfolio visualization
- Transaction history tracking
- Prompt suggestions and examples

## Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15.0.4
- **Web3 Integration**: Ethers.js 5.7.2
- **Wallet Connection**: Web3-React 6.1.9
- **UI Components**: TailwindCSS 3.4.1
- **AI Integration**: @brian-ai/sdk 0.3.5, @ai-sdk/groq 1.0.6

### Blockchain Infrastructure

- **Primary Network**: Polygon POS
- **Bridge Protocol**: Unified Bridge (AggLayer)
- **Smart Contracts**: Solidity 0.8.28
- **Contract Framework**: Hardhat 2.19.4
- **Testing**: Chai & Mocha

### AI Services

- **Core AI**: Brian API (brianknows.org)
- **Language Model**: Groq LLM
- **Knowledge Base**: Public blockchain data

## Project Structure

```
.
├── contracts/           # Smart contracts
├── frontend/           # Next.js frontend application
├── scripts/            # Deployment and test scripts
├── test/              # Test files
└── config/            # Configuration files
```

## Prerequisites

- Node.js v18+
- Hardhat
- Metamask wallet
- Brian API key
- Polygon Amoy (POS) testnet/Mainnet RPC

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
4. Add your API keys and configuration to `.env`

## Development

1. Start the local hardhat node:

   ```bash
   npx hardhat node
   ```

2. Deploy contracts:

   ```bash
   npx hardhat run scripts/deploy.js --network polygon
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Architecture

The system consists of three main components:

1. **AI Agent Core**: Interfaces with Brian's API for intelligent decision-making
2. **Bridge Interface**: Manages cross-chain transactions using Unified Bridge (WIP)
3. **DeFi Operations**: Handles automated DeFi interactions

## Security Considerations

- All sensitive operations require user confirmation
- API keys are stored securely
- Rate limiting for AI operations
- Secure bridge transaction validation (WIP)

## License

MIT
