/* ===========
   Grid + Bookshelf + Viewer
   =========== */

/* DOM refs */

// Navbar / toggle behavior is handled globally in js/script.js
// This file only contains genre-page specific logic below.
const grid = document.getElementById('grid');
const shelfContainer = document.getElementById('shelfContainer');
// Use a page-specific name to avoid clashing with global searchInput in script.js
const genreSearchInput = document.getElementById('searchInput');
const genreItems = document.querySelectorAll('.genre-item');

const modal = document.getElementById('modal');
const modalCover = document.getElementById('modalCover');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDesc = document.getElementById('modalDesc');
const closeModalBtn = document.getElementById('closeModal');
const previewLink = document.getElementById('previewLink');
const noPreview = document.getElementById('noPreview');

const bestHeading = document.getElementById('bestHeading');
const bestBy = document.getElementById('bestBy');
const bestHeroImage = document.getElementById('bestHeroImage');

/* state */
let state = { genre: 'all', query: '' };

/* debounce helper */
function debounce(fn, wait = 250) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* fetch from Google Books API */
async function fetchVolumes(q, max = 30) {
  const safeQ = q && q !== 'all' ? q : 'fiction';
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(safeQ)}&maxResults=${max}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.items || []).map(v => {
      const info = v.volumeInfo || {};
      return {
        id: v.id,
        title: info.title || 'Untitled',
        authors: (info.authors || ['Unknown']).join(', '),
        desc: info.description || info.subtitle || '',
        cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/128x192?text=No+Cover',
        previewLink: info.previewLink || info.infoLink || '',
      };
    });
  } catch (err) {
    console.error('fetchVolumes error', err);
    return [];
  }
}

/* render grid of cards */
async function renderGrid() {
  grid.innerHTML = `<div style="opacity:0.6;padding:28px">Loading…</div>`;
  const q = state.query.trim() || state.genre;
  const volumes = await fetchVolumes(q, 20);
  if (!volumes.length) {
    grid.innerHTML = `<div style="opacity:0.6;padding:28px">No results.</div>`;
    renderShelves([]); // clear shelves too
    return;
  }

  grid.innerHTML = '';
  volumes.forEach(b => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="cover" aria-hidden="true"><img src="${b.cover}" alt="${escapeHtml(b.title)} cover"></div>
      <div class="title">${escapeHtml(b.title)}</div>
      <div class="author">${escapeHtml(b.authors)}</div>
    `;
    card.addEventListener('click', () => openModal(b));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(b) });
    grid.appendChild(card);
  });

  // mark the first as "best reviewed" for banner
  const best = volumes[0];
  if (best) {
    bestHeading.textContent = (best.title || 'Best Reviewed Book').toUpperCase();
    bestBy.textContent = best.authors;
    bestHeroImage.src = best.cover;
  }

  // populate shelves from the same result set (only if shelfContainer exists)
  if (shelfContainer) {
    renderShelves(volumes);
  }
}

/* populate shelves dynamically based on number of books */
function renderShelves(volumes) {
  if (!shelfContainer) return;
  if (!volumes || volumes.length === 0) {
    shelfContainer.innerHTML = '';
    return;
  }

  shelfContainer.innerHTML = '';

  // Calculate books per row based on current grid width
  const gridStyle = getComputedStyle(grid);
  const gridGap = parseInt(gridStyle.getPropertyValue('gap')) || 18;
  const gridWidth = grid.clientWidth;
  const minBookWidth = 140; // same as your CSS minmax
  const booksPerRow = Math.floor((gridWidth + gridGap) / (minBookWidth + gridGap)) || 1;

  const totalRows = Math.ceil(volumes.length / booksPerRow);

  // Pre-create all shelves
  const shelves = [];
  for (let row = 0; row < totalRows; row++) {
    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    shelf.innerHTML = `
      <div class="books-row" role="list" aria-label="Shelf ${row + 1}"></div>
      <div class="shelf-board" aria-hidden="true"></div>
    `;
    shelfContainer.appendChild(shelf);
    shelves.push(shelf.querySelector('.books-row'));
  }

  // Populate books into each shelf row
  volumes.forEach((book, idx) => {
    const rowIdx = Math.floor(idx / booksPerRow);
    const row = shelves[rowIdx];

    const bookEl = document.createElement('div');
    bookEl.className = 'book';
    bookEl.tabIndex = 0;
    bookEl.innerHTML = `
      <img src="${book.cover}" alt="${escapeHtml(book.title)} cover">
      <div class="s-title">${escapeHtml(book.title)}</div>
      <div class="s-author">${escapeHtml(book.authors)}</div>
    `;
    bookEl.addEventListener('click', () => openModal(book));
    bookEl.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(book); });

    row.appendChild(bookEl);
  });
}

/* universal modal viewer */
function openModal(book) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalCover.src = book.cover;
  modalTitle.textContent = book.title;
  modalAuthor.textContent = book.authors;
  modalDesc.innerHTML = book.desc ? book.desc : 'No description available.';
  if (book.previewLink) {
    previewLink.href = book.previewLink;
    previewLink.style.display = 'inline-block';
    noPreview.textContent = '';
  } else {
    previewLink.style.display = 'none';
    noPreview.textContent = 'Preview not available';
  }
  document.body.style.overflow = 'hidden';

  // Persist this view for the Recently Viewed widget
  if (typeof saveRecentBook === 'function') {
    saveRecentBook(book);
  }
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* attach modal events */
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* small utility */
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

/* genres click handlers */
genreItems.forEach(item => {
  item.addEventListener('click', () => {
    genreItems.forEach(g => g.classList.remove('selected'));
    item.classList.add('selected');
    state.genre = item.dataset.genre || 'all';
    renderGrid();
  });
});

/* search input */
if (genreSearchInput) {
  const debouncedSearch = debounce(v => {
    state.query = v.trim();
    renderGrid();
  }, 350);
  genreSearchInput.addEventListener('input', e => debouncedSearch(e.target.value));
}

/* initial load */
(async function init() {
  const hash = window.location.hash.substring(1); // remove #
  const genreItem = document.querySelector(`.genre-item[data-genre="${hash}"]`);
  if (genreItem) {
    genreItem.click();
  } else {
    await renderGrid();
  }
})();

// Handle hash changes (e.g., from navbar dropdown clicks)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  const genreItem = document.querySelector(`.genre-item[data-genre="${hash}"]`);
  if (genreItem) {
    genreItem.click();
  }
});
 
