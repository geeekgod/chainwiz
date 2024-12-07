import { BrianAIService, BrianAIResponse } from "./BrianAIService";
import {
  UnifiedBridgeService,
  BridgeTransaction,
} from "./UnifiedBridgeService";
import { ethers } from "ethers";

export interface AIAgentConfig {
  brianApiKey: string;
  bridgeContractAddress: string;
  provider: ethers.providers.Provider;
}

export class AIAgentOrchestrator {
  private brianService: BrianAIService;
  private bridgeService: UnifiedBridgeService;

  constructor(config: AIAgentConfig) {
    this.brianService = new BrianAIService(config.brianApiKey);
    this.bridgeService = new UnifiedBridgeService(
      config.bridgeContractAddress,
      config.provider
    );
  }

  async processUserRequest(userInput: string): Promise<string> {
    try {
      const aiResponse = await this.brianService.analyzeUserIntent(userInput);
      const isValid = await this.brianService.validateAction(
        aiResponse.action,
        aiResponse.parameters
      );

      if (!isValid) {
        throw new Error("Action validation failed");
      }

      const transaction = this.convertAIResponseToBridgeTransaction(aiResponse);
      const isTransactionValid = await this.bridgeService.validateTransaction(
        transaction
      );

      if (!isTransactionValid) {
        throw new Error("Transaction validation failed");
      }

      return await this.bridgeService.initiateBridgeTransaction(transaction);
    } catch (error) {
      console.error("Error processing user request:", error);
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
}
