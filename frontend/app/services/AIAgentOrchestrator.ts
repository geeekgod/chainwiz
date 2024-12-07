import { BrianAIService, BrianAIResponse } from "./BrianAIService";
import { GroqAiService } from "./GroqAiService";
import {
  UnifiedBridgeService,
  BridgeTransaction,
} from "./UnifiedBridgeService";
import { ethers } from "ethers";

export interface AIAgentConfig {
  brianApiKey: string;
  bridgeContractAddress: string;
  provider: ethers.providers.Provider;
  account: string;
}

export interface ProcessUserRequestResult {
  action: string;
  result: string;
}

export class AIAgentOrchestrator {
  private brianService: BrianAIService;
  private bridgeService: UnifiedBridgeService;
  private groqService: GroqAiService;
  private account: string;

  constructor(config: AIAgentConfig) {
    this.brianService = new BrianAIService(config.brianApiKey);
    this.bridgeService = new UnifiedBridgeService(
      config.bridgeContractAddress,
      config.provider
    );
    this.groqService = new GroqAiService();
    this.account = config.account;
  }

  async processUserRequest(
    userInput: string
  ): Promise<ProcessUserRequestResult> {
    try {
      const aiResponse = await this.groqService.analyzeUserIntent(userInput);
      console.log("aiResponse", aiResponse);

      if (aiResponse === "ask") {
        const result = await this.brianService.ask(userInput);
        return {
          action: "ask",
          result: result,
        };
      } else if (aiResponse === "transact") {
        const aiResponse = await this.brianService.analyzeUserIntent(userInput);
        console.log("aiResponse", aiResponse);

        // const isValid = await this.brianService.validateAction(
        //   aiResponse.action,
        //   aiResponse.parameters
        // );

        // if (!isValid) throw new Error("Action validation failed");

        // const chainId = await this.brianService.getChainId(
        //   aiResponse.parameters.targetChain
        // );

        // if (chainId === "-1")
        //   throw new Error("Invalid chain, please try again.");

        // const transaction =
        //   this.convertAIResponseToBridgeTransaction(aiResponse);

        const transaction = await this.brianService.getTransaction(
          userInput,
          this.account
        );

        console.log("transaction", transaction);

        const result = transaction[0].data.description;

        return {
          action: "transact",
          result: result,
        };

        // const isTransactionValid = await this.bridgeService.validateTransaction(
        //   transaction
        // );

        // if (!isTransactionValid)
        //   throw new Error("Transaction validation failed");

        // const result = await this.bridgeService.initiateBridgeTransaction(
        //   transaction
        // );
        return {
          action: "transact",
          result: result,
        };
      } else if (aiResponse === "generateCode") {
        const result = await this.brianService.generateSmartContract(userInput);
        return {
          action: "generateCode",
          result: result.result,
        };
      }
      throw new Error("Invalid action");
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
