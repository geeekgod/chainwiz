import {
  AskResult,
  GenerateCodeResult,
  TransactionResult,
} from "@brian-ai/sdk";
import { BrianAIService, BrianAIResponse } from "./BrianAIService";
import { GroqAiService } from "./GroqAiService";

import {
  UnifiedBridgeService,
  BridgeTransaction,
} from "./UnifiedBridgeService";
import { ethers } from "ethers";
import { AlchemyService } from "./AlchemyService";
import { SwapService } from "./SwapService";

export interface AIAgentConfig {
  brianApiKey: string;
  bridgeContractAddress: string;
  provider: ethers.JsonRpcProvider;
  account: string;
}

export interface ProcessUserRequestResult {
  action: string;
  result: string;
  meta?: AskResult | TransactionResult[] | GenerateCodeResult;
}

export class AIAgentOrchestrator {
  private brianService: BrianAIService;
  private bridgeService: UnifiedBridgeService;
  private groqService: GroqAiService;
  private account: string;
  private alchemyService: AlchemyService;
  private swapService: SwapService;

  constructor(config: AIAgentConfig) {
    this.brianService = new BrianAIService(config.brianApiKey);
    this.bridgeService = new UnifiedBridgeService(
      config.bridgeContractAddress,
      config.provider
    );
    this.groqService = new GroqAiService();
    this.account = config.account;
    this.alchemyService = new AlchemyService();
    this.swapService = new SwapService();
  }

  async processUserRequest(input: string, address: string) {
    try {
      const lowercaseInput = input.toLowerCase();

      const userRequest = await this.groqService.analyzeUserRequest(input);

      if (userRequest === "getBalance") {
        // Get both balances regardless of query
        const ethBalance = await this.alchemyService.getBalance(
          address,
          "ethereum"
        );
        const maticBalance = await this.alchemyService.getBalance(
          address,
          "polygon"
        );

        // Format response based on query
        if (lowercaseInput.includes("matic")) {
          return {
            content: `Your Polygon balance: ${maticBalance} MATIC`,
            type: "balance",
            meta: maticBalance,
          };
        } else if (lowercaseInput.includes("eth")) {
          return {
            content: `Your Ethereum balance: ${ethBalance} ETH`,
            type: "balance",
          };
        } else {
          return {
            content: `Your wallet balances:\nEthereum: ${ethBalance} ETH\nPolygon: ${maticBalance} MATIC`,
            type: "balance",
            meta: { ethBalance, maticBalance },
          };
        }
      }

      if (userRequest === "getGasFees") {
        const gasFees = await this.alchemyService.getGasFees();
        return {
          content: `Current gas fees: ${gasFees}`,
          type: "gas_fees",
          meta: gasFees,
        };
      }

      if (userRequest === "getGasSpending") {
        const gasSpending = await this.alchemyService.getGasSpending(address);
        return {
          content: `Your gas spending: ${gasSpending}`,
          type: "gas_spending",
          meta: gasSpending,
        };
      }

      if (userRequest === "getTokenPrice") {
        const tokenPrice = await this.alchemyService.getTokenPrice(
          address,
          "ethereum"
        );
        return {
          content: `Current token price: ${tokenPrice}`,
          type: "token_price",
          meta: tokenPrice,
        };
      }

      if (userRequest === "getNFTs") {
        const nfts = await this.alchemyService.getNFTs(address);
        if (nfts.ownedNfts.length === 0) {
          return {
            content: "You don't have any NFTs",
            type: "nfts",
            meta: nfts,
          };
        }
        return {
          content: `Your NFTs:\n${nfts.ownedNfts
            .map((nft) => nft.name)
            .join("\n")}`,
          type: "nfts",
          meta: nfts,
        };
      }

      if (userRequest === "getTransactions") {
        const transactions = await this.alchemyService.getTransactions(
          address,
          "ethereum"
        );
        return {
          content: `Your transactions:\n${transactions
            .map((tx) => tx.hash)
            .join("\n")}`,
          type: "transactions",
          meta: transactions,
        };
      }

      // NFT features
      if (userRequest === "getNFTFloorPrice") {
        // You'll need to extract contract address from the query
        const contractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"; // BAYC example
        const floorPrice = await this.alchemyService.getNFTFloorPrice(
          contractAddress
        );
        return {
          content:
            floorPrice &&
            typeof (floorPrice as any).openSea?.floorPrice !== "undefined"
              ? `Floor price: ${(floorPrice as any).openSea.floorPrice} ${
                  (floorPrice as any).openSea.priceCurrency || "ETH"
                }`
              : "Floor price not available",
          type: "nft_price",
          meta: floorPrice,
        };
      }

      // Swap rate queries
      if (userRequest === "getSwapRate") {
        const brianResponse = await this.brianService.extract(input);
        const swapRate = await this.swapService.getSwapQuote(
          brianResponse.completion[0].token1 || "",
          brianResponse.completion[0].token2 || "",
          brianResponse.completion[0].amount || ""
        );
        return {
          content: `Swap rate: ${swapRate}`,
          type: "swap_rate",
          meta: swapRate,
        };
      }

      if (userRequest === "transact") {
        const transaction = await this.brianService.getTransaction(
          input,
          address
        );
        return {
          content: transaction[0].data.description,
          type: "transaction",
          meta: transaction,
        };
      }

      if (userRequest === "generateCode") {
        const code = await this.brianService.generateSmartContract(input);
        return {
          content: code.result.contract,
          type: "code",
          meta: code,
        };
      }

      // Fallback to Brian AI
      const brianResponse = await this.brianService.ask(input);
      return {
        content: brianResponse.answer,
        type: "ask",
        meta: brianResponse,
      };
    } catch (error) {
      console.error("Error processing request:", error);
      throw error;
    }
  }

  private convertAIResponseToBridgeTransaction(
    aiResponse: BrianAIResponse
  ): BridgeTransaction {
    const { parameters } = aiResponse;
    return {
      token: parameters.tokenAddress,
      amount: parameters.amount,
      targetChainId: parameters.targetChain,
      data: parameters.additionalData || "0x",
    };
  }

  async getActionExplanation(txHash: string): Promise<string> {
    try {
      const isProcessed = await this.bridgeService.isTransactionProcessed(
        txHash
      );
      if (!isProcessed) {
        throw new Error("Transaction not yet processed");
      }
      return await this.brianService.explainDecision(txHash);
    } catch (error) {
      console.error("Error getting action explanation:", error);
      throw error;
    }
  }

  async estimateActionGas(userInput: string): Promise<ethers.BigNumberish> {
    try {
      const aiResponse = await this.brianService.analyzeUserIntent(userInput);
      const transaction = this.convertAIResponseToBridgeTransaction(aiResponse);
      return await this.bridgeService.estimateGas(transaction);
    } catch (error) {
      console.error("Error estimating action gas:", error);
      throw error;
    }
  }

  async getEthBalance(address: string) {
    try {
      const balance = await this.alchemyService.getBalance(address, "ethereum");
      return balance;
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      throw error;
    }
  }

  async getTokenBalances(address: string, network: "ethereum" | "polygon") {
    try {
      const tokens = await this.alchemyService.getTokenBalances(
        address,
        network
      );
      return tokens;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      throw error;
    }
  }

  async getTransactionHistory(
    address: string,
    network: "ethereum" | "polygon"
  ) {
    try {
      const transactions = await this.alchemyService.getTransactions(
        address,
        network
      );
      return transactions;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  }
}
