"use client";

import { useState, useEffect } from "react";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  images: { id: string; fileUrl: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      
      {images.length > 1 && (
        <>
          <button className={styles.navBtn} style={{ left: '20px' }} onClick={prev}>&#10094;</button>
          <button className={styles.navBtn} style={{ right: '20px' }} onClick={next}>&#10095;</button>
        </>
      )}

      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <img src={images[currentIndex].fileUrl} alt="Böyüdülmüş şəkil" className={styles.image} />
        <div className={styles.counter}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
