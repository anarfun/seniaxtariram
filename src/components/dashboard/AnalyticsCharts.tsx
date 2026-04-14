'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  "Axtarılır": '#3b82f6',
  "Tapılıb": '#10b981',
  "Vəfat edib": '#ef4444',
  "Digər": '#94a3b8'
};

const STATUS_MAP_BACKEND: Record<string, string> = {
  "Axtarılır": "SEARCHING",
  "Tapılıb": "FOUND",
  "Vəfat edib": "DECEASED",
  "Digər": "OTHER"
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

interface ChartData {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  cityData: ChartData[];
  trendData: { name: string; count: number }[];
  statusData: ChartData[];
  birthPlaceData: ChartData[];
  missingLocationData: ChartData[];
}

import { useState } from 'react';
import FilterResultsModal from './FilterResultsModal';

const MiniChart = ({ 
  title, 
  icon, 
  data, 
  field, 
  colorPalette,
  onOpenModal
}: { 
  title: string, 
  icon: string, 
  data: ChartData[], 
  field: string,
  colorPalette?: Record<string, string>,
  onOpenModal: (field: string, value: string, title: string, chartData: any[], colorPalette?: Record<string, string>) => void
}) => {
  const handleClick = (e: any, entry?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // If specific slice clicked, use its name, otherwise use first entry or empty
    const value = entry?.name || (data.length > 0 ? data[0].name : '');
    
    let backendValue = value;
    if (field === 'status' && STATUS_MAP_BACKEND[value]) {
      backendValue = STATUS_MAP_BACKEND[value];
    }
    
    onOpenModal(field, value, title, data, colorPalette);
  };

  return (
    <div 
      onClick={(e) => handleClick(e)}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
      }}
      style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        padding: '16px', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
    >
      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
        <span>{icon}</span> {title}
      </h4>
      <div style={{ height: '140px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
              onClick={(entry) => handleClick(window.event, entry)}
              style={{ outline: 'none' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colorPalette ? (colorPalette[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length]} 
                  style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onMouseEnter={(e: any) => {
                    e.target.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.2))';
                  }}
                  onMouseLeave={(e: any) => {
                    e.target.style.filter = 'none';
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff', padding: '2px 0' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {data.slice(0, 3).map((item, i) => (
          <div 
            key={i} 
            onClick={(e) => handleClick(e, item)}
            onMouseEnter={(e: any) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e: any) => e.currentTarget.style.color = '#64748b'}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', transition: 'color 0.2s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colorPalette ? (colorPalette[item.name] || COLORS[i % COLORS.length]) : COLORS[i % COLORS.length], flexShrink: 0 }}></div>
              {item.name}
            </div>
            <span style={{ fontWeight: 600, color: '#94a3b8' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsCharts({ 
  cityData, 
  trendData, 
  statusData, 
  birthPlaceData, 
  missingLocationData 
}: AnalyticsChartsProps) {
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

  const openModal = (field: string, value: string, title: string, chartData: any[], colorPalette?: Record<string, string>) => {
    setModalState({ isOpen: true, field, value, title, chartData, colorPalette });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
      
      {/* Əsas 4-lü Analitika Kartı */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        padding: '24px', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📉</span>
            Genişləndirilmiş Analitika
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>Canlı məlumat</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px' 
        }}>
          <MiniChart title="Statuslar" icon="📊" data={statusData} field="status" colorPalette={STATUS_COLORS} onOpenModal={openModal} />
          <MiniChart title="Yaşayış Yeri" icon="🏙️" data={cityData} field="currentCity" onOpenModal={openModal} />
          <MiniChart title="Doğum Yeri" icon="🐣" data={birthPlaceData} field="birthPlace" onOpenModal={openModal} />
          <MiniChart title="İtkin Yeri" icon="📍" data={missingLocationData} field="missingLocation" onOpenModal={openModal} />
        </div>
      </div>

      {/* Monthly Trend - Altda olaraq qalır, vizual tarazlıq üçün */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        padding: '24px', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>📈</span> Son 6 Ayın Trendi
        </h3>
        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search Results Modal */}
      <FilterResultsModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        field={modalState.field}
        initialValue={modalState.value}
        title={modalState.title}
        chartData={modalState.chartData}
        colorPalette={modalState.colorPalette}
      />
    </div>
  );
}
