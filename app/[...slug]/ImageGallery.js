'use client';

import { useState, useEffect } from 'react';

export default function ImageGallery({ designerGroups, generalImages }) {
  const [selectedImage, setSelectedImage] = useState(null);

  // ปิด lightbox ด้วยปุ่ม Esc
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelectedImage(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                      onClick={() => setSelectedImage(img)}
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
                  onClick={() => setSelectedImage(img)}
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
          onClick={() => setSelectedImage(null)}
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
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
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
        </div>
      )}
    </>
  );
}