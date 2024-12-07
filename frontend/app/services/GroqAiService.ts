import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export class GroqAiService {
  private groq: any;
  private model: any;
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
}
