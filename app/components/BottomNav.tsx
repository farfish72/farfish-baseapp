"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBoxOpen,
  FaCoins,
  FaTasks,
  FaUser,
} from "react-icons/fa";

const items = [
  { href: "/", label: "Home", icon: FaHome, color: "from-primary-400 to-blue-400" },
  { href: "/chest", label: "Chest", icon: FaBoxOpen, color: "from-amber-400 to-orange-400" },
  { href: "/stake", label: "Stake", icon: FaCoins, color: "from-green-400 to-emerald-400" },
  { href: "/steam", label: "Steam", icon: FaTasks, color: "from-accent-400 to-pink-400" },
  { href: "/profile", label: "Profile", icon: FaUser, color: "from-indigo-400 to-purple-400" },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 animate-slide-up">
      <div className="glass-card rounded-t-3xl px-2 py-2.5 shadow-premium-lg border-t border-white/20 backdrop-blur-xl">
        {/* Enhanced top accent line with branding */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 rounded-full opacity-80 shadow-glow"></div>
        
        {/* Subtle branding text */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-medium text-white/60 whitespace-nowrap">
          FarFISH © 2026 • Built on <span className="gradient-text font-semibold">Base</span>
        </div>
        
        <ul className="flex justify-between items-center">
          {items.map((item, index) => {
            const active = path === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-1 
                    text-xs font-semibold
                    transition-all duration-300 ease-out
                    py-1.5 px-2 rounded-2xl
                    group relative overflow-hidden
                    ${active 
                      ? `bg-gradient-to-br ${item.color} text-white scale-105 shadow-lg` 
                      : "text-gray-400 hover:text-white hover:scale-105"
                    }
                  `}
                >
                  {/* Hover shimmer effect */}
                  {!active && (
                    <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  )}
                  
                  <div className={`
                    relative p-1.5 rounded-xl transition-all duration-300
                    ${active 
                      ? "bg-white/20 backdrop-blur-sm shadow-inner-glow" 
                      : "group-hover:bg-white/10"
                    }
                  `}>
                    <Icon size={16} className="relative z-10" />
                    
                    {/* Active glow effect */}
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse"></div>
                    )}
                  </div>
                  
                  <span className={`
                    text-[9px] font-bold tracking-wider uppercase relative z-10
                    ${active ? "text-white" : "text-gray-400 group-hover:text-white/90"}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-1 rounded-full bg-white animate-pulse shadow-glow"></div>
                    </div>
                  )}
                  
                  {/* Hover indicator */}
                  {!active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-0.5 h-0.5 rounded-full bg-white/60"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
