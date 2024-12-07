import { useWeb3React } from "@web3-react/core";
import WalletConnect from "./WalletConnect";
import { Home, Search, Wallet, CreditCard, Beaker, ShieldCheck, AlertCircle, LogOut, Sun } from "lucide-react";

export default function Sidebar() {
  const { account } = useWeb3React();

  return (
    <div className="w-[240px] bg-[#141517] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <img src="/logo.svg" alt="Logo" className="h-8" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <Search className="h-5 w-5" />
          <span>Explore</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <Wallet className="h-5 w-5" />
          <span>Wallet</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <CreditCard className="h-5 w-5" />
          <span>Transactions</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <Beaker className="h-5 w-5" />
          <span>Test Mode</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Security</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
        >
          <AlertCircle className="h-5 w-5" />
          <span>Support</span>
        </a>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-800">
        <WalletConnect />
        <div className="mt-4 flex items-center justify-between text-gray-400">
          <button className="p-2 hover:text-white rounded-lg hover:bg-gray-800">
            <Sun className="h-5 w-5" />
          </button>
          <button className="p-2 hover:text-white rounded-lg hover:bg-gray-800">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 