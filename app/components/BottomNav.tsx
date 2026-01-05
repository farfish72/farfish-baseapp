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
      <div className="glass-card rounded-t-3xl border-t border-white/10 backdrop-blur-xl">
        {/* Clean top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full opacity-60"></div>
        
        <ul className="flex justify-between items-center px-3 py-4">
          {items.map((item) => {
            const active = path === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-1.5 
                    text-xs font-semibold
                    transition-all duration-200 ease-out
                    py-2.5 px-3 rounded-2xl
                    group relative overflow-hidden
                    min-h-[48px] min-w-[48px]
                    focus-ring
                    ${active 
                      ? `bg-primary text-black shadow-primary` 
                      : "text-text-tertiary hover:text-text-primary interactive-scale"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-black' : ''}`} />
                  <span className={`text-2xs font-medium ${active ? 'text-black' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
