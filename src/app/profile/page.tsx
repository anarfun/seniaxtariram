'use client';

import { useActionState } from "react";
import { useSession } from "next-auth/react";
import { changeOwnPassword } from "@/actions/users";
import styles from "../archive/new/new.module.css";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [state, formAction, isPending] = useActionState(changeOwnPassword, { error: null });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mənim Profilim</h1>
        <p className={styles.subtitle}>Hesab məlumatlarınıza baxın və şifrənizi yeniləyin.</p>
      </div>

      <div className={styles.section} style={{ marginBottom: '32px' }}>
        <h2 className={styles.sectionTitle}>👤 Hesab Bilgiləri</h2>
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Ad Soyad</label>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }}>
              {session?.user?.name || 'Yüklənir...'}
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Vəzifə / Rol</label>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }}>
              {session?.user?.role === 'ADMIN' ? 'Administrator' : 'Redaktor'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🔒 Şifrəni Dəyiş</h2>
        
        {state?.error && (
          <div className={styles.errorBox} style={{ marginTop: '16px' }}>{state.error}</div>
        )}
        
        {state?.success && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '24px' }}>
            Şifrəniz uğurla yeniləndi!
          </div>
        )}

        <form action={formAction} className={styles.form} style={{ marginTop: '16px' }}>
          <div className={styles.group}>
            <label className={styles.label}>Cari Şifrə</label>
            <input 
              type="password" 
              name="currentPassword" 
              className={styles.input} 
              required 
              placeholder="••••••••"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Yeni Şifrə</label>
              <input 
                type="password" 
                name="newPassword" 
                className={styles.input} 
                required 
                placeholder="Ən az 6 simvol"
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Yeni Şifrə (Təkrar)</label>
              <input 
                type="password" 
                name="confirmPassword" 
                className={styles.input} 
                required 
                placeholder="Eyni şifrəni yazın"
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending ? "Yenilənir..." : "Şifrəni Yenilə"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
