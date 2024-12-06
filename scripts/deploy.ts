import { ethers, run } from "hardhat";
import config from "../config/default";

async function main() {
  console.log("Deploying AI Bridge Agent contracts...");

  // Get the deployer account
  const deployer = ethers.Wallet.createRandom(); // Create a random wallet as signers is empty
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy the AI Bridge Agent contract
  const AIBridgeAgent = await ethers.getContractFactory("AIBridgeAgent");
  const bridgeInterface = config.networks.polygon.contracts.bridge;

  console.log("Deploying AIBridgeAgent...");
  const aiBridgeAgent = await AIBridgeAgent.deploy(bridgeInterface);
  await aiBridgeAgent.deployed();

  console.log("AIBridgeAgent deployed to:", aiBridgeAgent.address);

  // Verify contract on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("Verifying contract on Polygonscan...");
    await run("verify:verify", {
      address: aiBridgeAgent.address,
      constructorArgs: [bridgeInterface], // Fixed the key from constructorArguments to constructorArgs
    });
    console.log("Contract verified on Polygonscan");
  }
  console.log("Initializing contract settings...");

  // Set initial AI agent authorization
  const tx = await aiBridgeAgent.setAIAgentAuthorization(
    deployer.address,
    true
  );
  await tx.wait();
  console.log("Deployer authorized as AI agent");

  console.log("Deployment completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
