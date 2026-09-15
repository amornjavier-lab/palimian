'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch('/api/pages', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPages(data);
        }
      } catch (error) {
        setPages([]);
      }
    }
    fetchPages();
  }, []);

  // จัดกลุ่มหน้าเว็บให้เป็นลำดับชั้น: หัวข้อใหญ่ (parent_id เป็น null) และหัวข้อย่อย (มี parent_id)
  const parentPages = pages.filter((page) => !page.parent_id);
  const childPagesByParent = pages.reduce((acc, page) => {
    if (page.parent_id) {
      if (!acc[page.parent_id]) acc[page.parent_id] = [];
      acc[page.parent_id].push(page);
    }
    return acc;
  }, {});

  return (
    <html lang="th">
      <body style={{ margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        
        {/* แถบด้านบนสุด (Navbar) */}
        <header style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          padding: '1.2rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxSizing: 'border-box', 
          zIndex: 1000, 
          fontFamily: 'serif' 
        }}>
          {/* ชื่อเว็บทางซ้ายสุด */}
          <Link href="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1A1A1A', textDecoration: 'none', letterSpacing: '1px' }}>
            PALIMIAN
          </Link>

          {/* ปุ่ม 3 ขีด ทางขวาสุด */}
          <div style={{ position: 'relative', fontFamily: 'sans-serif' }}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              style={{ 
                backgroundColor: '#1A1A1A', 
                color: '#FFF', 
                border: 'none',
                padding: '0.5rem 0.75rem', 
                borderRadius: '4px', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Menu"
            >
              ☰
            </button>
            
            {/* รายการดรอปดาว์นที่จะแสดงเมื่อคลิก */}
            {isOpen && (
              <div 
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '120%', 
                  backgroundColor: '#FFFFFF', 
                  minWidth: '220px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                  borderRadius: '4px', 
                  border: '1px solid #EBE7DF',
                  overflow: 'hidden',
                  zIndex: 1001
                }}
              >
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  style={{ display: 'block', padding: '0.75rem 1rem', color: '#1A1A1A', textDecoration: 'none', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}
                >
                  หน้าแรก
                </Link>

                {/* วนลูปเฉพาะหัวข้อใหญ่ (parent_id เป็น null) แล้วแทรกหัวข้อย่อยของแต่ละอันต่อท้าย */}
                {parentPages.map((page, index) => {
                  const children = childPagesByParent[page.id] || [];
                  const isLastGroup = index === parentPages.length - 1;

                  return (
                    <div key={page.id || page.slug_path}>
                      <Link 
                        href={`/${page.slug_path}`} 
                        onClick={() => setIsOpen(false)}
                        style={{ 
                          display: 'block', 
                          padding: '0.75rem 1rem', 
                          color: '#1A1A1A', 
                          textDecoration: 'none', 
                          fontSize: '0.9rem',
                          fontWeight: 'normal',
                          borderBottom: (children.length === 0 && isLastGroup) ? 'none' : '1px solid #f0f0f0'
                        }}
                      >
                        {page.title}
                      </Link>

                      {/* หัวข้อย่อย: เยื้องเข้าไปด้านใน (indent) และตัวอักษรเล็กลงเล็กน้อย */}
                      {children.map((child, childIndex) => (
                        <Link
                          key={child.id || child.slug_path}
                          href={`/${child.slug_path}`}
                          onClick={() => setIsOpen(false)}
                          style={{
                            display: 'block',
                            padding: '0.6rem 1rem 0.6rem 2rem',
                            color: '#555',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            backgroundColor: '#FAF9F6',
                            borderBottom: (childIndex === children.length - 1 && isLastGroup) ? 'none' : '1px solid #f0f0f0'
                          }}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* เนื้อหาหลัก */}
        <div style={{ flex: 1, paddingTop: '4rem' }}>
          {children}
        </div>
        
        {/* แถบช่องทางติดต่อด้านล่างทุกหน้า */}
        <footer style={{ backgroundColor: '#1A1A1A', color: '#FFF', padding: '1.5rem 2rem', fontFamily: 'sans-serif', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>ช่องทางติดต่อเรา</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#ccc' }}>โทร: 02-XXX-XXXX | อีเมล: palimian.varee@gmail.com</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#ccc' }}>Line: @978wnmxg</span>
              <span style={{ color: '#ccc' }}>Facebook: MyWebsite</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}