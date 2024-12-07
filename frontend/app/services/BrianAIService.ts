import {
  AskResult,
  BrianSDK,
  GenerateCodeResult,
  TransactionResult,
} from "@brian-ai/sdk";

export interface BrianAIResponse {
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  reasoning: string;
  suggestedPrompt?: string;
}

export class BrianAIService {
  private brian: BrianSDK;

  constructor(apiKey: string) {
    this.brian = new BrianSDK({
      apiKey,
      apiUrl: process.env.NEXT_PUBLIC_BRIAN_API_URL,
    });
  }

  async ask(prompt: string): Promise<AskResult> {
    const result = await this.brian.ask({
      prompt,
      kb: "public-knowledge-box",
    });

    return result;
  }

  async analyzeUserIntent(userInput: string): Promise<BrianAIResponse> {
    let response: BrianAIResponse;
    try {
      // First extract parameters
      const extractResult = await this.brian.extract({
        prompt: userInput,
      });

      // Then get detailed explanation using ask
      const askResult = await this.brian.ask({
        prompt: userInput,
        kb: "public-knowledge-box",
      });

      const [completion] = extractResult.completion;

      response = {
        action: completion.action,
        parameters: {
          tokenAddress: completion.token1,
          amount: completion.amount,
          targetChain: completion.chain,
          additionalData: completion.token2 || "0x",
        },
        confidence: 1.0,
        reasoning: askResult.answer,
      };
    } catch (error) {
      console.error("Error analyzing user intent:", error);
      response = {
        action: "",
        parameters: {},
        confidence: 0,
        reasoning:
          "Sorry, I encountered an error analyzing your intent. Please try again.",
      };
    }
    return response;
  }

  async getChainId(chain: string): Promise<string> {
    const result = await this.brian.ask({
      prompt: `What is the chain ID for ${chain}? Just respond with the chain ID only not anything else. If you can't find the chain ID, respond with -1.`,
      kb: "public-knowledge-box",
    });
    return result.answer;
  }

  async getTransaction(
    prompt: string,
    address: string
  ): Promise<TransactionResult[]> {
    let result: TransactionResult[];
    try {
      result = await this.brian.transact({
        prompt,
        address,
      });
    } catch (error) {
      console.error("Error getting transaction:", error);
      result = [];
    }
    return result;
  }

  async validateAction(
    action: string,
    parameters: Record<string, any>
  ): Promise<boolean> {
    try {
      const prompt = `Validate this blockchain action:
        Action: ${action}
        Parameters: ${JSON.stringify(parameters)}
        Chain: ${parameters.targetChain}
        
        Respond with VALID or INVALID only.`;

      const result = await this.brian.ask({
        prompt,
        kb: "public-knowledge-box",
      });

      return result.answer.toUpperCase().includes("VALID");
    } catch (error) {
      console.error("Error validating action:", error);
      return false;
    }
  }

  async explainDecision(txHash: string): Promise<string> {
    try {
      const result = await this.brian.ask({
        prompt: `Explain the transaction ${txHash} on Polygon network in detail.`,
        kb: "public-knowledge-box",
      });

      return result.answer;
    } catch (error) {
      console.error("Error getting explanation:", error);
      return "Sorry, I encountered an error getting the explanation.";
    }
  }

  async generateSmartContract(prompt: string): Promise<GenerateCodeResult> {
    try {
      const result = await this.brian.generateCode({
        prompt,
      });

      return result;
    } catch (error) {
      console.error("Error generating smart contract:", error);
      return {
        result: "",
        abi: [],
        bytecode: "0x",
      };
    }
  }
}
