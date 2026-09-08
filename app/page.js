import pool from '../lib/db';

export default async function Home() {
  // 1. ดึงข้อมูล Hero Section จากตาราง settings
  const [settingsRows] = await pool.query('SELECT * FROM settings');
  const settings = {};
  settingsRows.forEach(row => {
    settings[row.key_name] = row.value_text;
  });

  // 2. ดึงข้อมูลหมวดหมู่หลักจากตาราง pages
  const [mainPages] = await pool.query('SELECT * FROM pages WHERE parent_id IS NULL');

  return (
    <div style={{ backgroundColor: '#FAF9F6', color: '#1A1A1A', minHeight: '100vh', fontFamily: 'serif', padding: '0 2rem 4rem' }}>
      
      {/* Hero Section (ดึงข้อมูลจาก DB) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 0 6rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '1rem' }}>
            {settings.hero_tag || 'Loading...'}
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'normal', lineHeight: '1.1', marginBottom: '1.5rem', fontFamily: 'serif' }}>
            {settings.hero_title || 'Loading...'}
          </h1>
          
          {/* ใช้ dangerouslySetInnerHTML และ whiteSpace: 'pre-line' เพื่อรองรับการเว้นบรรทัด */}
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

        {/* Hero Image Section (ดึงรูปจาก settings.hero_image มาแสดงผล) */}
        <div style={{ backgroundColor: '#EFECE6', height: '400px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
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

      {/* Categories / Dynamic Links from Database */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #E0DCD0', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'normal', marginBottom: '1rem', fontFamily: 'serif' }}>
          Explore Categories
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '3rem', fontFamily: 'sans-serif' }}>
          Select a category below to discover nested pages and deep-dive content.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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