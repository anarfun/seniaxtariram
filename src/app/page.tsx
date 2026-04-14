import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import { getAnalyticsData } from "@/actions/archive";
import { revalidatePath } from "next/cache";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Temporary Seed Action
  async function seedDataAction() {
    "use server";
    const firstNameList = ["Samir", "Aysel", "Elnur", "Leyla", "Rauf", "Nigar", "Vüqar", "Günel", "Tural", "Zaur", "Fidan", "Murad", "Arzu", "Elvin", "Səidə"];
    const lastNameList = ["Məmmədov", "Əliyeva", "Hüseynov", "Quliyeva", "Həsənov", "İbrahimova", "Rüstəmov", "Abbasova", "Səfərov", "Mehdiyev", "Kərimova", "Orucov", "Məlikova", "Sultanov", "Bağırova"];
    const cityList = ["Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Lənkəran", "Şəki", "Naxçıvan", "Qəbələ", "Şuşa", "Xaçmaz", "Bərdə", "Sabirabad", "Masallı", "İsmayıllı", "Zaqatala"];
    const statusList = ["SEARCHING", "SEARCHING", "SEARCHING", "FOUND", "FOUND", "DECEASED", "OTHER"];

    const user = await prisma.user.findFirst();
    if (!user) return;

    for (let i = 0; i < 15; i++) {
      const birthYear = 1970 + Math.floor(Math.random() * 40);
      const missingYear = 2010 + Math.floor(Math.random() * 14);
      const birthDate = `${Math.floor(Math.random() * 28 + 1)}/${Math.floor(Math.random() * 12 + 1)}/${birthYear}`;
      const missingDate = `${Math.floor(Math.random() * 28 + 1)}/${Math.floor(Math.random() * 12 + 1)}/${missingYear}`;

      await prisma.archiveRecord.create({
        data: {
          firstName: firstNameList[Math.floor(Math.random() * firstNameList.length)],
          lastName: lastNameList[Math.floor(Math.random() * lastNameList.length)],
          fatherName: "Ata Adı",
          birthDate,
          birthPlace: cityList[Math.floor(Math.random() * cityList.length)],
          currentCity: cityList[Math.floor(Math.random() * cityList.length)],
          missingDate,
          missingLocation: cityList[Math.floor(Math.random() * cityList.length)],
          status: statusList[Math.floor(Math.random() * statusList.length)],
          createdById: user.id,
          notes: "Sınaq üçün avtomatik yaradılıb.",
          phoneNumbers: "055-000-00-00"
        }
      });
    }
    revalidatePath("/");
  }
  
  const totalRecords = await prisma.archiveRecord.count();
  const recentRecords = await prisma.archiveRecord.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { 
      id: true, firstName: true, lastName: true, createdAt: true, 
      status: true, birthDate: true, missingDate: true, media: true 
    }
  });

  const { cityData, trendData, statusData, birthPlaceData, missingLocationData } = await getAnalyticsData();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>İdarəetmə Paneli</h1>
          <p className={styles.subtitle}>Səni Axtarıram arxiv sisteminə xoş gəldiniz, {session?.user?.name}.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <form action={seedDataAction}>
            <button type="submit" style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8", padding: "12px 20px", borderRadius: "8px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", fontSize: "14px"
            }}>
              🧪 Sınaq Məlumatı Yüklə
            </button>
          </form>
          <Link href="/archive/new" style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, display: "flex", gap: "8px", alignItems: "center"
          }}>
            <span>➕</span> Yeni Əlavə
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.blue}`}>🗂️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalRecords}</span>
            <span className={styles.statLabel}>Ümumi Qeyd</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.green}`}>📅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{new Date().toLocaleDateString('az-AZ')}</span>
            <span className={styles.statLabel}>Bugünkü Tarix</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.purple}`}>👤</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{session?.user?.role === "ADMIN" ? "Admin" : "Redaktor"}</span>
            <span className={styles.statLabel}>Hesab Növü</span>
          </div>
        </div>
      </div>

      <AnalyticsCharts 
        cityData={cityData} 
        trendData={trendData} 
        statusData={statusData} 
        birthPlaceData={birthPlaceData}
        missingLocationData={missingLocationData}
      />

      <section className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Ən son əlavə olunanlar</h2>
        
        {recentRecords.length === 0 ? (
          <div className={styles.emptyState}>
            Hələ heç bir arxiv qeydi yoxdur. İlk şəxsi əlavə etmək üçün yuxarıdakı "Yeni Əlavə" düyməsini sıxın.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentRecords.map(record => {
              // Age calculation logic
              let birthYear: number | null = null;
              if (record.birthDate) {
                if (record.birthDate.length === 4 && !isNaN(Number(record.birthDate))) {
                  birthYear = Number(record.birthDate);
                } else if (record.birthDate.includes('/') || record.birthDate.includes('.')) {
                  const parts = record.birthDate.split(/[./]/);
                  const lastPart = parts[parts.length - 1];
                  if (lastPart.length === 4) birthYear = Number(lastPart);
                }
              }
              const age = birthYear ? new Date().getFullYear() - birthYear : null;

              // Status colors
              const statusColor = 
                record.status === "FOUND" ? 'rgba(34, 197, 94, 0.1)' : 
                record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.1)' : 
                'rgba(59, 130, 246, 0.1)';
              
              const statusBorder = 
                record.status === "FOUND" ? 'rgba(34, 197, 94, 0.2)' : 
                record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.2)' : 
                'rgba(59, 130, 246, 0.2)';

              const statusTagColor = 
                record.status === "FOUND" ? '#4ade80' : 
                record.status === "DECEASED" ? '#f87171' : 
                '#60a5fa';

              return (
                <Link href={`/archive/${record.id}`} key={record.id} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '16px', 
                  background: statusColor, borderRadius: '12px', border: `1px solid ${statusBorder}`,
                  transition: 'transform 0.2s, background 0.2s',
                  textDecoration: 'none'
                }} className="recent-record-row">
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f6', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 'bold', overflow: 'hidden', border: `2px solid ${statusBorder}` 
                    }}>
                      {record.media.some(m => m.type === "IMAGE") ? (
                        <img src={record.media.find(m => m.type === "IMAGE")?.fileUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (record.firstName?.[0] || "") + (record.lastName?.[0] || "")
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {record.firstName} {record.lastName}
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: statusBorder, color: statusTagColor, textTransform: 'uppercase' }}>
                          {record.status === "SEARCHING" ? "Axtarılır" : record.status === "FOUND" ? "Tapılıb" : record.status === "DECEASED" ? "Vəfat edib" : "Digər"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>📅 {record.createdAt.toLocaleDateString('az-AZ')}</span>
                        {record.missingDate && (
                          <span style={{ fontSize: '12px', color: '#fbbf24' }}>📍 İtkin: {record.missingDate}</span>
                        )}
                        {age && (
                          <span style={{ fontSize: '12px', color: '#60a5fa' }}>👤 {age} yaş</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: statusTagColor, fontSize: '14px', fontWeight: 500 }}>
                    Profilə bax ➜
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
