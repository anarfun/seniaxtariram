"use client";

import { useState } from "react";
import styles from "./archiveId.module.css";
import Lightbox from "@/components/archive/Lightbox";

interface GalleryProps {
  images: { id: string; fileUrl: string; note?: string | null }[];
}

export default function Gallery({ images }: GalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  if (images.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '14px' }}>Şəkil yoxdur</div>;
  }

  return (
    <>
      <div className={styles.mediaGrid}>
        {images.map((img, index) => (
          <div 
            key={img.id} 
            className={styles.mediaItemWrapper}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div 
              className={styles.mediaItem} 
              onClick={() => openLightbox(index)}
              style={{ cursor: 'zoom-in' }}
            >
              <img src={img.fileUrl} alt="Şəkil" className={styles.image} />
            </div>
            {img.note && (
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 4px', lineHeight: '1.4' }}>
                {img.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {isOpen && (
        <Lightbox 
          images={images} 
          initialIndex={photoIndex} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
