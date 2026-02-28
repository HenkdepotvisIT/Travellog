import { useState } from "react";
import styles from "./PhotoGrid.module.css";

interface PhotoGridProps {
  photos: string[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePhotoPress = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedPhoto(photos[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedPhoto(photos[selectedIndex + 1]);
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            className={styles.photoContainer}
            onClick={() => handlePhotoPress(photo, index)}
          >
            <img src={photo} alt="" className={styles.photo} />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalHeader}>
            <span className={styles.photoCounter}>
              {selectedIndex + 1} / {photos.length}
            </span>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
          </div>

          <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
            {selectedIndex > 0 && (
              <button className={styles.navButtonLeft} onClick={handlePrevious}>
                ‹
              </button>
            )}

            <img src={selectedPhoto} alt="" className={styles.fullImage} />

            {selectedIndex < photos.length - 1 && (
              <button className={styles.navButtonRight} onClick={handleNext}>
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
