"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Talələr", path: "/archive", icon: "🗂️" },
    { name: "Yeni Qeyd", path: "/archive/new", icon: "➕" },
    { name: "Mənim Profilim", path: "/profile", icon: "👤" },
  ];

  if (session?.user?.role === "ADMIN") {
    navItems.push({ name: "İşçilər (Admin)", path: "/settings", icon: "⚙️" });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>Səni</span> Axtarıram
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.link} ${pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path)) ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        {session?.user && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {session.user.name?.[0]?.toUpperCase() || "İ"}
            </div>
            <div className={styles.details}>
              <span className={styles.name}>{session.user.name}</span>
              {session.user.displayName && (
                <span style={{ fontSize: '11px', color: '#475569' }}>@{(session.user as any).username || ''}</span>
              )}
              <span className={styles.role}>{session.user.role === "ADMIN" ? "Administrator" : "Redaktor"}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
