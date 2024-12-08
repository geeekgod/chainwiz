import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";
export default function Header() {
  return (
    <header className="text-purple-600 bg-white dark:bg-[#1a1b1e]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="h-8 w-8 mr-2">
            <Image src="/logo-icon.png" alt="ChainWiz" width={32} height={32} />
          </Link>
          <span className="text-xl font-bold">ChainWiz</span>
        </div>
        <nav className="flex items-center gap-6">
          <ul className="flex space-x-6">
            <li>
              <Link
                href="#"
                className="hover:text-purple-200 dark:hover:text-purple-300 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-purple-200 dark:hover:text-purple-300 transition duration-300"
              >
                Features
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 transition duration-300"
            >
              Get Started
            </Link>
            {/* <ThemeToggle /> */}
          </div>
        </nav>
      </div>
    </header>
  );
}
