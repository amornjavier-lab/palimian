import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '../../lib/db';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const [rows] = await pool.query('SELECT * FROM pages WHERE slug_path = ?', [slugPath]);
  
  if (rows.length === 0) return { title: 'Not Found' };
  return {
    title: rows[0].title,
    description: rows[0].description,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  // 1. ดึงข้อมูลของหน้าปัจจุบัน
  const [rows] = await pool.query('SELECT * FROM pages WHERE slug_path = ?', [slugPath]);
  if (rows.length === 0) {
    notFound();
  }
  const currentPage = rows[0];

  // 2. ดึง Breadcrumb (เส้นทางย้อนกลับ)
  const pathSegments = slug;
  let breadcrumbs = [{ title: 'หน้าแรก', path: '/' }];
  let accumulatedPath = '';
  for (const part of pathSegments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
    const [matchRows] = await pool.query('SELECT title, slug_path FROM pages WHERE slug_path = ?', [accumulatedPath]);
    if (matchRows.length > 0) {
      breadcrumbs.push({ title: matchRows[0].title, path: `/${matchRows[0].slug_path}` });
    }
  }

  // 3. ดึงรูปภาพทั้งหมดจากตาราง page_images ที่ผูกกับหน้านี้
  const [images] = await pool.query('SELECT * FROM page_images WHERE page_id = ?', [currentPage.id]);

  // 4. ดึงหน้าย่อย (Subpages) ภายใต้หน้านี้
  const [subPages] = await pool.query('SELECT * FROM pages WHERE parent_id = ?', [currentPage.id]);

  return (
    <div style={{ backgroundColor: '#FAF9F6', color: '#1A1A1A', minHeight: '100vh', fontFamily: 'serif', padding: '0 2rem 4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '3rem' }}>
        
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.85rem', color: '#666', marginBottom: '2rem', fontFamily: 'sans-serif' }}>
          {breadcrumbs.map((b, index) => (
            <span key={b.path}>
              {index > 0 && ' / '}
              <Link href={b.path} style={{ color: '#666', textDecoration: 'none' }}>{b.title}</Link>
            </span>
          ))}
        </nav>

        {/* Title & Description */}
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid #E0DCD0', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'normal', lineHeight: '1.2', marginBottom: '1rem', fontFamily: 'serif' }}>
            {currentPage.title}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6', fontFamily: 'sans-serif', margin: '0 0 2rem 0' }}>
            {currentPage.description}
          </p>
        </header>

        {/* Main Content */}
        <section 
          style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', fontFamily: 'sans-serif', marginBottom: '3rem' }} 
          dangerouslySetInnerHTML={{ __html: currentPage.content }} 
        />

        {/* Product Gallery Grid: Exactly 3 Columns */}
        {images.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '2.5rem 2rem' 
            }}>
              {images.map((img) => (
                <div key={img.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* กรอบรูปภาพ */}
                  <div style={{ width: '100%', height: '280px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EFECE6' }}>
                    <img 
                      src={img.image_url} 
                      alt={img.title || currentPage.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  {/* ชื่อสินค้าใต้รูปภาพ */}
                  <span style={{ marginTop: '0.75rem', fontSize: '1.05rem', fontFamily: 'sans-serif', color: '#1A1A1A', fontWeight: '500' }}>
                    {img.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Subpages Section */}
        {subPages.length > 0 && (
          <section style={{ borderTop: '1px solid #E0DCD0', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'normal', marginBottom: '1rem', fontFamily: 'serif' }}>หน้าย่อยในหมวดนี้</h3>
            <ul style={{ paddingLeft: '1.2rem', fontFamily: 'sans-serif' }}>
              {subPages.map((sub) => (
                <li key={sub.id} style={{ marginBottom: '0.5rem' }}>
                  <Link href={`/${sub.slug_path}`} style={{ color: '#1A1A1A', textDecoration: 'underline' }}>
                    {sub.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}