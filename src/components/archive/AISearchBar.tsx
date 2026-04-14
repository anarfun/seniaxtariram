'use client';

import { useState } from 'react';
import { aiSearchArchive } from '@/actions/archive';
import styles from './AISearchBar.module.css';

export default function AISearchBar({ onResults }: { onResults: (results: any[] | null) => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onResults(null);
      return;
    }

    setLoading(true);
    try {
      const results = await aiSearchArchive(query);
      onResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchBoxWrapper}>
      <form onSubmit={handleSearch} className={styles.searchBox}>
        <div className={styles.icon}>🤖</div>
        <input 
          type="text" 
          placeholder="Məsələn: 'Bakıda itən 1990-cı il təvəllüdlü şəxslər'..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Axtarılır...' : 'Axtar'}
        </button>
      </form>
      <p className={styles.hint}>Şəxsi təsvir edərək və ya bütöv cümlələrlə axtarış edin.</p>
    </div>
  );
}
