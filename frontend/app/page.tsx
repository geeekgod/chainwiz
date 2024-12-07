'use client';

import Web3Provider from './providers/Web3Provider';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

export default function Home() {
  return (
    <Web3Provider>
      <div className="flex h-screen bg-[#1a1b1e]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white mb-1">
                  Send transactions
                </h1>
                <p className="text-gray-400 text-sm">
                  Swap your tokens, bridge them across many chains, and much more.
                </p>
              </div>
              <div className="bg-[#141517] rounded-lg shadow-lg overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Web3Provider>
  );
} 