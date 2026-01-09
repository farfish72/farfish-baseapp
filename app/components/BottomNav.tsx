"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./BottomNav.module.css";

const tabs = [
  { name: "Home", href: "/home", icon: "🏠" },
  { name: "Chest", href: "/chest", icon: "📦" },
  { name: "Stake", href: "/stake", icon: "⚡" },
  { name: "Steam", href: "/steam", icon: "💨" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <span className={styles.navLabel}>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}