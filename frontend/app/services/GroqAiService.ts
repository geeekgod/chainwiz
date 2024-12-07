import { createGroq, GroqProvider } from "@ai-sdk/groq";
import { generateText, LanguageModelV1 } from "ai";

export class GroqAiService {
  private groq: GroqProvider;
  private model: LanguageModelV1;
  private systemPrompt: string;
  constructor() {
    this.groq = createGroq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    });
    this.model = this.groq("llama3-8b-8192");
    this.systemPrompt =
      "Your role is to analyze user intent and respond with the appropriate action. If user is asking a question, respond with 'ask'. If user wants to send a transaction, respond with 'transact'. If user wants to create a smart contract, respond with 'generateCode'. Just respond with the action, no need to explain yourself. Response should always be amonst these three actions only: ask, transact, generateCode.";
  }

  // Analyze user intent i.e. is user asking question then response should be "ask"
  // If user wants to send a transaction then response should be "transact"
  // if user wants to create a smart contract then response should be "generateCode"
  async analyzeUserIntent(userInput: string) {
    const response = await generateText({
      model: this.model,
      prompt: userInput,
      system: this.systemPrompt,
      temperature: 0.4,
    });

    return response.text;
  }

  async analyzeUserRequest(userInput: string) {
    const prompt = `
    Your role is to understand and analyze the user request.
    Valid responses are:
    - getBalance
    - getTransactions
    - getNFTs
    - getNFTFloorPrice
    - getGasFees
    - getGasSpending
    - getTokenPrice
    - getSwapRate
    - ask
    - transact
    - generateCode
    Your task is to only respond with the action, no need to explain yourself.
    Just respond with the action.
    `;
    const response = await generateText({
      model: this.model,
      prompt: userInput,
      system: prompt,
      temperature: 0.4,
    });
    return response.text;
  }
}
