import { Contract } from 'ethers';

export interface AIBridgeAgent extends Contract {
    initiateBridgeTransaction(
        token: string,
        amount: string,
        targetChainId: number,
        data: string
    ): Promise<any>;
    
    isTransactionProcessed(txHash: string): Promise<boolean>;
} 