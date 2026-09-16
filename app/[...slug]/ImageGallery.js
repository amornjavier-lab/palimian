'use client';

import { useState, useEffect } from 'react';

// ปุ่มลูกศรเล็กๆ สำหรับเลื่อนกริดไปดูรูปถัดไป/ก่อนหน้า
function ArrowButton({ direction, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'prev' ? 'รูปก่อนหน้า' : 'รูปถัดไป'}
      style={{
        backgroundColor: '#1A1A1A',
        color: '#FFF',
        border: 'none',
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        lineHeight: 1
      }}
    >
      {direction === 'prev' ? '\u2039' : '\u203A'}
    </button>
  );
}

// แถวรูปของนักกราฟิกคนหนึ่ง (หรือ gallery ทั่วไป) แสดงทีละ 3 รูป
// ถ้ามีมากกว่า 3 รูป จะมีปุ่มลูกศรเลื่อนดูรูปที่ 4 เป็นต้นไป
function ImageRow({ heading, items, imageHeight, onImageClick }) {
  const [startIndex, setStartIndex] = useState(0);
  const windowSize = 3;
  const canSlide = items.length > windowSize;
  const visibleItems = items.slice(startIndex, startIndex + windowSize);

  const showPrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };
  const showNext = () => {
    setStartIndex((prev) => Math.min(items.length - windowSize, prev + 1));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E0DCD0',
        paddingBottom: '0.5rem',
        marginBottom: '1.25rem'
      }}>
        {heading ? (
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'normal', margin: 0, fontFamily: 'serif' }}>
            {heading}
          </h3>
        ) : <span />}

        {canSlide && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ArrowButton direction="prev" onClick={showPrev} />
            <ArrowButton direction="next" onClick={showNext} />
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem'
      }}>
        {visibleItems.map((img) => (
          <div key={img.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              onClick={() => onImageClick(img)}
              style={{
                width: '100%',
                height: imageHeight,
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#EFECE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <img
                src={img.image_url}
                alt={img.title || heading || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span style={{ marginTop: '0.6rem', fontSize: '0.95rem', fontFamily: 'sans-serif', color: '#1A1A1A' }}>
              {img.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ImageGallery({ designerGroups, generalImages }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // รวมรูปทั้งหมด (ทั้งจากกลุ่มนักกราฟิกและ gallery ทั่วไป) เป็นลิสต์เดียว เรียงตามลำดับที่แสดงบนหน้าจอ
  // ใช้สำหรับเลื่อนดูรูปต่อเนื่องใน lightbox (ครอบคลุมรูปที่ 4 เป็นต้นไปด้วย แม้จะไม่ได้อยู่ในกริดที่มองเห็น ณ ขณะนั้น)
  const allImages = [
    ...designerGroups.flatMap((group) => group.items),
    ...generalImages
  ];

  const selectedImage = selectedIndex !== null ? allImages[selectedIndex] : null;

  const showPrevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  const showNextImage = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (img) => {
    setSelectedIndex(allImages.findIndex((i) => i.id === img.id));
  };

  // ปิด lightbox ด้วยปุ่ม Esc และเลื่อนรูปด้วยปุ่มลูกศรซ้าย-ขวาบนคีย์บอร์ด
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allImages.length]);

  return (
    <>
      {/* Designer Rows: 1 แถว = นักกราฟิก 1 คน แสดงทีละ 3 รูป เลื่อนดูรูปที่ 4 ขึ้นไปด้วยปุ่มลูกศร */}
      {designerGroups.length > 0 && (
        <section style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {designerGroups.map((group) => (
            <ImageRow
              key={group.designer_name}
              heading={group.designer_name}
              items={group.items}
              imageHeight="220px"
              onImageClick={openLightbox}
            />
          ))}
        </section>
      )}

      {/* Product Gallery Grid เดิม: สำหรับรูปที่ไม่มี designer_name แสดงทีละ 3 รูปเช่นกัน */}
      {generalImages.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <ImageRow
            heading={null}
            items={generalImages}
            imageHeight="280px"
            onImageClick={openLightbox}
          />
        </section>
      )}

      {/* Lightbox: แสดงรูปเต็มเมื่อคลิก พร้อมปุ่มเลื่อนซ้าย-ขวา */}
      {selectedImage && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '2rem',
            boxSizing: 'border-box',
            cursor: 'zoom-out'
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            aria-label="ปิด"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFF',
              fontSize: '2rem',
              lineHeight: 1,
              cursor: 'pointer'
            }}
          >
            &times;
          </button>

          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrevImage(); }}
              aria-label="รูปก่อนหน้า"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFF',
                fontSize: '1.8rem',
                lineHeight: 1,
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &#8249;
            </button>
          )}

          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNextImage(); }}
              aria-label="รูปถัดไป"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFF',
                fontSize: '1.8rem',
                lineHeight: 1,
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &#8250;
            </button>
          )}

          <img
            src={selectedImage.image_url}
            alt={selectedImage.title || ''}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
          {selectedImage.title && (
            <span style={{
              marginTop: '1rem',
              color: '#FFF',
              fontFamily: 'sans-serif',
              fontSize: '1rem'
            }}>
              {selectedImage.title}
            </span>
          )}

          <span style={{
            marginTop: '0.5rem',
            color: '#CCC',
            fontFamily: 'sans-serif',
            fontSize: '0.85rem'
          }}>
            {selectedIndex + 1} / {allImages.length}
          </span>
        </div>
      )}
    </>
  );
}