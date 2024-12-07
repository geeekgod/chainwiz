"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { Send, RotateCw, Mic, ThumbsDown, ThumbsUp, Copy } from "lucide-react";
import { AIAgentOrchestrator } from "../services/AIAgentOrchestrator";
import ReactMarkdown from "react-markdown";
import {
  AskResult,
  GenerateCodeResult,
  TransactionResult,
} from "@brian-ai/sdk";
import { BridgeResult, bridgeToken, initializeProvider } from "../utils/lxly";
import { parseEther } from "ethers/lib/utils";

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
      "What's the current price of ETH in USD?",
    ],
  },
  {
    icon: "📊",
    title: "Portfolio & Balances",
    examples: [
      "Show my token balances",
      "What's my total portfolio value?",
      "Show my ETH balance across all chains",
      "List my recent transactions",
    ],
  },
  {
    icon: "🏦",
    title: "DeFi Operations",
    examples: [
      "What's the APY for USDC lending on Aave?",
      "Supply 100 USDC to Compound",
      "Show me the best yield farming opportunities",
      "What are the current gas fees?",
    ],
  },
  {
    icon: "🎨",
    title: "NFTs",
    examples: [
      "Show my NFT collection",
      "What's the floor price for Bored Apes?",
      "List trending NFT collections",
      "Transfer my NFT to another wallet",
    ],
  },
  {
    icon: "📈",
    title: "Market Insights",
    examples: [
      "What are the top gainers today?",
      "Show me trending tokens",
      "Analyze market sentiment for ETH",
      "What's the total crypto market cap?",
    ],
  },
  {
    icon: "🌉",
    title: "Cross-chain Actions",
    examples: [
      "Bridge 1 ETH to Polygon",
      "What are the best bridges for ETH to Arbitrum?",
      "Compare bridge fees across platforms",
      "Show my balances across all chains",
    ],
  },
  {
    icon: "👛",
    title: "Wallet Operations",
    examples: [
      "Send 0.1 ETH to 0x...",
      "Show my transaction history",
      "What's my gas spending this month?",
      "Set up a recurring payment",
    ],
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(
    JSON.parse(localStorage.getItem("messagesChainWiz") || "[]")
  );
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
    console.log(tx);
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
        console.log(
          `Transaction is a bridge transaction hence transferring from ${txData.fromAddress} to ${txData.toAddress}
          source chain ${txData.fromChainId} to destination chain ${txData.toChainId}
          token ${txData.fromToken?.address} to ${txData.toToken?.address}
          amount ${txData.toAmount}
          wallet address ${account}
          `
        );
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
        console.log(
          `Transaction is not a bridge transaction hence transferring from ${txData.fromAddress} to ${txData.toAddress}
          source chain ${txData.fromChainId} to destination chain ${txData.toChainId}
          token ${txData.fromToken?.address} to ${txData.toToken?.address}
          amount ${txData.fromAmount}
          wallet address ${account}
          `
        );
        const transactionParams = {
          sourceChain: txData.fromChainId,
          destinationChain: txData.toChainId,
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

  const handleExampleClick = (example: string) => {
    setInput(example);
    setShowPromptGuide(false);
    handleSend();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        // Optional: Add some visual feedback that the copy was successful
        console.log("Message copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy message:", err);
      });
  };

  console.log(messages);

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
      <div key={index} className="flex flex-col gap-4">
        <div
          className={`flex items-start gap-3 ${
            message.role === "user" ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-700 flex items-center justify-center">
            {message.role === "user" ? "👤" : "🤖"}
          </div>
          <div
            className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}
          >
            <div
              className={`flex items-center gap-2 mb-1 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {message.role === "user" ? "You" : "AI Assistant"}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div
              className={`prose dark:prose-invert max-w-none ${
                message.role === "user"
                  ? "bg-purple-600 text-white p-3 rounded-lg inline-block ml-auto"
                  : ""
              }`}
            >
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
          </div>
        </div>
        {message.role === "assistant" && (
          <div className="ml-11 flex items-center gap-2">
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ThumbsDown className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCopyMessage(message.content)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      // store messages in local storage
      localStorage.setItem("messagesChainWiz", JSON.stringify(messages));
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]">
      <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-4">
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {/* <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
              Supported Actions ⌘
            </button> */}
            <button
              onClick={() => setShowPromptGuide(true)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Prompt Examples 📝
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Mic className="h-5 w-5" />
            </button> */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                !account
                  ? "Please connect your wallet first"
                  : "Start typing here!"
              }
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              className="p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <RotateCw className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showPromptGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-3xl w-full border border-purple-200 dark:border-purple-900 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-purple-100 dark:border-purple-900 pb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Prompt Guide
              </h2>
              <button
                onClick={() => setShowPromptGuide(false)}
                className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
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
                            hover:bg-purple-200 dark:hover:bg-purple-900/30
                            rounded-lg py-1 px-2 -ml-2 flex items-center gap-6"
                        >
                          <span className="font-medium">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p>
                  💡 Tip: You can use natural language - just ask as you would
                  ask a human!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
