'use client';

import { useState, useRef } from 'react';
import styles from './ExcelImport.module.css';
import { parseExcelArchive, confirmImportArchive } from '@/actions/archive';

export default function ExcelImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ records: any[], duplicates: any[] } | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await parseExcelArchive(formData);
      
      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else if (result.success) {
        if (result.duplicates && result.duplicates.length > 0) {
          setData({ records: result.records || [], duplicates: result.duplicates });
        } else {
          // No duplicates, just confirm
          await handleConfirm(result.records || [], false);
        }
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Fayl işlənərkən xəta baş verdi.' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirm = async (additionalRecords: any[], skipDuplicates: boolean) => {
    setLoading(true);
    try {
      const allRecords = skipDuplicates 
        ? [...(data?.records || [])] 
        : [...(data?.records || []), ...(data?.duplicates || [])];
      
      const recordsToInsert = data ? allRecords : additionalRecords;

      const result = await confirmImportArchive({ 
        records: recordsToInsert, 
        skipDuplicates 
      });

      if (result.error) {
        setStatus({ type: 'error', message: result.error });
      } else {
        setStatus({ type: 'success', message: `${result.count} qeyd uğurla daxil edildi.` });
        setData(null);
        setTimeout(() => {
          setIsOpen(false);
          setStatus(null);
        }, 2000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Məlumatlar saxlanılarkən xəta baş verdi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.openButton} onClick={() => setIsOpen(true)}>
        📑 Excel-dən Import
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <button className={styles.closeX} onClick={() => setIsOpen(false)}>&times;</button>
            
            <header>
              <h2 className={styles.title}>Excel-dən Arxivə Əlavə</h2>
              <p className={styles.description}>Məlumatları toplu şəkildə daxil etmək üçün Excel (.xlsx) faylını seçin.</p>
            </header>

            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <span style={{ fontSize: '32px' }}>📁</span>
              <span>{loading ? '📌 İşlənir...' : 'Excel faylını seçin'}</span>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className={styles.fileInput}
                disabled={loading}
              />
            </div>

            {status && (
              <div className={`${styles.status} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
                {status.message}
              </div>
            )}

            {data && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className={styles.modalTitle} style={{ fontSize: '16px' }}>Təkrar qeydlər tapıldı! ({data.duplicates.length})</h3>
                <p className={styles.description} style={{ marginBottom: '12px' }}>Bu qeydləri nə edək?</p>
                
                <div className={styles.actions}>
                  <button 
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => handleConfirm([], true)}
                    disabled={loading}
                    style={{ fontSize: '13px' }}
                  >
                    Təkrarları ötür
                  </button>
                  <button 
                    className={styles.button}
                    onClick={() => handleConfirm([], false)}
                    disabled={loading}
                    style={{ fontSize: '13px' }}
                  >
                    Hamısını daxil et
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
