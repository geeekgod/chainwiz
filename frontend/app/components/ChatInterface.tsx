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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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
    </div>
  );
}
