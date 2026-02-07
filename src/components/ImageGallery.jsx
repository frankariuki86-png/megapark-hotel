import React, { useState } from 'react';
import '../styles/imagegallery.css';

const ImageGallery = ({ images, roomName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (!images || images.length === 0) {
    return <div className="gallery-placeholder">No images available</div>;
  }

  return (
    <div className="image-gallery">
      <div className="gallery-main">
        <img
          src={images[currentIndex]}
          alt={`${roomName} - ${currentIndex + 1}`}
          className="gallery-image"
        />
        {images.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={prevImage} aria-label="Previous image">
              ❮
            </button>
            <button className="gallery-nav next" onClick={nextImage} aria-label="Next image">
              ❯
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((image, idx) => (
            <button
              key={idx}
              className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={image} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="gallery-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
