"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      if (target.value.trim()) {
        router.push(`/archive?q=${encodeURIComponent(target.value)}`);
      }
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <span>🔍</span>
        <input 
          type="text" 
          placeholder="Şəxsiyyət və ya vəsiqə axtar..." 
          className={styles.searchInput}
          onKeyDown={handleSearch}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} title="Bildirişlər">
          🔔
        </button>
        <button 
          className={styles.logoutBtn} 
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Çıxış <span>🚪</span>
        </button>
      </div>
    </header>
  );
}
