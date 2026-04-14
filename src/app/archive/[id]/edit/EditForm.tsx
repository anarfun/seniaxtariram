"use client";

import { useActionState, useState } from "react";
import { updateArchiveRecord, deleteMedia } from "@/actions/archive";
import Link from "next/link";
import styles from "../../new/new.module.css";
import { ArchiveRecord, Media } from "@prisma/client";

interface ExtendedRecord extends ArchiveRecord {
  media: Media[];
}

export default function EditForm({ record }: { record: ExtendedRecord }) {
  const updateWithId = updateArchiveRecord.bind(null, record.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: "" });
  const [imageCount, setImageCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  return (
    <div className={styles.container} style={{ marginTop: '32px' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Qeydi Redaktə Et</h1>
        <p className={styles.subtitle}>Məlumatları yeniləyin və saxlayın.</p>
      </div>

      {state?.error && (
        <div className={styles.errorBox}>{state.error}</div>
      )}

      <form action={formAction} className={styles.form}>
        <div className={styles.footer} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '20px', marginBottom: '10px' }}>
          <Link href={`/archive/${record.id}`} className={styles.cancelBtn}>Ləğv Et</Link>
          <button type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? "Yenilənir..." : "Yadda Saxla"}
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>👤 Şəxsi Məlumatlar</h2>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Ad</label>
              <input type="text" name="firstName" defaultValue={record.firstName || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Soyad</label>
              <input type="text" name="lastName" defaultValue={record.lastName || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Ata adı</label>
              <input type="text" name="fatherName" defaultValue={record.fatherName || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Doğum Tarixi</label>
              <input 
                type="text" 
                name="birthDate" 
                defaultValue={record.birthDate || ""} 
                placeholder="DD/MM/YYYY və ya yalnız İL"
                className={styles.input} 
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Doğulduğu Yer</label>
              <input type="text" name="birthPlace" defaultValue={record.birthPlace || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>İtkin düşdüyü Tarix</label>
              <input 
                type="text" 
                name="missingDate" 
                defaultValue={record.missingDate || ""} 
                placeholder="DD/MM/YYYY və ya yalnız İL"
                className={styles.input} 
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Yaşadığı Yer</label>
              <input type="text" name="currentCity" defaultValue={record.currentCity || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Status (Kateqoriya)</label>
              <select name="status" className={styles.select} defaultValue={record.status || "SEARCHING"}>
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
              <input type="text" name="missingLocation" defaultValue={record.missingLocation || ""} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Əlaqə Nömrələri</label>
              <input type="text" name="phoneNumbers" defaultValue={record.phoneNumbers || ""} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Qohumları / Tanışları</label>
              <textarea name="relatives" defaultValue={record.relatives || ""} className={styles.textarea}></textarea>
            </div>
            <div className={`${styles.group} ${styles.full}`}>
              <label className={styles.label}>Şəxsiyyət Vəsiqəsi Bilgiləri</label>
              <input type="text" name="idCardDetails" defaultValue={record.idCardDetails || ""} className={styles.input} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📝 Qeydlər və Məlumat</h2>
          <div className={`${styles.group} ${styles.full}`}>
            <textarea name="notes" defaultValue={record.notes || ""} className={styles.textarea}></textarea>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📎 Mövcud Media və Sənədlər</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {record.media.map(m => (
              <div key={m.id} style={{ position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {m.type === "IMAGE" ? (
                  <img src={m.fileUrl} alt="Media" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>📄</div>
                )}
                
                <input 
                  type="text" 
                  name={`mediaNote_${m.id}`} 
                  defaultValue={m.note || ""} 
                  placeholder="Şəkil üçün qeyd..."
                  className={styles.input}
                  style={{ fontSize: '12px', padding: '6px 10px', height: 'auto' }}
                />

                <button 
                  type="button"
                  onClick={async () => {
                    if (confirm("Bu faylı silmək istədiyinizə əminsiniz?")) {
                      await deleteMedia(m.id, record.id);
                    }
                  }}
                  style={{
                    position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
            {record.media.length === 0 && <div style={{ color: '#64748b', fontSize: '14px' }}>Mövcud fayl yoxdur.</div>}
          </div>

          <h2 className={styles.sectionTitle}>➕ Yeni Şəkil və Sənədlər Əlavə Et</h2>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Şəkillər (JPG, PNG)</label>
              <div className={styles.fileBox}>
                <div className={styles.fileIcon}>🖼️</div>
                <div className={styles.fileText}>
                  {imageCount > 0 ? `Seçildi: ${imageCount} şəkil` : "Yeni şəkil əlavə edin"}
                </div>
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*, .png, .jpg, .jpeg, .gif, .webp, .heic"
                  onChange={(e) => setImageCount(e.target.files?.length || 0)}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Sənədlər (PDF, DOC)</label>
              <div className={styles.fileBox}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileText}>
                  {docCount > 0 ? `Seçildi: ${docCount} sənəd` : "Yeni sənəd əlavə edin"}
                </div>
                <input 
                  type="file" 
                  name="documents" 
                  multiple 
                  onChange={(e) => setDocCount(e.target.files?.length || 0)}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Link href={`/archive/${record.id}`} className={styles.cancelBtn}>Ləğv Et</Link>
          <button type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? "Yenilənir..." : "Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}
