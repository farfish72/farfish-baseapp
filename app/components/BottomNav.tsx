"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./BottomNav.module.css";

import {
  FaHome,
  FaBoxOpen,
  FaCoins,
  FaTasks,
  FaUser,
} from "react-icons/fa";

const items = [
  { href: "/", label: "Home", icon: FaHome, color: "from-blue-500 to-cyan-500" },
  { href: "/chest", label: "Chest", icon: FaBoxOpen, color: "from-amber-500 to-orange-500" },
  { href: "/stake", label: "Stake", icon: FaCoins, color: "from-green-500 to-emerald-500" },
  { href: "/steam", label: "Steam", icon: FaTasks, color: "from-purple-500 to-pink-500" },
  { href: "/profile", label: "Profile", icon: FaUser, color: "from-indigo-500 to-purple-500" },
];
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>
                <IconComponent />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}