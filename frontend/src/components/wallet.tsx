"use client";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, WalletIcon } from "lucide-react";
import { Polygon, Ethereum } from "@thirdweb-dev/chain-icons";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import Jazzicon from "react-jazzicon";

const injected = new InjectedConnector({
  supportedChainIds: [1, 11155111, 137, 80002], // Ethereum, Sepolia, Polygon, Amoy
});

const NETWORKS = [
  {
    chainId: 1,
    name: "Ethereum",
    icon: <Ethereum className="w-4 h-4" />,
    symbol: "ETH",
  },
  {
    chainId: 11155111,
    name: "Sepolia",
    icon: <Ethereum className="w-4 h-4" />,
    symbol: "ETH",
  },
  {
    chainId: 137,
    name: "Polygon",
    icon: <Polygon className="w-4 h-4" />,
    symbol: "POL",
  },
  {
    chainId: 80002,
    name: "Amoy",
    icon: <Polygon className="w-4 h-4" />,
    symbol: "POL",
  },
];

export default function WalletConnect({
  isExpanded = false,
}: {
  isExpanded?: boolean;
}) {
  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  if (isExpanded) {
    return (
      <>
        <button
          className={`
            p-2 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200
            ${isConnected ? "text-purple-600 dark:text-purple-400" : ""}
          `}
          onClick={() => open()}
        >
          {isConnected ? (
            <div className="flex items-center gap-2">
              {/* Jazzicon */}
              <Jazzicon seed={parseInt(address ?? "0", 26)} />
              <p className="text-sm">{address?.slice(0, 6)}...</p>
            </div>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <button
        className="p-2 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
        onClick={() => open()}
      >
        <WalletIcon className="w-4 h-4" />
      </button>
    </>
  );
}
