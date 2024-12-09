"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, polygon, polygonAmoy, sepolia } from "@reown/appkit/networks";

const projectId = "2e43366136cffcdebd7317135e404bf5";

// Create a metadata object
const metadata = {
  name: "ChainWiz",
  description: "Your Chat Companion, Simplified",
  url: "https://chainwiz.geeekgod.in",
  icons: ["https://chainwiz.geeekgod.in/logo.png"],
};

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [mainnet, polygon, polygonAmoy, sepolia],
  projectId,
  features: {
    analytics: true,
  },
});

export function AppKit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
