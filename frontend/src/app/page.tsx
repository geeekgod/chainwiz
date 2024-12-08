import Web3Provider from "@/providers/Web3Provider";
import ChatInterface from "@/components/chat";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <Web3Provider>
      <div className="flex h-screen dark:bg-[#1a1b1e]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold dark:text-white mb-1">
                  Your Chat Companion, Simplified
                </h1>
                <p className="dark:text-gray-400 text-sm">
                  Chat, Learn, Transact, Generate Code, and more.
                </p>
              </div>
              <div className="dark:bg-[#141517] rounded-lg shadow-lg overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Web3Provider>
  );
}
