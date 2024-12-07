import { ethers } from "ethers";
import {
  UnifiedBridgeService,
  BridgeTransaction,
} from "../services/UnifiedBridgeService";

export async function initializeProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new ethers.providers.Web3Provider(window.ethereum);
}

export interface BridgeTokenParams {
  sourceChain: number;
  destinationChain: number;
  tokenAddress: string;
  amount: string;
  walletAddress: string;
  provider: ethers.providers.Web3Provider;
}

export interface BridgeResult {
  transactionHash: string;
  receipt: ethers.providers.TransactionReceipt;
  estimatedGas: string;
}

export async function bridgeToken(
  params: BridgeTokenParams
): Promise<BridgeResult> {
  const {
    sourceChain,
    destinationChain,
    tokenAddress,
    amount,
    walletAddress,
    provider,
  } = params;

  console.log("sourceChain", sourceChain);
  console.log("destinationChain", destinationChain);
  console.log("tokenAddress", tokenAddress);
  console.log("amount", amount);
  console.log("walletAddress", walletAddress);

  // Get signer from provider
  const signer = provider.getSigner();

  // Initialize UnifiedBridgeService
  const bridgeService = new UnifiedBridgeService(
    process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS!,
    provider
  );

  try {
    // Get chain IDs
    const sourceChainId = sourceChain;
    const targetChainId = destinationChain;

    // Create bridge transaction
    const bridgeTransaction: BridgeTransaction = {
      token: tokenAddress,
      amount: ethers.utils.parseEther(amount).toString(),
      targetChainId,
      data: "0x", // Empty data for basic transfer
    };

    // Validate the transaction
    const isValid = await bridgeService.validateTransaction(bridgeTransaction);
    if (!isValid) {
      throw new Error("Invalid bridge transaction parameters");
    }

    // Approve token spending if needed
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
      ],
      signer
    );

    const approveTx = await tokenContract.approve(
      process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS,
      ethers.utils.parseEther(amount)
    );
    await approveTx.wait();

    // Estimate gas for the bridge transaction
    const estimatedGas = await bridgeService.estimateGas(bridgeTransaction);

    // Execute bridge transaction
    const txHash = await bridgeService.initiateBridgeTransaction(
      bridgeTransaction
    );

    // Wait for transaction confirmation
    const receipt = await provider.waitForTransaction(txHash);

    return {
      transactionHash: txHash,
      receipt,
      estimatedGas: estimatedGas.toString(),
    };
  } catch (error) {
    console.error("Bridge operation failed:", error);
    throw error;
  }
}

function getChainId(chainName: string): number {
  const chainMap: Record<string, number> = {
    ethereum: 1,
    sepolia: 11155111,
    polygon: 137,
    amoy: 80002,
  };

  const chainId = chainMap[chainName.toLowerCase()];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }

  return chainId;
}

// Additional utility functions for transaction status and validation
export async function checkTransactionStatus(
  txHash: string,
  provider: ethers.providers.Web3Provider
): Promise<boolean> {
  const bridgeService = new UnifiedBridgeService(
    process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS!,
    provider
  );
  return await bridgeService.isTransactionProcessed(txHash);
}

export async function validateBridgeParams(
  params: BridgeTokenParams
): Promise<boolean> {
  const bridgeService = new UnifiedBridgeService(
    process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS!,
    params.provider
  );

  const bridgeTransaction: BridgeTransaction = {
    token: params.tokenAddress,
    amount: ethers.utils.parseEther(params.amount).toString(),
    targetChainId: params.destinationChain,
    data: "0x",
  };

  return await bridgeService.validateTransaction(bridgeTransaction);
}
