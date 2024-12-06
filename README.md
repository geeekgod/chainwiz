# Polygon AI Bridge Agent

A sophisticated AI agent built on Polygon that leverages Brian's AI capabilities and Polygon's Aggregated Blockchain technology with unified bridge integration.

## Features

- AI-powered agent using Brian (brianknows.org)
- Cross-chain transactions via Unified Bridge
- Integration with Polygon's Aggregated Blockchain
- Smart contract interactions across multiple chains
- Automated DeFi operations
- User-friendly interface for AI agent interactions

## Technical Stack

- **Blockchain**: Polygon POS Network
- **Bridge**: Unified Bridge (AggLayer)
- **AI Integration**: Brian API
- **Frontend**: Next.js + Ethers.js
- **Smart Contracts**: Solidity
- **Backend**: Node.js

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

- Node.js v16+
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
2. **Bridge Interface**: Manages cross-chain transactions using Unified Bridge
3. **DeFi Operations**: Handles automated DeFi interactions

## Security Considerations

- All sensitive operations require user confirmation
- API keys and private keys are stored securely
- Rate limiting for AI operations
- Secure bridge transaction validation

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines first.
