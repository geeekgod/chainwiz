"use client";

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
import { BridgeResult, bridgeToken, initializeProvider } from "../utils/lxly";
import { ethers } from "ethers";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "pending" | "success" | "error";
  action?: string;
  meta?: AskResult | TransactionResult[] | GenerateCodeResult;
  transactionHash?: string;
}

interface TransactionData {
  sourceChain: string;
  destinationChain: string;
  tokenAddress: string;
  toAmount: string;
  fromAddress: string;
  toAddress: string;
}

const categories = [
  {
    icon: "💱",
    title: "Trading & Swaps",
    examples: [
      "Swap 100 USDC to ETH",
      "What's the best rate to swap ETH to USDT?",
      "Show me price impact for swapping 1000 USDC to ETH",
      "What's the current price of ETH in USD?"
    ]
  },
  {
    icon: "📊",
    title: "Portfolio & Balances",
    examples: [
      "Show my token balances",
      "What's my total portfolio value?",
      "Show my ETH balance across all chains",
      "List my recent transactions"
    ]
  },
  {
    icon: "🏦",
    title: "DeFi Operations",
    examples: [
      "What's the APY for USDC lending on Aave?",
      "Supply 100 USDC to Compound",
      "Show me the best yield farming opportunities",
      "What are the current gas fees?"
    ]
  },
  {
    icon: "🎨",
    title: "NFTs",
    examples: [
      "Show my NFT collection",
      "What's the floor price for Bored Apes?",
      "List trending NFT collections",
      "Transfer my NFT to another wallet"
    ]
  },
  {
    icon: "📈",
    title: "Market Insights",
    examples: [
      "What are the top gainers today?",
      "Show me trending tokens",
      "Analyze market sentiment for ETH",
      "What's the total crypto market cap?"
    ]
  },
  {
    icon: "🌉",
    title: "Cross-chain Actions",
    examples: [
      "Bridge 1 ETH to Polygon",
      "What are the best bridges for ETH to Arbitrum?",
      "Compare bridge fees across platforms",
      "Show my balances across all chains"
    ]
  },
  {
    icon: "👛",
    title: "Wallet Operations",
    examples: [
      "Send 0.1 ETH to 0x...",
      "Show my transaction history",
      "What's my gas spending this month?",
      "Set up a recurring payment"
    ]
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { account, library: provider } = useWeb3React();

  const aiOrchestrator = useMemo(() => {
    if (!account || !provider || !process.env.NEXT_PUBLIC_BRIAN_API_KEY)
      return null;
    return new AIAgentOrchestrator({
      brianApiKey: process.env.NEXT_PUBLIC_BRIAN_API_KEY,
      bridgeContractAddress: process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS!,
      provider,
      account,
    });
  }, [account, provider]);

  const handleTransaction = async (tx: Message["meta"]) => {
    try {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      // check if transaction is an array
      if (!Array.isArray(tx)) {
        throw new Error("Invalid transaction data");
      }

      const transaction = tx[0];

      const web3Provider = await initializeProvider();
      const txData = transaction.data;

      let result: BridgeResult | any;
      if (txData.fromAddress === txData.toAddress) {
        const bridgeParams = {
          sourceChain: txData.fromChainId,
          destinationChain: txData.toChainId,
          tokenAddress: txData.fromToken?.address,
          amount: txData.toAmount,
          walletAddress: account!,
          provider: web3Provider,
        };
        result = await bridgeToken(bridgeParams);
      } else {
        const transactionParams = {
          sourceChain: txData.toChainId,
          destinationChain: txData.fromChainId,
          fromAddress: txData.fromAddress,
          toAddress: txData.toAddress,
          fromToken: txData.fromToken?.address,
          toToken: txData.toToken?.address,
          amount: txData.fromAmount,
          provider: web3Provider,
        };
        // send token to the from address and chain to the destination chain and address
        // from metamask
        // use provider to send
        const signer = web3Provider.getSigner();
        const tx = await signer.sendTransaction({
          to: transactionParams.toAddress,
          value: transactionParams.amount,
          from: transactionParams.fromAddress,
        });
        result = {
          transactionHash: tx.hash,
          receipt: tx,
          estimatedGas: tx.gasLimit.toString(),
        };
      }
      // Update the last message with the transaction hash
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
          lastMessage.transactionHash = result.transactionHash;
          lastMessage.status = "success";
        }
        return newMessages;
      });

      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      // Update message status to error
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
          lastMessage.status = "error";
        }
        return newMessages;
      });
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !aiOrchestrator) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await aiOrchestrator.processUserRequest(input);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.result,
        timestamp: new Date(),
        action: response.action,
        meta: response.meta,
        status: "pending",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isLastMessage = index === messages.length - 1;
    const showTransactionButton =
      isLastMessage &&
      message.role === "assistant" &&
      message.action === "transact" &&
      message.meta &&
      Array.isArray(message.meta) &&
      message.meta.length > 0 &&
      !message.transactionHash;

    return (
      <div
        key={index}
        className={`p-4 ${
          message.role === "user"
            ? "bg-blue-50 dark:bg-blue-900"
            : "bg-white dark:bg-gray-800"
        } rounded-lg mb-4`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.transactionHash && (
              <div className="mt-2 text-sm text-gray-500">
                Transaction Hash: {message.transactionHash}
              </div>
            )}
            {showTransactionButton && (
              <button
                onClick={() => handleTransaction(message.meta)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Complete Transaction
              </button>
            )}
          </div>
          {message.status === "error" && (
            <span className="text-red-500 ml-2">Error</span>
          )}
        </div>
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <RotateCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {showPromptGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-purple-200 dark:border-purple-900 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-purple-100 dark:border-purple-900 pb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                 Prompt Guide
              </h2>
              <button 
                onClick={() => setShowPromptGuide(false)}
                className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {categories.map((category, index) => (
                <div key={index} className="group">
                  <div className="border dark:border-purple-900/50 rounded-xl p-4 bg-white dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                      <span className="text-xl">{category.icon}</span>
                      <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        {category.title}
                      </span>
                    </h3>
                    <ul className="space-y-2 pl-8">
                      {category.examples.map((example, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => handleExampleClick(example)}
                          className="text-gray-600 dark:text-gray-300 relative cursor-pointer 
                            transition-all duration-200 
                            hover:text-purple-600 dark:hover:text-purple-400 
                            hover:translate-x-1 
                            hover:bg-purple-50 dark:hover:bg-purple-900/30
                            rounded-lg py-1 px-2 -ml-2"
                        >
                          <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full 
                            bg-purple-400 dark:bg-purple-500 
                            transition-transform duration-200 
                            group-hover:scale-125"
                          ></span>
                          <span className="font-medium">"{example}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p>💡 Tip: You can use natural language - just ask as you would ask a human!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
