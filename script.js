async function initSite() {
  const res = await fetch('manifest.json');
  const manifest = await res.json();

  const TOTAL_PAGES = 25;
  const EXCLUDED = [3]; // page sans contenu, retirée du livre

  const pagebar = document.getElementById('pagebar');
  const pagesRoot = document.getElementById('pages');
  const heroCount = document.getElementById('hero-count');

  const availablePages = Object.keys(manifest).map(Number).sort((a,b)=>a-b);
  heroCount.textContent = availablePages.length;

  for (let n = 1; n <= TOTAL_PAGES; n++) {
    if (EXCLUDED.includes(n)) continue;

    // Nav button
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = n;
    btn.dataset.page = n;
    btn.addEventListener('click', () => goToPage(n));
    pagebar.appendChild(btn);

    // Section
    const section = document.createElement('section');
    section.className = 'page-section';
    section.id = `page-${n}`;

    const head = document.createElement('div');
    head.className = 'page-head';
    head.innerHTML = `<span class="num">${n}</span><span class="of">page ${n} / ${TOTAL_PAGES}</span>`;
    section.appendChild(head);

    if (n === 1 && !manifest[n]) {
      const empty = document.createElement('div');
      empty.className = 'empty-page';
      empty.innerHTML = `<div class="glyph">🤪🫠</div><p>Désolé, on n'a pas pris de photo... on avait trop froid !</p>`;
      section.appendChild(empty);
    } else if (manifest[n] && manifest[n].length) {
      const gallery = document.createElement('div');
      gallery.className = 'gallery';
      manifest[n].forEach(item => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (item.type === 'video' ? ' video' : '');
        if (item.type === 'image') {
          tile.innerHTML = `<img src="${item.file}" loading="lazy" alt="Souvenir page ${n}">`;
        } else {
          tile.innerHTML = `<video src="${item.file}#t=0.5" preload="metadata" muted playsinline></video>`;
        }
        tile.addEventListener('click', () => openLightbox(item));
        gallery.appendChild(tile);
      });
      section.appendChild(gallery);
    } else {
      const soon = document.createElement('div');
      soon.className = 'soon-page';
      soon.innerHTML = `<p>Cette page arrive bientôt ✧</p>`;
      section.appendChild(soon);
    }

    pagesRoot.appendChild(section);
  }

  function goToPage(n) {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.page) === n));
    document.querySelectorAll('.page-section').forEach(s => s.classList.toggle('active', s.id === `page-${n}`));
    const activeBtn = document.querySelector(`.page-btn[data-page="${n}"]`);
    if (activeBtn) activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    history.replaceState(null, '', `#page${n}`);
    window.scrollTo({ top: document.getElementById('pagebar').offsetTop, behavior: 'smooth' });
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');

  function openLightbox(item) {
    lightboxContent.innerHTML = item.type === 'image'
      ? `<img src="${item.file}" alt="">`
      : `<video src="${item.file}" controls autoplay playsinline></video>`;
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxContent.innerHTML = '';
  }

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // Initial page from hash, or first available page
  const hashMatch = location.hash.match(/#page(\d+)/);
  const startPage = hashMatch ? Number(hashMatch[1]) : availablePages[0];
  goToPage(startPage);
}

initSite();
