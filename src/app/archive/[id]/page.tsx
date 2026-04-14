import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./archiveId.module.css";
import Image from "next/image";
import Link from "next/link";
import Gallery from "./Gallery";
import DeleteRecordButton from "./DeleteRecordButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function ArchiveDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const record = await prisma.archiveRecord.findUnique({
    where: { id },
    include: { 
      media: true,
      createdBy: { select: { username: true } }
    }
  });

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (!record) {
    return notFound();
  }

  const images = record.media.filter(m => m.type === "IMAGE");
  const documents = record.media.filter(m => m.type === "DOCUMENT");

  // Flexible Age Calculation from String
  let birthYear: number | null = null;
  if (record.birthDate) {
    if (record.birthDate.length === 4 && !isNaN(Number(record.birthDate))) {
      birthYear = Number(record.birthDate);
    } else if (record.birthDate.includes('/')) {
      const parts = record.birthDate.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 4) birthYear = Number(lastPart);
    } else if (record.birthDate.includes('.')) {
      const parts = record.birthDate.split('.');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 4) birthYear = Number(lastPart);
    }
  }
  const age = birthYear ? new Date().getFullYear() - birthYear : null;

  return (
    <div className={styles.container} style={{ userSelect: 'none', cursor: 'default' }}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.avatar} style={{ overflow: 'hidden' }}>
            {images.length > 0 ? (
              <img src={images[0].fileUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (record.firstName?.[0] || "") + (record.lastName?.[0] || "")
            )}
          </div>
          <div className={styles.nameInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 className={styles.name} style={{ margin: 0 }}>{record.firstName} {record.lastName}</h1>
              {record.status && (
                <span style={{ 
                  fontSize: '11px', 
                  padding: '4px 10px', 
                  borderRadius: '100px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: 
                    record.status === "FOUND" ? 'rgba(34, 197, 94, 0.2)' : 
                    record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.2)' : 
                    record.status === "OTHER" ? 'rgba(100, 116, 139, 0.2)' : 
                    'rgba(59, 130, 246, 0.2)',
                  color: 
                    record.status === "FOUND" ? '#4ade80' : 
                    record.status === "DECEASED" ? '#f87171' : 
                    record.status === "OTHER" ? '#94a3b8' : 
                    '#60a5fa',
                  border: `1px solid ${
                    record.status === "FOUND" ? 'rgba(34, 197, 94, 0.3)' : 
                    record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.3)' : 
                    record.status === "OTHER" ? 'rgba(100, 116, 139, 0.3)' : 
                    'rgba(59, 130, 246, 0.3)'
                  }`
                }}>
                  {record.status === "SEARCHING" && "🔍 Axtarılır"}
                  {record.status === "FOUND" && "✅ Tapılıb"}
                  {record.status === "DECEASED" && "🕊️ Vəfat edib"}
                  {record.status === "OTHER" && "❓ Digər"}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              <span>📅 {record.createdAt.toLocaleDateString("az-AZ")}</span>
              {record.createdBy && (
                <span>👤 Əlavə etdi: <strong style={{ color: '#3b82f6' }}>{record.createdBy.username}</strong></span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          {isAdmin && (
            <>
              <Link href={`/archive/${id}/edit`} className={`${styles.btn} ${styles.editBtn}`}>✏️ Redaktə et</Link>
              <DeleteRecordButton id={id} name={`${record.firstName} ${record.lastName}`} />
            </>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        {/* Sol tərəf / Əsas Məlumatlar */}
        <div className={styles.infoSection}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📋 Şəxsi Bilgilər</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Ad / Soyad</span>
                <span className={styles.value}>{record.firstName} {record.lastName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Ata adı</span>
                <span className={styles.value}>{record.fatherName || "Qeyd edilməyib"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Doğum Tarixi / Yaş</span>
                <span className={styles.value}>
                  {record.birthDate || "Qeyd edilməyib"}
                  {age && ` (${age} yaş)`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Doğulduğu yer</span>
                <span className={styles.value}>{record.birthPlace || "Qeyd edilməyib"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Yaşadığı yer</span>
                <span className={styles.value}>{record.currentCity || "Qeyd edilməyib"}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔍 İtkin Detalları</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>İtkin Tarixi</span>
                <span className={styles.value} style={{ color: '#fbbf24', fontWeight: 700 }}>
                  {record.missingDate || "Məlum deyil"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>İtkin Yeri</span>
                <span className={styles.value}>{record.missingLocation || "Qeyd edilməyib"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Əlaqə</span>
                <span className={styles.value}>{record.phoneNumbers || "Qeyd edilməyib"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Şəxsiyyət Vəsiqəsi</span>
                <span className={styles.value}>{record.idCardDetails || "Qeyd edilməyib"}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📝 Ətraflı Qeydlər</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Qohumları / Tanışları</span>
                <p className={styles.value} style={{ whiteSpace: 'pre-line', margin: 0 }}>
                  {record.relatives || "Məlumat yoxdur."}
                </p>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Digər Qeydlər</span>
                <p className={styles.value} style={{ whiteSpace: 'pre-line', margin: 0 }}>
                  {record.notes || "Qeyd yoxdur."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ tərəf / Media və Sənədlər */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🖼️ Şəkillər</h2>
            <Gallery images={images} />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📎 Sənədlər</h2>
            <div className={styles.mediaGrid}>
              {documents.length > 0 ? documents.map(doc => (
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Sənədi aç" 
                  key={doc.id} 
                  className={styles.mediaItem}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none' }}
                >
                  <span className={styles.docIcon}>📄</span>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>SƏNƏD</span>
                </a>
              )) : (
                <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>Heç bir sənəd əlavə edilməyib.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
