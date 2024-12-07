import { AskResult, BrianSDK, GenerateCodeResult } from "@brian-ai/sdk";

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

  async ask(prompt: string): Promise<string> {
    const result = await this.brian.ask({
      prompt,
      kb: "public-knowledge-box",
    });

    return result.answer;
  }

  async analyzeUserIntent(userInput: string): Promise<BrianAIResponse> {
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

      return {
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
      throw error;
    }
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
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}
