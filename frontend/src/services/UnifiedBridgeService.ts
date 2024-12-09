import { ethers } from "ethers";
import { AIBridgeAgent } from "../types/contracts";

export interface BridgeTransaction {
  token: string;
  amount: string;
  targetChainId: number;
  data: string;
}

export class UnifiedBridgeService {
  private contract: AIBridgeAgent;
  private provider: ethers.JsonRpcProvider;

  constructor(contractAddress: string, provider: ethers.JsonRpcProvider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      [
        "function initiateBridgeTransaction(address _token, uint256 _amount, uint256 _targetChainId, bytes calldata _data) external",
        "function isTransactionProcessed(bytes32 _txHash) external view returns (bool)",
      ],
      this.provider
    ) as AIBridgeAgent;
  }

  async initiateBridgeTransaction(
    transaction: BridgeTransaction
  ): Promise<string> {
    try {
      const tx = await this.contract.initiateBridgeTransaction(
        transaction.token,
        transaction.amount,
        transaction.targetChainId,
        transaction.data
      );

      const receipt = await this.provider.getTransactionReceipt(tx);
      return (await receipt.getTransaction()).hash;
    } catch (error) {
      console.error("Error initiating bridge transaction:", error);
      throw error;
    }
  }

  async isTransactionProcessed(txHash: string): Promise<boolean> {
    try {
      return await this.contract.isTransactionProcessed(txHash);
    } catch (error) {
      console.error("Error checking transaction status:", error);
      throw error;
    }
  }

  async estimateGas(
    transaction: BridgeTransaction
  ): Promise<ethers.BigNumberish> {
    try {
      return await this.contract.estimateGas(
        transaction.token,
        transaction.amount,
        transaction.targetChainId,
        transaction.data
      );
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw error;
    }
  }

  async validateTransaction(transaction: BridgeTransaction): Promise<boolean> {
    try {
      if (!ethers.isAddress(transaction.token)) {
        throw new Error("Invalid token address");
      }

      const amount = ethers.parseEther(transaction.amount);
      if (amount <= 0) {
        throw new Error("Invalid amount");
      }

      const supportedChains = [1, 11155111, 137, 80002]; // Ethereum, Sepolia, Polygon, Amoy
      if (!supportedChains.includes(transaction.targetChainId)) {
        throw new Error("Unsupported target chain");
      }

      await this.estimateGas(transaction);
      return true;
    } catch (error) {
      console.error("Transaction validation failed:", error);
      return false;
    }
  }
}
