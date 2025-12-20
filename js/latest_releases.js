const grid = document.getElementById('grid');
const bestHeading = document.getElementById('bestHeading');
const bestBy = document.getElementById('bestBy');
const bestHeroImage = document.getElementById('bestHeroImage');
const API = 'https://www.googleapis.com/books/v1/volumes';

async function fetchLatest({ q = 'fiction', max = 30, year } = {}) {
  const yearFilter = year ? `+publishedDate:[${year}-01-01 TO ${year}-12-31]` : '';
  const url = `${API}?q=${encodeURIComponent(q + yearFilter)}&orderBy=newest&maxResults=${max}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.items || []).map(v => {
    const info = v.volumeInfo || {};
    const images = info.imageLinks || {};
    // pick the largest available image, fall back to placeholder
    const cover =
      images.extraLarge ||
      images.large ||
      images.medium ||
      images.thumbnail ||
      'https://via.placeholder.com/240x360?text=No+Cover';
    return {
      id: v.id,
      title: info.title || 'Untitled',
      authors: (info.authors || ['Unknown']).join(', '),
      desc: info.description || info.subtitle || 'No description available.',
      cover: cover.replace('http:', 'https:'),
      previewLink: info.previewLink || info.infoLink || '',
      pubDate: info.publishedDate || '',
      rating: info.averageRating || null,
    };
  });
}

function showSkeleton(count = 8) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'book-card skeleton';
    sk.innerHTML = `<div class="cover"></div><div class="title"></div><div class="author"></div>`;
    grid.appendChild(sk);
  }
}

function renderGrid(books) {
  grid.innerHTML = '';
  if (!books.length) {
    grid.innerHTML = `<div style="opacity:0.7;padding:24px">No new releases found.</div>`;
    return;
  }

  setBestBook(books[0]);

  books.forEach(b => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.tabIndex = 0;
    const isNew = isRecent(b.pubDate, 90);
    card.innerHTML = `
      <div class="cover"><img src="${b.cover}" alt="${escapeHtml(b.title)} cover"></div>
      <div class="title">${escapeHtml(b.title)}</div>
      <div class="author">${escapeHtml(b.authors)}</div>
      <div class="meta">
        ${isNew ? `<span class="badge">New</span>` : ''}
      </div>
      ${b.rating ? `<div class="rating">★ ${b.rating.toFixed(1)}</div>` : ''}
    `;
    card.addEventListener('click', () => openModal(b));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(b); });
    grid.appendChild(card);
  });
}

function setBestBook(book) {
  if (!book) return;
  bestHeading.textContent = (book.title || 'Best Reviewed Book').toUpperCase();
  bestBy.textContent = book.authors || '';
  bestHeroImage.src = book.cover;
  bestHeroImage.alt = `${book.title || 'Book'} cover`;
}

function isRecent(pubDate, days = 90) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}
function shortDate(pubDate) {
  // Handles YYYY or YYYY-MM-DD
  if (/^\d{4}$/.test(pubDate)) return pubDate;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}





const modal = document.getElementById('modal');
const modalCover = document.getElementById('modalCover');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDesc = document.getElementById('modalDesc');
const closeModalBtn = document.getElementById('closeModal');
const previewLink = document.getElementById('previewLink');
const noPreview = document.getElementById('noPreview');

function openModal(book) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalCover.src = book.cover;
  modalTitle.textContent = book.title;
  modalAuthor.textContent = book.authors;
  modalDesc.textContent = book.desc;
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
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

async function load() {
  try {
    showSkeleton();
    const currentYear = new Date().getFullYear();
    const books = await fetchLatest({ q: 'fiction', max: 20, year: currentYear });
    renderGrid(books);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="opacity:0.7;padding:24px">Error loading releases.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', load);