import { AskResult, GenerateCodeResult, TransactionResult } from "@brian-ai/sdk";
import { BrianAIService, BrianAIResponse } from "./BrianAIService";
import { GroqAiService } from "./GroqAiService";
import { GetFloorPriceResponse } from 'alchemy-sdk';

import {
  UnifiedBridgeService,
  BridgeTransaction,
} from "./UnifiedBridgeService";
import { ethers } from "ethers";
import { AlchemyService } from './AlchemyService';
import { AssetTransfersCategory } from 'alchemy-sdk';
import { FloorPriceMarketplace } from 'alchemy-sdk';
import { SwapService } from './SwapService';

export interface AIAgentConfig {
  brianApiKey: string;
  bridgeContractAddress: string;
  provider: ethers.providers.Provider;
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
      
      // Balance queries
      if (lowercaseInput.includes('balance') || 
          lowercaseInput.includes('eth') || 
          lowercaseInput.includes('matic')) {
        
        // Get both balances regardless of query
        const ethBalance = await this.alchemyService.getBalance(address, 'ethereum');
        const maticBalance = await this.alchemyService.getBalance(address, 'polygon');
        
        // Format response based on query
        if (lowercaseInput.includes('matic')) {
          return {
            content: `Your Polygon balance: ${maticBalance} MATIC`,
            type: 'balance'
          };
        } else if (lowercaseInput.includes('eth')) {
          return {
            content: `Your Ethereum balance: ${ethBalance} ETH`,
            type: 'balance'
          };
        } else {
          return {
            content: `Your wallet balances:\nEthereum: ${ethBalance} ETH\nPolygon: ${maticBalance} MATIC`,
            type: 'balance'
          };
        }
      }

      // Token holdings query
      if (lowercaseInput.includes('tokens') && lowercaseInput.includes('own')) {
        const ethTokens = await this.alchemyService.getTokenBalances(address, 'ethereum');
        const polygonTokens = await this.alchemyService.getTokenBalances(address, 'polygon');
        
        const formatTokens = (tokens: any[]) => 
          tokens.map(t => `${t.formattedBalance} ${t.metadata.symbol}`).join('\n');

        return {
          content: `Your tokens:\n\nEthereum:\n${formatTokens(ethTokens)}\n\nPolygon:\n${formatTokens(polygonTokens)}`,
          type: 'tokens'
        };
      }

      // Transaction history query
      if (lowercaseInput.includes('transactions') || lowercaseInput.includes('recent')) {
        const transactions = await this.alchemyService.getTransactions(address, 'ethereum');
        
        const formatTx = (tx: any) => 
          `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)} | ${tx.value} ${tx.asset}`;

        return {
          content: `Recent transactions:\n${transactions.map(formatTx).join('\n')}`,
          type: 'transactions'
        };
      }

      // NFT features
      if (lowercaseInput.includes('nft')) {
        if (lowercaseInput.includes('collection') || lowercaseInput.includes('my nft')) {
          const nfts = await this.alchemyService.getNFTs(address);
          return {
            content: `Your NFTs:\n${nfts.ownedNfts.map(nft => 
              `${nft.name || 'Unnamed NFT'} (${nft.contract.address})`
            ).join('\n')}`,
            type: 'nfts'
          };
        }
        
        if (lowercaseInput.includes('floor price')) {
          // You'll need to extract contract address from the query
          const contractAddress = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'; // BAYC example
          const floorPrice = await this.alchemyService.getNFTFloorPrice(contractAddress);
          return {
            content: floorPrice && typeof (floorPrice as any).openSea?.floorPrice !== 'undefined' ? 
            `Floor price: ${(floorPrice as any).openSea.floorPrice} ${(floorPrice as any).openSea.priceCurrency || 'ETH'}` : 
            'Floor price not available',
            type: 'nft_price'
          };
        }
      }

      // Swap rate queries
      if (lowercaseInput.includes('swap') || lowercaseInput.includes('rate')) {
        try {
          // Default to 1 ETH if no amount specified
          const amount = (lowercaseInput.match(/\d+/) || ['1'])[0];
          const fromToken = lowercaseInput.includes('usdc') ? 'USDC' : 
                          lowercaseInput.includes('usdt') ? 'USDT' : 'ETH';
          const toToken = lowercaseInput.includes('to eth') ? 'ETH' :
                         lowercaseInput.includes('to usdt') ? 'USDT' : 'USDC';

          const sellAmount = fromToken === 'ETH' ? 
            ethers.utils.parseEther(amount).toString() :
            (Number(amount) * 1e6).toString(); // For USDC/USDT

          const quote = await this.swapService.getSwapQuote(
            this.swapService.getTokenSymbol(fromToken),
            this.swapService.getTokenSymbol(toToken),
            sellAmount
          );

          return {
            content: `Swap Quote for ${amount} ${fromToken} to ${toToken}:\nExpected Output: ${quote.price} ${toToken}\nPrice Impact: ${(Number(quote.priceImpact) * 100).toFixed(2)}%`,
            type: 'swap_quote'
          };
        } catch (error) {
          console.error('Swap quote error:', error);
          return {
            content: 'Error fetching swap quote. Please try again.',
            type: 'error'
          };
        }
      }

      // Fallback to Brian AI
      return await this.brianService.ask(input);
    } catch (error) {
      console.error('Error processing request:', error);
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

  async estimateActionGas(userInput: string): Promise<ethers.BigNumber> {
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
      const balance = await this.alchemyService.getBalance(address, 'ethereum');
      return balance;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      throw error;
    }
  }

  async getTokenBalances(address: string, network: 'ethereum' | 'polygon') {
    try {
      const tokens = await this.alchemyService.getTokenBalances(address, network);
      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
  }

  async getTransactionHistory(address: string, network: 'ethereum' | 'polygon') {
    try {
      const transactions = await this.alchemyService.getTransactions(address, network);
      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
}
