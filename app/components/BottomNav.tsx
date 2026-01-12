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
  { href: "/home", label: "Home", icon: FaHome, color: "#6b7280" },
  { href: "/chest", label: "Chest", icon: FaBoxOpen, color: "#f59e0b" },
  { href: "/stake", label: "Stake", icon: FaCoins, color: "#6b7280" },
  { href: "/steam", label: "Steam", icon: FaTasks, color: "#6b7280" },
  { href: "/profile", label: "Profile", icon: FaUser, color: "#6b7280" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {items.map((item) => {
          // Handle both /home and / for home page
          const isActive = pathname === item.href || (item.href === "/home" && pathname === "/");
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              style={{
                color: isActive ? item.color : 'rgba(255, 255, 255, 0.6)'
              }}
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