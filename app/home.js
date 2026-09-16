export const dynamic = 'force-dynamic';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function Home() {
  // ดึง Cloudflare Context เพื่อเข้าถึง D1 Database Binding
  const { env } = await getCloudflareContext();

  // 1. ดึงข้อมูล Hero Section จากตาราง settings ใน D1
  const settingsRows = await env.palimian.prepare('SELECT * FROM settings').all();
  const settings = {};
  settingsRows.results.forEach(row => {
    settings[row.key_name] = row.value_text;
  });

  // 2. ดึงข้อมูลหมวดหมู่หลักจากตาราง pages ใน D1
  const mainPagesResult = await env.palimian.prepare('SELECT * FROM pages WHERE parent_id IS NULL').all();
  const mainPages = mainPagesResult.results;

  return (
    <div className="palimian-home" style={{ backgroundColor: '#FAF9F6', color: '#1A1A1A', minHeight: '100vh', fontFamily: 'serif' }}>

      {/* CSS สำหรับปรับ layout อัตโนมัติตามขนาดจอ (responsive) */}
      <style>{`
        .palimian-home {
          padding: 0 2rem 4rem;
        }
        .palimian-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 0 6rem;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .palimian-hero-title {
          font-size: 3.5rem;
          font-weight: normal;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-family: serif;
        }
        .palimian-hero-image {
          background-color: #EFECE6;
          height: 400px;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .palimian-categories {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid #E0DCD0;
          padding-top: 4rem;
        }
        .palimian-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        /* จอแท็บเล็ต/มือถือแนวนอน */
        @media (max-width: 900px) {
          .palimian-hero-title {
            font-size: 2.6rem;
          }
        }

        /* จอมือถือ */
        @media (max-width: 640px) {
          .palimian-home {
            padding: 0 1.25rem 3rem;
          }
          .palimian-hero {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2.5rem 0 3rem;
          }
          .palimian-hero-title {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .palimian-hero-image {
            height: 260px;
          }
          .palimian-categories {
            padding-top: 2.5rem;
          }
          .palimian-categories h2 {
            font-size: 1.6rem;
          }
        }
      `}</style>

      {/* Hero Section (ดึงข้อมูลจาก D1) */}
      <section className="palimian-hero">
        <div>
          <span style={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '1rem' }}>
            {settings.hero_tag || 'Loading...'}
          </span>
          <h1 className="palimian-hero-title">
            {settings.hero_title || 'Loading...'}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#555',
              lineHeight: '1.6',
              marginBottom: '2rem',
              fontFamily: 'sans-serif',
              whiteSpace: 'pre-line'
            }}
            dangerouslySetInnerHTML={{ __html: settings.hero_desc || 'Loading...' }}
          />
        </div>

        {/* Hero Image Section */}
        <div className="palimian-hero-image">
          {settings.hero_image ? (
            <img
              src={settings.hero_image}
              alt="Graphic Studio Hero"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
              [ Featured Image ]
            </div>
          )}
        </div>
      </section>

      {/* Categories / Dynamic Links from D1 */}
      <section className="palimian-categories">
        <h2 style={{ fontSize: '2rem', fontWeight: 'normal', marginBottom: '1rem', fontFamily: 'serif' }}>
          Explore Categories
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '3rem', fontFamily: 'sans-serif' }}>
          Select a category below to discover nested pages and deep-dive content.
        </p>

        <div className="palimian-categories-grid">
          {mainPages.map((page) => (
            <a
              key={page.id}
              href={`/${page.slug_path}`}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '2.5rem 2rem',
                borderRadius: '4px',
                border: '1px solid #EBE7DF',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'normal', marginBottom: '0.75rem', color: '#1A1A1A' }}>
                  {page.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5', fontFamily: 'sans-serif', margin: 0 }}>
                  {page.description}
                </p>
              </div>
              <span style={{ marginTop: '2rem', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#1A1A1A', fontWeight: 'bold' }}>
                Explore →
              </span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}