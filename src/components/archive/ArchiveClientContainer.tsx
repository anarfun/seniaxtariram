'use client';

import { useState, useMemo } from 'react';
import AISearchBar from './AISearchBar';
import Link from 'next/link';
import styles from '../../app/archive/archive.module.css';
import ExcelImport from './ExcelImport';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterResultsModal from '../dashboard/FilterResultsModal';

const STATUS_COLORS: Record<string, string> = {
  "SEARCHING": '#3b82f6',
  "FOUND": '#10b981',
  "DECEASED": '#ef4444',
  "OTHER": '#94a3b8'
};

const STATUS_NAMES: Record<string, string> = {
  "SEARCHING": "🔍 Axtarılır",
  "FOUND": "✅ Tapılıb",
  "DECEASED": "🕊️ Vəfat edib",
  "OTHER": "❓ Digər"
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

interface ArchiveClientContainerProps {
  initialRecords: any[];
  showExcel: boolean;
  activeFilters?: {
    q?: string;
    city?: string;
    missingLocation?: string;
    birthPlace?: string;
    idCard?: string;
    phone?: string;
    status?: string;
  };
}

export default function ArchiveClientContainer({ initialRecords, showExcel, activeFilters }: ArchiveClientContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [aiResults, setAiResults] = useState<any[] | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'compact' | 'ultra'>('standard');
  const [isFilterOpen, setIsFilterOpen] = useState(
    !!(activeFilters?.q || activeFilters?.city || activeFilters?.missingLocation || activeFilters?.birthPlace || activeFilters?.idCard || activeFilters?.phone || (activeFilters?.status && activeFilters?.status !== "ALL"))
  );
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    field: string;
    value: string;
    title: string;
    chartData: any[];
    colorPalette?: Record<string, string>;
  }>({
    isOpen: false,
    field: '',
    value: '',
    title: '',
    chartData: [],
    colorPalette: undefined
  });

  const displayRecords = aiResults || initialRecords;

  const handleChartClick = (entry: any) => {
    if (!analyticsData) return;
    
    let field = analyticsData.field;
    let value = entry.name;

    if (field === 'status') {
       const statusMap: Record<string, string> = {
         "🔍 Axtarılır": "SEARCHING", "SEARCHING": "SEARCHING",
         "✅ Tapılıb": "FOUND", "FOUND": "FOUND",
         "🕊️ Vəfat edib": "DECEASED", "DECEASED": "DECEASED",
         "❓ Digər": "OTHER", "OTHER": "OTHER"
       };
       value = statusMap[value] || value;
    }

    setModalState({
      isOpen: true,
      field: field,
      value: value,
      title: analyticsData.title,
      chartData: analyticsData.data,
      colorPalette: field === 'status' ? STATUS_COLORS : undefined
    });
  };

  // Calculate filtered analytics on the fly
  const analyticsData = useMemo(() => {
    if (!activeFilters || displayRecords.length === 0) return null;
    
    // Determine what to aggregate based on active filter
    let fieldToAggregate = "status";
    let title = "Statuslar üzrə Paylanma";
    const isActive = (f: string | undefined) => !!f && f !== "ALL";

    if (isActive(activeFilters.status)) {
      fieldToAggregate = "currentCity";
      title = `${STATUS_NAMES[activeFilters.status || ""] || activeFilters.status} - Şəhərlər üzrə`;
    } else if (isActive(activeFilters.city)) {
      fieldToAggregate = "status";
      title = `${activeFilters.city} ş. üzrə Statuslar`;
    } else if (isActive(activeFilters.birthPlace)) {
      fieldToAggregate = "status";
      title = `${activeFilters.birthPlace} (Doğum) üzrə Statuslar`;
    } else if (isActive(activeFilters.missingLocation)) {
      fieldToAggregate = "status";
      title = `${activeFilters.missingLocation} (itkin düşmə yeri) üzrə Statuslar`;
    } else {
      return null; // Don't show chart for generic search
    }

    const counts: Record<string, number> = {};
    displayRecords.forEach(r => {
      const val = r[fieldToAggregate] || "Naməlum";
      counts[val] = (counts[val] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    return { data, title, field: fieldToAggregate };
  }, [displayRecords, activeFilters]);

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Talələr</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              if (!isFilterOpen) setIsAiOpen(false); // Close AI if classical search opens
            }}
            className={styles.filterBtn}
            style={{ 
              background: isFilterOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.1)', 
              borderColor: isFilterOpen ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
              color: isFilterOpen ? '#3b82f6' : '#cbd5e1',
              display: 'flex', gap: '8px', alignItems: 'center'
            }}
          >
            🔍 Axtarış
          </button>
          <button 
            onClick={() => {
              setIsAiOpen(!isAiOpen);
              if (!isAiOpen) setIsFilterOpen(false); // Close classical if AI search opens
            }}
            className={styles.filterBtn}
            style={{ 
              background: isAiOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)', 
              borderColor: isAiOpen ? '#3b82f6' : 'rgba(139, 92, 246, 0.2)',
              color: isAiOpen ? '#3b82f6' : '#a78bfa',
              display: 'flex', gap: '8px', alignItems: 'center'
            }}
          >
            🤖 AI Axtarış
          </button>
          <button 
            onClick={() => {
              if (viewMode === 'standard') setViewMode('compact');
              else if (viewMode === 'compact') setViewMode('ultra');
              else setViewMode('standard');
            }}
            className={styles.filterBtn}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              display: 'flex', gap: '8px', alignItems: 'center'
            }}
            title={viewMode === 'standard' ? 'Kompakt Görünüş' : viewMode === 'compact' ? 'Ultra Görünüş' : 'Geniş Görünüş'}
          >
            {viewMode === 'standard' ? '🖥️ Geniş' : viewMode === 'compact' ? '📱 Kompakt' : '⚡ Ultra'}
          </button>
          {showExcel && <ExcelImport />}
          <Link href="/archive/new" className={styles.filterBtn} style={{ background: '#3b82f6', color: 'white', textDecoration: 'none' }}>
            ➕ Yeni Əlavə
          </Link>
        </div>
      </div>

      {isFilterOpen && (
        <div style={{ 
          marginBottom: '24px', 
          background: 'rgba(30, 41, 59, 0.4)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.05)' 
        }}>
          <form className={styles.filters} action="/archive" method="GET" style={{ border: 'none', background: 'none', padding: 0, margin: 0 }}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Ad, Soyad və ya Ata adı</label>
              <input type="text" name="q" defaultValue={activeFilters?.q || ""} placeholder="Axtarış..." className={styles.input} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Status</label>
              <select name="status" defaultValue={activeFilters?.status || "ALL"} className={styles.select}>
                <option value="ALL">Bütün Statuslar</option>
                <option value="SEARCHING">🔍 Axtarılır</option>
                <option value="FOUND">✅ Tapılıb</option>
                <option value="DECEASED">🕊️ Vəfat edib</option>
                <option value="OTHER">❓ Digər</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Yaşadığı Yer</label>
              <input type="text" name="city" defaultValue={activeFilters?.city || ""} placeholder="Bakı..." className={styles.input} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.label}>İtkin Yeri</label>
              <input type="text" name="missingLocation" defaultValue={activeFilters?.missingLocation || ""} placeholder="Moskva..." className={styles.input} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Nömrə / ID</label>
              <input type="text" name="phone" defaultValue={activeFilters?.phone || ""} placeholder="Daxil edin..." className={styles.input} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className={styles.filterBtn} style={{ background: '#3b82f6', color: 'white', border: 'none' }}>Axtar</button>
              {(activeFilters?.q || activeFilters?.city || activeFilters?.status !== "ALL") && (
                <Link href="/archive" className={styles.filterBtn} style={{ background: 'transparent', color: '#ef4444', borderColor: '#ef4444', textDecoration: 'none' }}>Sıfırla</Link>
              )}
            </div>
          </form>
        </div>
      )}

      {isAiOpen && (
        <div style={{ marginBottom: '24px' }}>
          <AISearchBar onResults={(results) => setAiResults(results)} />
        </div>
      )}

      {analyticsData && (
        <div style={{ 
          marginBottom: '24px', 
          background: 'rgba(30, 41, 59, 0.6)', 
          padding: '24px', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 1fr) 2fr',
          gap: '32px',
          alignItems: 'center',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={handleChartClick}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {analyticsData.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={analyticsData.field === 'status' ? (STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length]} 
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                      }}
                      onMouseEnter={(e: any) => {
                        e.target.style.filter = 'brightness(1.2) drop-shadow(0 0 12px rgba(255,255,255,0.3))';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.5))';
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{analyticsData.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Bu meyar üzrə cəmi <strong>{displayRecords.length} nəticə</strong> tapıldı.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {analyticsData.data.slice(0, 6).map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => handleChartClick(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: analyticsData.field === 'status' ? (STATUS_COLORS[item.name] || COLORS[i % COLORS.length]) : COLORS[i % COLORS.length] }}></div>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{analyticsData.field === 'status' ? (STATUS_NAMES[item.name] || item.name) : item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aiResults && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <span style={{ color: '#60a5fa', fontWeight: 500 }}>🤖 Süni İntellekt ən uyğun {aiResults.length} nəticəni tapdı</span>
          <button 
            onClick={() => setAiResults(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sıfırla
          </button>
        </div>
      )}

      {displayRecords.length === 0 ? (
        <div className={styles.empty}>
          <h2>Heç nə tapılmadı</h2>
          <p>Axtarış meyarlarına uyğun şəxs arxivdə mövcud deyil.</p>
        </div>
      ) : (
        <div 
          className={styles.grid}
          style={
            viewMode === 'ultra' ? { 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px'
            } : viewMode === 'compact' ? { 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            } : {}
          }
        >
          {displayRecords.map(record => {
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
            const missingDate = record.missingDate;

            return (
              <div 
                key={record.id} 
                className={`${styles.card} ${
                  record.status === "FOUND" ? styles.cardFound : 
                  record.status === "DECEASED" ? styles.cardDeceased : 
                  record.status === "SEARCHING" ? styles.cardSearching : ""
                }`}
                style={{ 
                  userSelect: 'none', 
                  cursor: 'default',
                  padding: viewMode === 'ultra' ? '12px' : viewMode === 'compact' ? '16px' : '24px'
                }}
              >
                {/* ... existing badge code ... */}
                {/* Status Badge - Hidden in Ultra */}
                {record.status && viewMode !== 'ultra' && (
                  <span style={{ 
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: viewMode === 'compact' ? '8px' : '9px', 
                    padding: viewMode === 'compact' ? '2px 8px' : '3px 10px', 
                    borderRadius: '4px', 
                    fontWeight: '700',
                    zIndex: 2,
                    backgroundColor: record.status === "FOUND" ? 'rgba(34, 197, 94, 0.2)' : record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.2)' : record.status === "OTHER" ? 'rgba(100, 116, 139, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: record.status === "FOUND" ? '#4ade80' : record.status === "DECEASED" ? '#f87171' : record.status === "OTHER" ? '#94a3b8' : '#60a5fa',
                    border: `1px solid ${record.status === "FOUND" ? 'rgba(34, 197, 94, 0.3)' : record.status === "DECEASED" ? 'rgba(239, 68, 68, 0.3)' : record.status === "OTHER" ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                  }}>
                    {record.status === "SEARCHING" && "🔍 AXTARILIR"}
                    {record.status === "FOUND" && "✅ TAPILIB"}
                    {record.status === "DECEASED" && "🕊️ VƏFAT EDİB"}
                    {record.status === "OTHER" && "❓ DİGƏR"}
                  </span>
                )}

                {/* Status Dot for Ultra Mode */}
                {viewMode === 'ultra' && record.status && (
                  <div style={{ 
                    position: 'absolute', top: '10px', right: '10px', 
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: record.status === "FOUND" ? '#22c55e' : record.status === "DECEASED" ? '#ef4444' : '#3b82f6',
                    boxShadow: '0 0 5px rgba(0,0,0,0.4)',
                    zIndex: 2
                  }} />
                )}

                <div className={styles.cardHeader} style={{ marginBottom: viewMode === 'ultra' ? '8px' : viewMode === 'compact' ? '12px' : '20px' }}>
                  <div className={styles.avatar} style={{ 
                    width: viewMode === 'ultra' ? '32px' : viewMode === 'compact' ? '40px' : '52px', 
                    height: viewMode === 'ultra' ? '32px' : viewMode === 'compact' ? '40px' : '52px',
                    fontSize: viewMode === 'ultra' ? '12px' : viewMode === 'compact' ? '14px' : '18px',
                    overflow: 'hidden' 
                  }}>
                    {record.media?.some((m: any) => m.type === "IMAGE") ? (
                      <img src={record.media.find((m: any) => m.type === "IMAGE")?.fileUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (record.firstName?.[0] || "") + (record.lastName?.[0] || "")
                    )}
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.name} style={{ fontSize: viewMode === 'ultra' ? '13px' : viewMode === 'compact' ? '15px' : '18px' }}>{record.firstName} {record.lastName}</h3>
                    {viewMode !== 'ultra' && (
                      <div className={styles.subName} style={{ fontSize: viewMode === 'compact' ? '11px' : '13px' }}>
                        {record.fatherName ? `${record.fatherName} o / q` : 'Ata adı qeyd edilməyib'}
                        {age && <span style={{ marginLeft: '8px', color: '#60a5fa' }}>• {age} j</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                {viewMode !== 'ultra' && (
                  <div className={styles.details} style={{ gap: viewMode === 'compact' ? '8px' : '15px', marginBottom: viewMode === 'compact' ? '16px' : '24px' }}>
                    <div className={styles.detailRow} style={{ fontSize: viewMode === 'compact' ? '11px' : '13px' }}>
                      <span className={styles.detailIcon}>📍</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.currentCity || 'Məlum deyil'}</span>
                    </div>
                    {viewMode !== 'compact' && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailIcon}>🔍</span>
                        <span>İtkin yeri: {record.missingLocation || 'Məlum deyil'}</span>
                      </div>
                    )}
                    {missingDate && (
                      <div className={styles.detailRow} style={{ fontSize: viewMode === 'compact' ? '11px' : '13px' }}>
                        <span className={styles.detailIcon}>📅</span>
                        <span style={{ color: '#fbbf24' }}>{missingDate}</span>
                      </div>
                    )}
                  </div>
                )}

                <Link href={`/archive/${record.id}`} className={styles.viewBtn} style={{ padding: viewMode === 'ultra' ? '4px' : viewMode === 'compact' ? '8px' : '12px', fontSize: viewMode === 'ultra' ? '11px' : viewMode === 'compact' ? '12px' : '14px' }}>
                  {viewMode === 'ultra' ? 'Aç' : viewMode === 'compact' ? 'Aç' : 'Məlumat vərəqini aç'}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics Results Modal */}
      <FilterResultsModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        field={modalState.field}
        initialValue={modalState.value}
        title={modalState.title}
        chartData={modalState.chartData}
        colorPalette={modalState.colorPalette}
      />
    </>
  );
}
