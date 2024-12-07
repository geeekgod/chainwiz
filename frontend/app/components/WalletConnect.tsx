import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";

const injected = new InjectedConnector({
  supportedChainIds: [1, 137, 80002], // Ethereum, Polygon, Amoy
});

export default function WalletConnect() {
  const { active, account, activate, deactivate } = useWeb3React();
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col items-center gap-2">
      {active ? (
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600">
            Connected with{" "}
            <span className="font-mono">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
          </p>
          <button
            onClick={disconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}
    </div>
  );
}
