import Header from "@/components/header";
import { ArrowRight, Wallet, BarChart3, Boxes } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "ChainWiz",
  description: "Your Blockchain Chat Companion, Simplified",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-purple-600">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container relative px-4 mx-auto">
          <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your Blockchain Chat Companion, Simplified
            </h1>
            <p className="mt-6 text-lg leading-8 text-purple-100">
              Navigate the blockchain ecosystem with ease. Track balances,
              manage transactions, and explore NFTs - all through a simple chat
              interface.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/app"
                className="px-6 py-3 text-lg font-semibold text-purple-600 bg-white rounded-full hover:bg-purple-50 transition duration-300 flex items-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-[#1a1b1e]">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-2 border-gray-200 rounded-xl p-6 transition duration-300 hover:shadow-lg">
              <Wallet className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Know It All</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your balances across multiple chains in real-time. Access
                your complete transaction history with ease.
              </p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-6 transition duration-300 hover:shadow-lg">
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Act with Clarity</h3>
              <p className="text-gray-600 dark:text-gray-400  ">
                Compare gas fees instantly and manage your NFT collection with
                detailed insights.
              </p>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-6 transition duration-300 hover:shadow-lg">
              <Boxes className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Cross-Chain Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Navigate seamlessly across multiple chains without the
                complexity of switching platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-purple-50 dark:bg-[#1a1b1e]">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-white">
            Start Your Blockchain Journey Today
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-400">
            Join thousands of users who have simplified their blockchain
            experience with ChainWiz.
          </p>
          <Link
            href="/app"
            className="w-[16rem] px-6 py-3 justify-center text-lg font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition duration-300 flex items-center mx-auto"
          >
            Start Chatting Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
