'use client';

import { useState, useEffect } from 'react';

export default function ImageGallery({ designerGroups, generalImages }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // รวมรูปทั้งหมด (ทั้งจากกลุ่มนักกราฟิกและ gallery ทั่วไป) เป็นลิสต์เดียว เรียงตามลำดับที่แสดงบนหน้าจอ
  // เพื่อให้กดปุ่มเลื่อนแล้ววิ่งต่อเนื่องไปเรื่อยๆ ได้ทั้งหน้า (รวมถึงรูปที่ 4 เป็นต้นไป)
  const allImages = [
    ...designerGroups.flatMap((group) => group.items),
    ...generalImages
  ];

  const selectedImage = selectedIndex !== null ? allImages[selectedIndex] : null;

  const showPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  const showNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // ปิด lightbox ด้วยปุ่ม Esc และเลื่อนรูปด้วยปุ่มลูกศรซ้าย-ขวาบนคีย์บอร์ด
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allImages.length]);

  return (
    <>
      {/* Designer Rows: 1 แถว = นักกราฟิก 1 คน, 3 คอลัมน์ */}
      {designerGroups.length > 0 && (
        <section style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {designerGroups.map((group) => (
            <div key={group.designer_name}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 'normal', marginBottom: '1.25rem', fontFamily: 'serif', borderBottom: '1px solid #E0DCD0', paddingBottom: '0.5rem' }}>
                {group.designer_name}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem'
              }}>
                {group.items.map((img) => (
                  <div key={img.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      onClick={() => setSelectedIndex(allImages.findIndex((i) => i.id === img.id))}
                      style={{
                        width: '100%',
                        height: '220px',
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
                        alt={img.title || group.designer_name}
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
          ))}
        </section>
      )}

      {/* Product Gallery Grid เดิม: สำหรับรูปที่ไม่มี designer_name */}
      {generalImages.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2.5rem 2rem'
          }}>
            {generalImages.map((img) => (
              <div key={img.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  onClick={() => setSelectedIndex(allImages.findIndex((i) => i.id === img.id))}
                  style={{
                    width: '100%',
                    height: '280px',
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
                    alt={img.title || ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ marginTop: '0.75rem', fontSize: '1.05rem', fontFamily: 'sans-serif', color: '#1A1A1A', fontWeight: '500' }}>
                  {img.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox: แสดงรูปเต็มเมื่อคลิก */}
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

          {/* ปุ่มเลื่อนไปรูปก่อนหน้า */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
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

          {/* ปุ่มเลื่อนไปรูปถัดไป (ดูรูปที่ 4 เป็นต้นไปได้จากปุ่มนี้) */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext(); }}
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

          {/* ตัวนับลำดับรูป เช่น 4 / 9 */}
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