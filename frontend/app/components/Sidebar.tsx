"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import WalletConnect from "./WalletConnect";
import {
  Home,
  Search,
  Wallet,
  CreditCard,
  Beaker,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function Sidebar() {
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarExpanded");
    setIsExpanded(savedState === "true");
    setHasMounted(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebarExpanded", newState.toString());
  };

  if (!hasMounted) {
    return (
      <div
        className={`w-[80px] bg-white dark:bg-[#111111] flex flex-col h-screen relative border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ease-in-out z-50`}
      >
        {/* Minimal loading state */}
      </div>
    );
  }

  return (
    <div
      className={`${
        isExpanded ? "w-[280px]" : "w-[80px]"
      } bg-white dark:bg-[#111111] flex flex-col h-screen relative border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ease-in-out z-50`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-8 bg-purple-500 text-white rounded-full p-1.5 hover:bg-purple-600 transition-colors duration-200"
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-center">
        <Image
          width={100}
          height={100}
          src={"/logo.svg"}
          alt="Logo"
          className={`h-8 transition-all duration-300 ${
            isExpanded ? "w-auto" : "w-8"
          }`}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <NavItem icon={<Home />} label="Home" isExpanded={isExpanded} />
        <NavItem icon={<Search />} label="Explore" isExpanded={isExpanded} />
        <NavItem icon={<Wallet />} label="Wallet" isExpanded={isExpanded} />
        <NavItem
          icon={<CreditCard />}
          label="Transactions"
          isExpanded={isExpanded}
        />

        <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <NavItem
            icon={<Beaker />}
            label="Test Mode"
            isExpanded={isExpanded}
          />
          <NavItem
            icon={<ShieldCheck />}
            label="Security"
            isExpanded={isExpanded}
          />
          <NavItem
            icon={<AlertCircle />}
            label="Support"
            isExpanded={isExpanded}
          />
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
        {isExpanded ? (
          <WalletConnect inPortal={false} />
        ) : (
          <>
            {typeof window !== "undefined" &&
              createPortal(<WalletConnect inPortal={true} />, document.body)}
          </>
        )}
        <div className="mt-4 flex items-center justify-between text-gray-700 dark:text-gray-300">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            className="p-2 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// NavItem component for cleaner code
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
}

function NavItem({ icon, label, isExpanded }: NavItemProps) {
  return (
    <a
      href="#"
      className={`
        flex items-center space-x-3 text-gray-700 dark:text-gray-300 p-3 rounded-xl
        hover:bg-gradient-to-r from-purple-500/10 to-transparent
        hover:text-purple-600 dark:hover:text-purple-400
        transition-all duration-200 group
        ${!isExpanded ? "justify-center" : ""}
      `}
    >
      <div className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      {isExpanded && (
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      )}
    </a>
  );
}
