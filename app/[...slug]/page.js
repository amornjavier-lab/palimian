export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function Page({ params }) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const { env } = await getCloudflareContext();

  const pageResult = await env.palimian.prepare('SELECT * FROM pages WHERE slug_path = ?').bind(slugPath).all();
  const rows = pageResult.results;

  if (rows.length === 0) {
    notFound();
  }
  const currentPage = rows[0];

  const pathSegments = slug;
  let breadcrumbs = [{ title: 'หน้าแรก', path: '/' }];
  let accumulatedPath = '';
  for (const part of pathSegments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
    const matchResult = await env.palimian.prepare('SELECT title, slug_path FROM pages WHERE slug_path = ?').bind(accumulatedPath).all();
    const matchRows = matchResult.results;
    if (matchRows.length > 0) {
      breadcrumbs.push({ title: matchRows[0].title, path: `/${matchRows[0].slug_path}` });
    }
  }

  // ดึงรูปทั้งหมด เรียงตาม designer_order ก่อน แล้วค่อย id
  const imagesResult = await env.palimian
    .prepare('SELECT * FROM page_images WHERE page_id = ? ORDER BY designer_order ASC, id ASC')
    .bind(currentPage.id)
    .all();
  const images = imagesResult.results;

  // แยกรูปที่มี designer_name (กลุ่มนักกราฟิก) กับรูปที่ไม่มี (แบบเดิม)
  const designerImages = images.filter((img) => img.designer_name);
  const generalImages = images.filter((img) => !img.designer_name);

  // จัดกลุ่มรูปตามชื่อนักกราฟิก -> แต่ละกลุ่มเป็น 1 แถว
  const designerGroups = [];
  const groupMap = new Map();
  for (const img of designerImages) {
    if (!groupMap.has(img.designer_name)) {
      const group = { designer_name: img.designer_name, items: [] };
      groupMap.set(img.designer_name, group);
      designerGroups.push(group);
    }
    groupMap.get(img.designer_name).items.push(img);
  }

  const subPagesResult = await env.palimian.prepare('SELECT * FROM pages WHERE parent_id = ?').bind(currentPage.id).all();
  const subPages = subPagesResult.results;

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
                      <div style={{ width: '100%', height: '220px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EFECE6' }}>
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
                  <div style={{ width: '100%', height: '280px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EFECE6' }}>
                    <img
                      src={img.image_url}
                      alt={img.title || currentPage.title}
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