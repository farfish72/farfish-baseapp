"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Package, Coins, ListChecks, User } from "@phosphor-icons/react";
import styles from "./BottomNav.module.css";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", label: "Home", icon: House },
    { href: "/chest", label: "Chest", icon: Package },
    { href: "/stake", label: "Stake", icon: Coins },
    { href: "/steam", label: "Steam", icon: ListChecks },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>
                <Icon size={20} weight="bold" />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
              {active && <span className={styles.activeDot} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
