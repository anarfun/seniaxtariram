"use client";

import { useActionState } from "react";
import { createArchiveRecord } from "@/actions/archive";
import Link from "next/link";
import styles from "./new.module.css";
import { useState } from "react";

export default function NewArchivePage() {
  const [state, formAction, isPending] = useActionState(createArchiveRecord, { error: null });
  const [imageCount, setImageCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Yeni Tale Əlavə Et</h1>
        <p className={styles.subtitle}>Sistemə yeni bir axtarılan şəxs və ya tapılmış qeyd əlavə edin.</p>
      </div>

      {state?.error && (
        <div className={styles.errorBox}>{state.error}</div>
      )}

      <form action={formAction} className={styles.form}>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>👤 Şəxsi Məlumatlar</h2>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Ad</label>
              <input type="text" name="firstName" className={styles.input} placeholder="Naməlum..." />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Soyad</label>
              <input type="text" name="lastName" className={styles.input} placeholder="Naməlum..." />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Ata adı</label>
              <input type="text" name="fatherName" className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Doğum Tarixi</label>
              <input type="text" name="birthDate" className={styles.input} placeholder="DD/MM/YYYY və ya yalnız İL (məs: 1980)" />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Doğulduğu Yer</label>
              <input type="text" name="birthPlace" className={styles.input} placeholder="Şəhər, Rayon, Kənd..." />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>İtkin düşdüyü Tarix</label>
              <input type="text" name="missingDate" className={styles.input} placeholder="DD/MM/YYYY və ya yalnız İL (məs: 1994)" />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Yaşadığı Yer</label>
              <input type="text" name="currentCity" className={styles.input} placeholder="Hal-hazırda harada qalır?" />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Status (Kateqoriya)</label>
              <select name="status" className={styles.select} defaultValue="SEARCHING">
                <option value="SEARCHING">🔍 Axtarılır</option>
                <option value="FOUND">✅ Tapılıb</option>
                <option value="DECEASED">🕊️ Vəfat edib</option>
                <option value="OTHER">❓ Digər</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔍 İtkin / Əlaqə Detalları</h2>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>İtkin Düşdüyü Yer</label>
              <input type="text" name="missingLocation" className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Əlaqə Nömrələri</label>
              <input type="text" name="phoneNumbers" className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Qohumları / Tanışları</label>
              <textarea name="relatives" className={styles.textarea}></textarea>
            </div>
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Şəxsiyyət Vəsiqəsi Bilgiləri</label>
              <input type="text" name="idCardDetails" className={styles.input} placeholder="Seriya nömrəsi, FİN kod və ya vəsiqənin digər detalları..." />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📝 Qeydlər və Məlumat</h2>
          <div className={`${styles.group} ${styles.full}`}>
            <textarea name="notes" className={styles.textarea} placeholder="Xüsusi nişanələr, əlavə qeydlər, vəziyyət..."></textarea>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📎 Şəkil və Sənədlər</h2>
          <div className={styles.row}>
            
            <div className={styles.group}>
              <label className={styles.label}>Şəkillər (JPG, PNG)</label>
              <div className={styles.fileBox}>
                <div className={styles.fileIcon}>🖼️</div>
                <div className={styles.fileText}>
                  {imageCount > 0 ? `Seçildi: ${imageCount} şəkil` : "Şəkilləri seçin"}
                </div>
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*, .png, .jpg, .jpeg, .gif, .webp, .heic"
                  onChange={(e) => setImageCount(e.target.files?.length || 0)}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                  title="Şəkil seçin"
                />
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Sənədlər (PDF, DOC)</label>
              <div className={styles.fileBox}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileText}>
                  {docCount > 0 ? `Seçildi: ${docCount} sənəd` : "Sənədləri seçin"}
                </div>
                <input 
                  type="file" 
                  name="documents" 
                  multiple 
                  onChange={(e) => setDocCount(e.target.files?.length || 0)}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                  title="Sənəd seçin"
                />
              </div>
            </div>

          </div>
        </div>

        <div className={styles.footer}>
          <Link href="/archive" className={styles.cancelBtn}>Ləğv Et</Link>
          <button type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? "Saxlanılır..." : "Saxla və Əlavə Et"}
          </button>
        </div>
      </form>
    </div>
  );
}
