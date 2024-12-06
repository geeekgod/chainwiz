export default {
  // Network configurations
  networks: {
    polygon: {
      rpc: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      chainId: 137,
      contracts: {
        bridge: process.env.BRIDGE_CONTRACT_ADDRESS,
      },
    },
    amoy: {
      rpc: process.env.AMOY_RPC_URL || "https://polygon-amoy.drpc.org",
      chainId: 80002,
      contracts: {
        bridge: process.env.AMOY_BRIDGE_CONTRACT_ADDRESS,
      },
    },
  },

  // Brian AI configuration
  brian: {
    apiKey: process.env.BRIAN_API_KEY,
    baseUrl: "https://api.brianknows.org",
  },

  // Bridge configuration
  bridge: {
    supportedTokens: {
      MATIC: {
        polygon: "0x0000000000000000000000000000000000001010",
        amoy: "0x0000000000000000000000000000000000001010",
      },
      USDC: {
        polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        amoy: "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62",
      },
    },
    supportedChains: [1, 137, 80002], // Ethereum, Polygon, Amoy
    minGasBuffer: 1.2, // 20% buffer for gas estimation
  },

  // Security configuration
  security: {
    maxTransactionAmount: "1000000", // in USD
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Frontend configuration
  frontend: {
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    defaultGasLimit: "300000",
    defaultGasPrice: "40", // in gwei
  },
};
