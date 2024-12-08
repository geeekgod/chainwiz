import {
  AskResult,
  BrianSDK,
  ExtractParametersResult,
  TransactionResult,
} from "@brian-ai/sdk";

export interface BrianAIResponse {
  action: string;
  parameters: {
    tokenAddress?: string;
    amount?: string;
    targetChain?: number;
    additionalData?: string;
    [key: string]: string | number | undefined;
  };
  confidence: number;
  reasoning: string;
  suggestedPrompt?: string;
}

type GenerateCodeResult = {
  result: {
    contract: string;
    contractName: string;
  };
  abi: ContractABI[];
  bytecode: `0x${string}`;
};

type TokenMetadata = {
  address: string;
  symbol: string;
  decimals: number;
};

type ContractABI = {
  name: string;
  type: string;
  inputs: Array<{
    name: string;
    type: string;
    indexed?: boolean;
    components?: Array<{
      name: string;
      type: string;
    }>;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
  stateMutability?: string;
  anonymous?: boolean;
};

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

  async askWithKnowledgeBox(prompt: string): Promise<AskResult> {
    const result = await this.brian.ask({
      prompt,
      kb: "public-knowledge-box",
    });
    return result;
  }

  async extract(prompt: string): Promise<ExtractParametersResult> {
    const result = await this.brian.extract({
      prompt,
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
          targetChain: parseInt(completion.chain),
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
    parameters: Record<string, string | number>
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
      const result = (await this.brian.generateCode(
        {
          prompt,
        },
        false
      )) as unknown as GenerateCodeResult;
      return {
        result: {
          contract: result.result?.contract,
          contractName: result.result?.contractName,
        },
        abi: result.abi,
        bytecode: result.bytecode,
      };
    } catch (error) {
      console.error("Error generating smart contract:", error);
      return {
        result: null,
        abi: [],
        bytecode: "0x",
      };
    }
  }
}
