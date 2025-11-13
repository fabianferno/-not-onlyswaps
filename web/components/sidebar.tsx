"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, Monitor, Settings, ArrowLeft } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-gray-800 flex flex-col p-6">
      {/* Navigation Links */}
      <nav className="space-y-4 flex-1 font-bold">
        <Link
          href="/swaps"
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            pathname === "/swaps" ? "text-orange-500" : "text-gray-200 hover:text-white"
          }`}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-400 transform -rotate-45"></div>
          <span>swaps</span>
        </Link>
        <Link
          href="/policies"
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            pathname === "/policies" ? "text-orange-500" : "text-gray-200 hover:text-white"
          }`}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-400 transform -rotate-45"></div>
          <span>policies</span>
        </Link>
        <Link
          href="/why-us"
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            pathname === "/why-us" ? "text-orange-500" : "text-gray-200 hover:text-white"
          }`}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-400 transform -rotate-45"></div>
          <span>why another solver?</span>
        </Link>
      </nav>
 

      {/* Connect Wallet Button */}
      <div className="w-full scale-60 -ml-10">
        <ConnectButton />
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-xs mt-3 pt-6 border-t border-gray-800">
        <p>Powered by</p>
        <div className="flex items-center justify-center gap-1 mt-1">
         
          <span className="font-bold">stateless</span>
        </div>
      </div>
    </div>
  )
}
