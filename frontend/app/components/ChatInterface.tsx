import { useState, useRef, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { AIAgentOrchestrator } from "../services/AIAgentOrchestrator";
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account } = useWeb3React();

  const orchestrator = new AIAgentOrchestrator({
    brianApiKey: process.env.NEXT_PUBLIC_BRIAN_API_KEY || "",
    bridgeContractAddress:
      process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || "",
    provider: new ethers.providers.JsonRpcProvider(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !account) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    let assistantMessage: Message;
    try {
      // Get gas estimate first
      // const estimatedGas = await orchestrator.estimateActionGas(input);

      // Process the user's request
      const { action, result } = await orchestrator.processUserRequest(input);

      if (action === "transact") {
        // Get explanation from AI
        const explanation = await orchestrator.getActionExplanation(result);

        assistantMessage = {
          role: "assistant",
          content: `Transaction successful!\n\nHash: ${result}\nExplanation: ${explanation}`,
          timestamp: new Date(),
        };
      } else if (action === "ask") {
        assistantMessage = {
          role: "assistant",
          content: result,
          timestamp: new Date(),
        };
      } else if (action === "generateCode") {
        assistantMessage = {
          role: "assistant",
          content: result,
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">
              {message.role === "user" ? "You" : "AI Agent"}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            !account
              ? "Please connect your wallet first"
              : "Type your message here..."
          }
          disabled={!account || isProcessing}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!account || isProcessing || !input.trim()}
          className={`px-4 py-2 rounded-lg ${
            !account || isProcessing
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-medium`}
        >
          {isProcessing ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
}
