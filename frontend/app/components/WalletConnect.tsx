import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Polygon, Ethereum } from "@thirdweb-dev/chain-icons";

const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80002], // Ethereum, Polygon, Amoy
});

const NETWORKS = {
  1: {
    name: "Ethereum",
    icon: <Ethereum className="w-4 h-4" />,
    symbol: "ETH",
  },
  137: {
    name: "Polygon",
    icon: <Polygon className="w-4 h-4" />,
    symbol: "POL",
  },
  80002: {
    name: "Amoy",
    icon: <Polygon className="w-4 h-4" />,
    symbol: "POL",
  },
};

export default function WalletConnect({
  inPortal = false,
}: {
  inPortal?: boolean;
}) {
  const { active, account, chainId, activate, deactivate } = useWeb3React();
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected).catch((error: Error) => {
          setError(error.message);
        });
      }
    });
  }, [activate]);

  const connect = async () => {
    try {
      await activate(injected);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const disconnect = () => {
    try {
      deactivate();
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const currentNetwork = useMemo(() => {
    return chainId ? NETWORKS[chainId as keyof typeof NETWORKS] : null;
  }, [chainId]);

  if (inPortal) return;

  return (
    <div className="relative wallet-connect">
      {active ? (
        <div className="space-y-2">
          <div className="relative">
            <div
              className="flex items-center justify-between p-2 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
            >
              <div className="flex items-center space-x-2">
                {currentNetwork && currentNetwork.icon}
                <span className="dark:text-gray-300 text-sm">
                  {currentNetwork?.name || "Unknown Network"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            {isNetworkDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20"
                  onClick={() => setIsNetworkDropdownOpen(false)}
                />
                <div className="absolute left-0 bottom-0 right-0 mt-1 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 max-h-[200px] scrollbar-hide overflow-y-auto">
                  {Object.entries(NETWORKS).map(([chainIdKey, network]) => (
                    <button
                      key={chainIdKey}
                      onClick={() => {
                        const provider = window.ethereum;
                        if (provider) {
                          provider
                            .request({
                              method: "wallet_switchEthereumChain",
                              params: [
                                {
                                  chainId: `0x${Number(chainIdKey).toString(
                                    16
                                  )}`,
                                },
                              ],
                            })
                            .catch(console.error);
                        }
                        setIsNetworkDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <span className="text-lg">{network.icon}</span>
                      <span>{network.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="dark:text-gray-300 text-sm font-mono">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      ) : (
        <button
          onClick={connect}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Connect Wallet
        </button>
      )}

      {error && <p className="mt-2 text-xs text-red-500">Error: {error}</p>}

      {isDropdownOpen && active && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={disconnect}
            className="w-full px-4 py-2 text-sm text-left text-red-400 dark:hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
