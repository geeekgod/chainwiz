'use client';

import Web3Provider from './providers/Web3Provider';
import WalletConnect from './components/WalletConnect';
import ChatInterface from './components/ChatInterface';

export default function Home() {
    return (
        <Web3Provider>
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            AI Bridge Agent
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Interact with the Polygon network using natural language
                        </p>
                        <WalletConnect />
                    </div>
                    <ChatInterface />
                </div>
            </main>
        </Web3Provider>
    );
} 