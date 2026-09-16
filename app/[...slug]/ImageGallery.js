'use client';

import { useState, useEffect, useRef } from 'react';

// การ์ดรูปภาพ 1 ใบ (ใช้ทั้งแถวนักกราฟิกและแถว general gallery)
function ImageCard({ img, height, altFallback, onClick }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 calc((100% - 4rem) / 3)', // โชว์ทีละ 3 ใบพอดีแถว ที่เหลือเลื่อนดู
        minWidth: '220px'
      }}
    >
      <div
        onClick={onClick}
        style={{
          width: '100%',
          height,
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
          alt={img.title || altFallback}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />
      </div>
      <span style={{ marginTop: '0.6rem', fontSize: '0.95rem', fontFamily: 'sans-serif', color: '#1A1A1A' }}>
        {img.title}
      </span>
    </div>
  );
}

// แถวที่เลื่อนดูรูปในแนวนอนได้ พร้อมปุ่มลูกศรซ้าย-ขวา (โผล่มาเฉพาะตอนมีรูปเกิน 3 ใบ)
function ScrollRow({ items, height, altFallback, onImageClick, gap }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items]);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 3;
    el.scrollBy({ left: direction * cardWidth * 1.05, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount(-1)}
          aria-label="เลื่อนดูรูปก่อนหน้า"
          style={arrowButtonStyle('left')}
        >
          &#8249;
        </button>
      )}

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
        className="hide-scrollbar"
      >
        {items.map((img) => (
          <div key={img.id} style={{ scrollSnapAlign: 'start' }}>
            <ImageCard
              img={img}
              height={height}
              altFallback={altFallback}
              onClick={() => onImageClick(img)}
            />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scrollByAmount(1)}
          aria-label="เลื่อนดูรูปถัดไป"
          style={arrowButtonStyle('right')}
        >
          &#8250;
        </button>
      )}

      {/* ซ่อน scrollbar เริ่มต้นของเบราว์เซอร์ (webkit) แต่ยังเลื่อนด้วยนิ้ว/เมาส์ได้ */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function arrowButtonStyle(side) {
  return {
    position: 'absolute',
    top: '50%',
    [side]: '-1.1rem',
    transform: 'translateY(-50%)',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    border: '1px solid #E0DCD0',
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    fontSize: '1.4rem',
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 10
  };
}

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
      {/* Designer Rows: 1 แถว = นักกราฟิก 1 คน เลื่อนดูได้ถ้ามีรูปเกิน 3 */}
      {designerGroups.length > 0 && (
        <section style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {designerGroups.map((group) => (
            <div key={group.designer_name}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 'normal', marginBottom: '1.25rem', fontFamily: 'serif', borderBottom: '1px solid #E0DCD0', paddingBottom: '0.5rem' }}>
                {group.designer_name}
              </h3>
              <ScrollRow
                items={group.items}
                height="220px"
                altFallback={group.designer_name}
                onImageClick={setSelectedImage}
                gap="2rem"
              />
            </div>
          ))}
        </section>
      )}

      {/* Product Gallery เดิม: สำหรับรูปที่ไม่มี designer_name เลื่อนดูได้ถ้ามีรูปเกิน 3 */}
      {generalImages.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <ScrollRow
            items={generalImages}
            height="280px"
            altFallback=""
            onImageClick={setSelectedImage}
            gap="2rem"
          />
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