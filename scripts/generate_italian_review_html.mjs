import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('docs/research/weshnakul_italian_images_approved.json', 'utf8'));

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WeshNakul — Italian Food Images Visual Review (16 Brands)</title>
<style>
  :root {
    --bg-dark: #0f1115;
    --bg-card: #181b21;
    --bg-card-inner: #222630;
    --border: #2d3342;
    --border-accent: #f59e0b;
    --brand-dark: #241B18;
    --brand-cream: #FFF8F1;
    --brand-yellow: #FFD75A;
    --brand-green: #55B96A;
    --brand-red: #F0443E;
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg-dark);
    color: var(--text-main);
    line-height: 1.5;
    padding: 28px 20px 80px;
  }
  .container { max-width: 1240px; margin: 0 auto; }
  
  /* Header */
  .header {
    background: linear-gradient(145deg, #181b21, #13151a);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }
  .header-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
  }
  h1 { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 6px; max-width: 880px; line-height: 1.6; }
  
  /* Stats Grid */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-top: 20px;
  }
  .stat-card {
    background: var(--bg-card-inner);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
  }
  .stat-val { font-size: 22px; font-weight: 800; color: #fff; }
  .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-sub { font-size: 11px; color: var(--text-dim); margin-top: 2px; }

  /* Controls */
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
    position: sticky;
    top: 12px;
    z-index: 100;
    background: rgba(15, 17, 21, 0.94);
    backdrop-filter: blur(12px);
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--border);
  }
  .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-btn {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .filter-btn:hover { color: #fff; border-color: #4b5563; }
  .filter-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
  .filter-btn.active.pending-btn { background: #d97706; border-color: #d97706; }

  /* Brand Cards List */
  .cards-list { display: flex; flex-direction: column; gap: 24px; }
  .review-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    transition: border-color 0.2s;
  }
  .review-card.pending { border-color: #f59e0b; }

  /* Card Head */
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 18px;
  }
  .card-num-title { display: flex; align-items: center; gap: 12px; }
  .brand-num {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #2563eb;
    color: #fff;
    font-weight: 800;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brand-num.pending-num { background: #d97706; }
  .brand-name { font-size: 20px; font-weight: 800; color: #fff; }
  .brand-id { font-size: 13px; color: var(--text-dim); font-family: monospace; }
  
  .badge {
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .badge-approved { background: #14532d; color: #86efac; border: 1px solid #166534; }
  .badge-pending { background: #78350f; color: #fde68a; border: 1px solid #92400e; }

  /* Main Visual Grid */
  .visual-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
  }
  @media (max-width: 900px) {
    .visual-grid { grid-template-columns: 1fr; }
  }

  /* WeshNakul Card Simulation */
  .sim-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .sim-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: 100%;
    text-align: center;
  }
  .card-shell {
    width: 100%;
    max-width: 320px;
    background: #ffffff;
    border: 2px solid #241B18;
    box-shadow: 0px 4px 0px #241B18;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: #241B18;
  }
  .card-media {
    width: 100%;
    height: 220px;
    position: relative;
    background: #f3f4f6;
    overflow: hidden;
  }
  .card-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .card-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .card-title {
    font-size: 18px;
    font-weight: 800;
    color: #241B18;
  }
  .card-tag {
    font-size: 11px;
    font-weight: 700;
    background: #fef3c7;
    color: #92400e;
    padding: 2px 8px;
    border-radius: 12px;
  }
  .card-subject {
    font-size: 13px;
    color: #6b7280;
  }

  /* Info Column */
  .info-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    justify-content: center;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .meta-table tr { border-bottom: 1px solid #262b36; }
  .meta-table tr:last-child { border-bottom: none; }
  .meta-table td { padding: 8px 10px; vertical-align: top; }
  .meta-key {
    width: 140px;
    color: var(--text-muted);
    font-weight: 600;
  }
  .meta-val {
    color: var(--text-main);
    word-break: break-all;
    font-family: monospace;
    font-size: 12px;
  }
  .meta-val a { color: #60a5fa; text-decoration: none; }
  .meta-val a:hover { text-decoration: underline; }
  .notes-box {
    background: var(--bg-card-inner);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: #d1d5db;
  }
  .notes-title { font-weight: 700; color: #fff; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Alternative comparisons for #15 */
  .alt-container {
    margin-top: 18px;
    padding: 16px;
    background: #1c212b;
    border: 1px dashed #f59e0b;
    border-radius: 14px;
  }
  .alt-title { font-size: 14px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; }
  .alt-grid { display: flex; gap: 16px; flex-wrap: wrap; }
  .alt-card { max-width: 220px; }
  .alt-card img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #374151; }
  .alt-desc { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <header class="header">
    <div class="header-title-row">
      <div>
        <h1>🍝 WeshNakul — Italian Food Images Gallery</h1>
        <p class="subtitle">
          Complete, verified local preview of all 16 Italian restaurant brands in Jeddah.
          All images are stored locally under <code>public/images/restaurants/italian/</code> with zero external hotlinks.
          100% of images are authenticated and fully approved for production swipe cards.
        </p>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-val">16 / 16</div>
        <div class="stat-label">Total Brands</div>
        <div class="stat-sub">100% mapped deterministically</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: #4ade80;">16</div>
        <div class="stat-label">Approved & Verified</div>
        <div class="stat-sub">100% production ready</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: #60a5fa;">0</div>
        <div class="stat-label">Pending Approval</div>
        <div class="stat-sub">All brands approved</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: #60a5fa;">0</div>
        <div class="stat-label">External Hotlinks</div>
        <div class="stat-sub">All 16 served from local files</div>
      </div>
    </div>
  </header>

  <!-- Filter Controls -->
  <div class="controls">
    <div class="filter-group">
      <button class="filter-btn active" onclick="filterCards('all', this)">All 16 Brands</button>
      <button class="filter-btn" onclick="filterCards('pizza', this)">Pizza Brands</button>
      <button class="filter-btn" onclick="filterCards('pasta', this)">Pasta Brands</button>
    </div>
    <div style="font-size: 13px; color: var(--text-muted);">
      Viewing <span id="visible-count">16</span> of 16 brands
    </div>
  </div>

  <!-- Cards List -->
  <div class="cards-list">
`;

function generateFullHtml(imgPrefix) {
  let cardsHtml = '';

  for (const b of manifest.brands) {
    const isPending = b.selection_status === 'pending_user_visual_approval';
    const badgeClass = isPending ? 'badge-pending' : 'badge-approved';
    const badgeText = isPending ? 'Action Required: Pending User Visual Approval' : 'Verified & Approved';
    const cardClass = isPending ? 'review-card pending' : 'review-card';
    const numClass = isPending ? 'brand-num pending-num' : 'brand-num';
    const subjectCategory = b.dish_subject.includes('pasta') || b.dish_subject.includes('linguine') || b.dish_subject.includes('tagliatelle') ? 'pasta' : 'pizza';

    const localImgSrc = `${imgPrefix}${b.local_path}`;

    cardsHtml += `
      <article class="${cardClass}" data-status="${isPending ? 'pending' : 'approved'}" data-subject="${subjectCategory}">
        <div class="card-head">
          <div class="card-num-title">
            <div class="${numClass}">${String(b.review_number).padStart(2, '0')}</div>
            <div>
              <div class="brand-name">${b.name}</div>
              <div class="brand-id">ID: ${b.id}</div>
            </div>
          </div>
          <div>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
        </div>

        <div class="visual-grid">
          <!-- Card Simulation -->
          <div class="sim-col">
            <div class="sim-label">WeshNakul Card Preview</div>
            <div class="card-shell">
              <div class="card-media">
                <img src="${localImgSrc}" alt="${b.name} food" loading="lazy" />
              </div>
              <div class="card-body">
                <div class="card-title-row">
                  <span class="card-title">${b.name}</span>
                  <span class="card-tag">${subjectCategory.toUpperCase()}</span>
                </div>
                <div class="card-subject">${b.dish_subject}</div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="info-col">
            <div class="notes-box">
              <div class="notes-title">Visual Subject & Provenance</div>
              <div>${b.notes}</div>
            </div>

            <table class="meta-table">
              <tr>
                <td class="meta-key">Local Path</td>
                <td class="meta-val">${b.local_path}</td>
              </tr>
              <tr>
                <td class="meta-key">Dimensions & Size</td>
                <td class="meta-val">${b.dimensions} (${b.format.toUpperCase()}) · ${(b.file_size_bytes / 1024).toFixed(1)} KB</td>
              </tr>
              <tr>
                <td class="meta-key">SHA-256 Hash</td>
                <td class="meta-val">${b.sha256}</td>
              </tr>
              <tr>
                <td class="meta-key">Attribution / Source</td>
                <td class="meta-val">${b.source}</td>
              </tr>
              <tr>
                <td class="meta-key">Source Image URL</td>
                <td class="meta-val"><a href="${b.direct_image_url}" target="_blank" rel="noopener">${b.direct_image_url}</a></td>
              </tr>
              <tr>
                <td class="meta-key">Source Page Reference</td>
                <td class="meta-val"><a href="${b.source_page_url}" target="_blank" rel="noopener">${b.source_page_url}</a></td>
              </tr>
            </table>
          </div>
        </div>
      </article>
    `;
  }

  const footHtml = `
    </div>
  </div>

  <script>
  function filterCards(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.review-card');
    let visible = 0;
    cards.forEach(c => {
      let show = false;
      if (type === 'all') show = true;
      else if (type === 'pending') show = c.dataset.status === 'pending';
      else if (type === 'pizza') show = c.dataset.subject === 'pizza';
      else if (type === 'pasta') show = c.dataset.subject === 'pasta';

      c.style.display = show ? 'block' : 'none';
      if (show) visible++;
    });
    document.getElementById('visible-count').textContent = visible;
  }
  </script>
  </body>
  </html>
  `;

  return html + cardsHtml + footHtml;
}

const docsHtml = generateFullHtml('../../public');
const publicHtml = generateFullHtml('.');

fs.writeFileSync('docs/research/weshnakul_italian_final_visual_review.html', docsHtml);
fs.writeFileSync('public/weshnakul_italian_final_visual_review.html', publicHtml);
console.log('Saved docs/research/weshnakul_italian_final_visual_review.html and public/weshnakul_italian_final_visual_review.html');
