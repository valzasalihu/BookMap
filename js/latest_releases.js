
const grid = document.getElementById('grid');
const bestHeading = document.getElementById('bestHeading');
const bestBy = document.getElementById('bestBy');
const bestHeroImage = document.getElementById('bestHeroImage');

const modal = document.getElementById('modal');
const modalCover = document.getElementById('modalCover');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDesc = document.getElementById('modalDesc');
const closeModalBtn = document.getElementById('closeModal');
const previewLink = document.getElementById('previewLink');
const noPreview = document.getElementById('noPreview');

const API = 'https://www.googleapis.com/books/v1/volumes';

const CACHE_TTL = 1000 * 60 * 60 * 12; 

function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { time, data } = JSON.parse(raw);
    if (Date.now() - time > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      time: Date.now(),
      data
    }));
  } catch {}
}

async function fetchLatest({ q = 'fiction', max = 30, year } = {}) {
  const cacheKey = `latest_${q}_${max}_${year}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const yearFilter = year
    ? `+publishedDate:[${year}-01-01 TO ${year}-12-31]`
    : '';

  const url = `${API}?q=${encodeURIComponent(q + yearFilter)}&orderBy=newest&maxResults=${max}`;
  const res = await fetch(url);
  const data = await res.json();
  const { items = [] } = data;

  const books = items.map(v => {
    const { volumeInfo: info = {}, accessInfo = {} } = v;
    const images = info.imageLinks || {};
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
      previewLink: accessInfo.webReaderLink || info.previewLink || info.infoLink || '',
      pubDate: info.publishedDate || '',
      rating: info.averageRating || null
    };
  });

  setCache(cacheKey, books);
  return books;
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

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s])
  );
}

function isRecent(pubDate, days = 90) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

function renderGrid(books) {
  grid.innerHTML = '';

  if (!books.length) {
    grid.innerHTML = `<div style="opacity:0.7;padding:24px">No new releases found.</div>`;
    return;
  }

  setBestBook(books[0]);

  books.forEach(book => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="cover">
        <img src="${book.cover}" alt="${escapeHtml(book.title)} cover">
      </div>
      <div class="title">${escapeHtml(book.title)}</div>
      <div class="author">${escapeHtml(book.authors)}</div>
      <div class="meta">
        ${isRecent(book.pubDate) ? `<span class="badge">New</span>` : ''}
      </div>
      ${book.rating ? `<div class="rating">★ ${book.rating.toFixed(1)}</div>` : ''}
    `;

    card.addEventListener('click', () => openModal(book));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') openModal(book);
    });

    grid.appendChild(card);
  });
}

function setBestBook(book) {
  if (!book) return;
  bestHeading.textContent = (book.title || 'Featured Book').toUpperCase();
  bestBy.textContent = book.authors || '';
  bestHeroImage.src = book.cover;
  bestHeroImage.alt = `${book.title || 'Book'} cover`;
}

// Shared modal handlers
const { openModal, closeModal } = createModalHandlers({
  modal,
  modalCover,
  modalTitle,
  modalAuthor,
  modalDesc,
  previewLink,
  noPreview,
  closeModalBtn
});


async function load() {
  try {
    showSkeleton();
    const params = new URLSearchParams(window.location.search);
    const qParam = (params.get('q') || '').trim();
    let books = [];
    if (qParam) {
      // Show search results on Latest page as well
      books = await fetchLatest({ q: qParam, max: 20 });
    } else {
      const currentYear = new Date().getFullYear();
      books = await fetchLatest({ q: 'fiction', max: 20, year: currentYear });
    }
    renderGrid(books);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="opacity:0.7;padding:24px">Error loading releases.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', load);
