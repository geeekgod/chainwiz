import { Contract } from "ethers";

export interface AIBridgeAgent extends Contract {
  initiateBridgeTransaction(
    token: string,
    amount: string,
    targetChainId: number,
    data: string
  ): Promise<string>; // Returns transaction hash as string

  isTransactionProcessed(txHash: string): Promise<boolean>;
}
