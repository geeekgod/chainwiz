import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk";
import { ethers } from "ethers";

export class AlchemyService {
  private ethereumAlchemy: Alchemy;
  private polygonAlchemy: Alchemy;

  constructor() {
    this.ethereumAlchemy = new Alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY!,
      network: Network.ETH_MAINNET,
    });

    this.polygonAlchemy = new Alchemy({
      apiKey: process.env.NEXT_PUBLIC_POLYGON_ALCHEMY_KEY!,
      network: Network.MATIC_MAINNET,
    });
  }

  async getBalance(
    address: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const balance = await alchemy.core.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  }

  async getTokenBalances(
    address: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const balances = await alchemy.core.getTokenBalances(address);

      // Get token metadata for each token
      const tokensWithMetadata = await Promise.all(
        balances.tokenBalances.map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );
          return {
            ...token,
            metadata,
            formattedBalance: ethers.utils.formatUnits(
              token.tokenBalance || "0",
              metadata.decimals || 18
            ),
          };
        })
      );

      return tokensWithMetadata;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      throw error;
    }
  }

  async getTransactions(
    address: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const transfers = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
        ],
        maxCount: 10,
      });

      return transfers.transfers;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  async getNFTs(address: string, network: "ethereum" | "polygon" = "ethereum") {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const nfts = await alchemy.nft.getNftsForOwner(address);
      return nfts;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      throw error;
    }
  }

  async getNFTFloorPrice(
    contractAddress: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const floorPrice = await alchemy.nft.getFloorPrice(contractAddress);
      return floorPrice;
    } catch (error) {
      console.error("Error fetching floor price:", error);
      throw error;
    }
  }

  async getGasFees(network: "ethereum" | "polygon" = "ethereum") {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const gasPrice = await alchemy.core.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, "gwei");
    } catch (error) {
      console.error("Error fetching gas fees:", error);
      throw error;
    }
  }

  async getGasSpending(
    address: string,
    network: "ethereum" | "polygon" = "ethereum"
  ) {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const transfers = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [AssetTransfersCategory.EXTERNAL],
        maxCount: 100,
      });

      let totalGas = 0;
      transfers.transfers.forEach(async (tx) => {
        // get gas price from hash
        const receipt = await alchemy.core.getTransactionReceipt(tx.hash);
        const gasPrice = receipt?.gasUsed;
        console.log("receipt", "gasPrice", receipt, gasPrice, Number(gasPrice));
        if (gasPrice) totalGas += Number(gasPrice);
      });

      return ethers.utils.formatUnits(totalGas.toString(), "gwei");
    } catch (error) {
      console.error("Error calculating gas spending:", error);
      throw error;
    }
  }

  async getTokenPrice(address: string, network: "ethereum" | "polygon") {
    try {
      const alchemy =
        network === "ethereum" ? this.ethereumAlchemy : this.polygonAlchemy;
      const tokenPrice = await alchemy.nft.getFloorPrice(address);
      return tokenPrice;
    } catch (error) {
      console.error("Error fetching token price:", error);
      throw error;
    }
  }
}
