'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFilteredRecords } from '@/actions/archive';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const STATUS_MAP_BACKEND: Record<string, string> = {
  "Axtarılır": "SEARCHING", "🔍 Axtarılır": "SEARCHING", "SEARCHING": "SEARCHING",
  "Tapılıb": "FOUND", "✅ Tapılıb": "FOUND", "FOUND": "FOUND",
  "Vəfat edib": "DECEASED", "🕊️ Vəfat edib": "DECEASED", "DECEASED": "DECEASED",
  "Digər": "OTHER", "❓ Digər": "OTHER", "OTHER": "OTHER"
};

interface FilterResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: string;
  initialValue: string;
  title: string;
  chartData: any[];
  colorPalette?: Record<string, string>;
}

export default function FilterResultsModal({ 
  isOpen, 
  onClose, 
  field, 
  initialValue, 
  title,
  chartData,
  colorPalette
}: FilterResultsModalProps) {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedValue(initialValue);
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    if (isOpen && field && selectedValue) {
      setLoading(true);
      
      let backendValue = selectedValue;
      if (field === 'status' && STATUS_MAP_BACKEND[selectedValue]) {
        backendValue = STATUS_MAP_BACKEND[selectedValue];
      }

      getFilteredRecords(field, backendValue).then((data) => {
        setRecords(data);
        setLoading(false);
      });
    }
  }, [isOpen, field, selectedValue]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />

      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Dərinləşdirilmiş hərəkətli analiz</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        {/* Modal Chart Section */}
        <div style={{ padding: '20px 32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={5}
                  stroke="none"
                  dataKey="value"
                  onClick={(entry) => setSelectedValue(entry.name)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colorPalette ? (colorPalette[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length]} 
                      style={{ 
                        transition: 'all 0.3s ease',
                        opacity: selectedValue === entry.name ? 1 : 0.4,
                        filter: selectedValue === entry.name ? 'brightness(1.2) drop-shadow(0 0 12px rgba(255,255,255,0.2))' : 'none'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Seçilmiş</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{selectedValue}</div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
             "{selectedValue}" üzrə nəticələr
          </h3>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Bazadan məlumatlar çəkilir...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Bu meyar üzrə hələ ki, heç bir qeyd yoxdur.</div>
          ) : (
            records.map((record) => (
              <div key={record.id} style={{
                background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.03)'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: '#1e293b' }}>
                  {record.media?.some((m: any) => m.type === "IMAGE") ? (
                    <img src={record.media.find((m: any) => m.type === "IMAGE")?.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 700 }}>{record.firstName[0]}{record.lastName[0]}</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>{record.firstName} {record.lastName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {record.currentCity || "Məlum deyil"}</div>
                </div>
                <Link href={`/archive/${record.id}`} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Profilə keç</Link>
              </div>
            ))
          )}
        </div>

        {/* Global Footer in Modal */}
        <div style={{ padding: '20px 32px', background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center' }}>
          <Link 
            href={`/archive?${field}=${selectedValue === "Naməlum" ? "" : selectedValue}`}
            style={{ fontSize: '14px', color: '#60a5fa', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Bütün geniş arxivdə bu meyarı süzgəclə 🔍
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
