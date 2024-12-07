import { useState, useRef, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { Mic, Send, ThumbsUp, ThumbsDown, Copy, RotateCw } from "lucide-react";
import { AIAgentOrchestrator } from "../services/AIAgentOrchestrator";
import ReactMarkdown from "react-markdown";
import {
  AskResult,
  GenerateCodeResult,
  TransactionResult,
} from "@brian-ai/sdk";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "pending" | "success" | "error";
  action?: string;
  meta?: AskResult | TransactionResult[] | GenerateCodeResult;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account, library } = useWeb3React();

  console.log("account & library", account, library);

  const orchestrator = useMemo(() => {
    if (!account || !library) return null;
    return new AIAgentOrchestrator({
      brianApiKey: process.env.NEXT_PUBLIC_BRIAN_API_KEY || "",
      bridgeContractAddress:
        process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || "",
      provider: library,
      account: account,
    });
  }, [account, library]);

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

    try {
      if (!orchestrator) throw new Error("Orchestrator not initialized");

      const response = await orchestrator.processUserRequest(input);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.result,
        timestamp: new Date(),
        status: "success",
        action: response.action,
        meta: response.meta,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        timestamp: new Date(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-4">
        {messages.map((message, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                {message.role === "user" ? "👤" : "🤖"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-300">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
            {message.role === "assistant" && message.action === "transact" && (
              <div className="ml-11 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                  <ThumbsDown className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
              Supported Actions ⌘
            </button>
            <button className="px-3 py-1 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600">
              Prompt Guide 📝
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <Mic className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !account
                  ? "Please connect your wallet first"
                  : "Start typing here! Try something like 'I want to swap 10 USDC for ETH'"
              }
              disabled={!account || isProcessing}
              className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!account || isProcessing || !input.trim()}
              className={`p-3 rounded-lg ${
                !account || isProcessing || !input.trim()
                  ? "text-gray-500 bg-gray-800 cursor-not-allowed"
                  : "text-white bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
