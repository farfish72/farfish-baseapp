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
  { href: "/", label: "Home", icon: FaHome },
  { href: "/chest", label: "Chest", icon: FaBoxOpen },
  { href: "/stake", label: "Stake", icon: FaCoins },
  { href: "/steam", label: "Steam", icon: FaTasks },
  { href: "/profile", label: "Profile", icon: FaUser },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50">
      <div className="glass-card rounded-t-3xl border-t border-primary/20 backdrop-blur-xl">
        {/* Clean top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full opacity-80"></div>
        
        <ul className="flex justify-between items-center px-2 py-3">
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
                    py-2 px-2 rounded-2xl
                    group relative overflow-hidden
                    min-h-[44px] min-w-[44px]
                    ${active 
                      ? `bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black scale-105` 
                      : "text-white/60 hover:text-white interactive-scale"
                    }
                  `}
                >
                  <div className={`
                    relative rounded-xl transition-all duration-300 p-1.5
                    ${active 
                      ? "bg-white/20 backdrop-blur-sm" 
                      : "group-hover:bg-surface"
                    }
                  `}>
                    <Icon size={16} className="relative z-10" />
                  </div>
                  
                  <span className={`
                    text-[9px] font-bold tracking-wider uppercase relative z-10 leading-tight
                    ${active ? "text-black" : "text-white/60 group-hover:text-white"}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-1 rounded-full bg-black"></div>
                    </div>
                  )}
                  
                  {/* Hover indicator */}
                  {!active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
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
