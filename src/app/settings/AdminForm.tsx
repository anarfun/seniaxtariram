"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/actions/users";
import styles from "../archive/new/new.module.css";

export default function AdminForm() {
  const [state, formAction, isPending] = useActionState(createUser, { error: null, success: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      alert("Yeni əməkdaş hesabı uğurla yaradıldı!");
    }
  }, [state]);

  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h2 className={styles.sectionTitle} style={{ marginBottom: '24px' }}>👤 Yeni Hesab Yarat</h2>
      
      {state?.error && <div className={styles.errorBox}>{state.error}</div>}

      <form action={formAction} ref={formRef} className={styles.form} style={{ gap: '20px' }}>
        <div className={styles.group}>
          <label className={styles.label}>İstifadəçi adı (Login)</label>
          <input type="text" name="username" required minLength={3} className={styles.input} placeholder="Nümunə: huseyn123" />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Tam Ad (Əlavə, zeruri deyil)</label>
          <input type="text" name="displayName" className={styles.input} placeholder="Nümunə: Hüseyn Əliyev" />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Şifrə (Password)</label>
          <input type="password" name="password" required minLength={6} className={styles.input} placeholder="A-Z, 1-9 şərti daxilində..." />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Rol (Səlahiyyət Tipi)</label>
          <select name="role" className={styles.input} required style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <option value="EDITOR">Redaktor (Yalnız məlumat daxil edə bilər)</option>
            <option value="ADMIN">Administrator (Tam giriş təmin olunur)</option>
          </select>
        </div>
        
        <button type="submit" disabled={isPending} className={styles.submitBtn} style={{ marginTop: '12px' }}>
          {isPending ? "Yaradılır..." : "Hesabı Əlavə Et"}
        </button>
      </form>
    </div>
  );
}
