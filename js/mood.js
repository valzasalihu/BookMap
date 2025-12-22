const moodQueries = {
  'all': 'bestsellers OR popular fiction',
  // Expanded query to improve results for "Happy"
  'happy': 'subject:Humor OR subject:Comedy OR subject:Happiness OR joy OR uplifting OR feel good OR lighthearted',
  'sad': 'tragedy OR drama OR melancholy OR emotional',
  'adventurous': 'adventure OR exploration OR fantasy OR quest',
  'motivated': 'motivation OR inspiration OR self-help OR success',
  'frustrated': 'overcoming challenges OR resilience OR frustration OR thriller'
};

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const navbar = document.querySelector('.navbar');
const navMenu = document.getElementById('navMenu');
const moodSearchInput = document.getElementById('searchInput');
const moodItems = document.querySelectorAll('.mood-item');
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const modalCover = document.getElementById('modalCover');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalDesc = document.getElementById('modalDesc');
const previewLink = document.getElementById('previewLink');
const noPreview = document.getElementById('noPreview');
const bestHeading = document.getElementById('bestHeading');
const bestBy = document.getElementById('bestBy');
const bestHeroImage = document.getElementById('bestHeroImage');


/* state */
let state = { mood: 'all', query: '' };

/* debounce helper */
function debounce(fn, wait = 250) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* small utility */
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

// Fetch books from Google Books API with localStorage cache
async function fetchBooks(query, max = 30) {
  const cacheKey = `${query}_${max}`;
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  const safeQuery = query || 'bestsellers fiction nonfiction'; // Fallback for empty
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(safeQuery)}&maxResults=${max}&orderBy=relevance`);
    const data = await response.json();
    const { items = [] } = data; // Destructuring
    const books = items.map(v => {
      const { volumeInfo: info = {} } = v; // Destructuring
      return {
        id: v.id,
        title: info.title || 'Untitled',
        authors: (info.authors || ['Unknown']).join(', '),
        desc: info.description || info.subtitle || '',
        cover: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '/assets/placeholder.jpg',
        previewLink: v.accessInfo?.webReaderLink || info.previewLink || info.infoLink || '',
      };
    });
    localStorage.setItem(cacheKey, JSON.stringify(books));
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Render books in grid
async function renderGrid() {
  grid.innerHTML = '<p style="opacity:0.6;padding:28px">Loading…</p>';
  const q = state.query.trim() || moodQueries[state.mood] || 'fiction';
  let books;
  try {
    books = await fetchBooks(q, 30); // Consistent max
    // If "happy" yields no results, try a broader, safer fallback
    if (books.length === 0 && state.mood === 'happy') {
      const fallbackQuery = 'humor OR comedy OR romance OR uplifting';
      books = await fetchBooks(fallbackQuery, 30);
    }
    if (books.length === 0) {
      grid.innerHTML = '<p>No books found. Try a different mood or search.</p>';
      return;
    }
  } catch (error) {
    grid.innerHTML = '<p>Sorry, something went wrong. Please try again later.</p>';
    return;
  }

  grid.innerHTML = '';
  books.forEach(b => {
    const card = document.createElement('div');
    card.classList.add('book-card');
    card.tabIndex = 0;
    card.role = 'button'; // Accessibility
    card.innerHTML = `
      <div class="cover">
        <img src="${b.cover}" alt="${escapeHtml(b.title)} cover">
      </div>
      <h3 class="title">${escapeHtml(b.title)}</h3>
      <p class="author">${escapeHtml(b.authors)}</p>
    `;
    card.addEventListener('click', () => openModal(b));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(b); });
    grid.appendChild(card);
  });

  if (books.length > 0) {
    setFeaturedBook(books[0]);
  }
}

// Set featured book (changed from "best reviewed" for accuracy)
function setFeaturedBook(book) {
  bestHeading.textContent = book.title || 'Featured Book';
  bestBy.textContent = book.authors || 'Unknown Author';
  bestHeroImage.src = book.cover;
  bestHeroImage.alt = `${escapeHtml(book.title)} cover`;
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

// Deselect moods
function deselectMoods() {
  moodItems.forEach(i => i.classList.remove('selected'));
}

// Mood selection
moodItems.forEach(item => {
  item.addEventListener('click', () => {
    moodItems.forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    state.mood = item.dataset.mood || 'all';
    state.query = ''; // Clear query on mood select
    moodSearchInput.value = '';
    renderGrid();
  });
});

// Search input (changed to debounced input for live search)
if (moodSearchInput) {
  const debouncedSearch = debounce(v => {
    state.query = v.trim();
    if (state.query) {
      deselectMoods();
      document.querySelector('.mood-item[data-mood="all"]')?.classList.add('selected');
    }
    renderGrid();
  }, 350);
  moodSearchInput.addEventListener('input', e => debouncedSearch(e.target.value));
}

document.addEventListener('DOMContentLoaded', async () => {
  // Support navbar searches: if q param exists, render based on query
  const params = new URLSearchParams(window.location.search);
  const qParam = (params.get('q') || '').trim();
  if (qParam) {
    state.query = qParam;
    deselectMoods();
    document.querySelector('.mood-item[data-mood="all"]')?.classList.add('selected');
    await renderGrid();
    return;
  }

  const hash = window.location.hash.substring(1); // remove #
  const moodItem = document.querySelector(`.mood-item[data-mood="${hash}"]`);
  if (moodItem) {
    moodItem.click();
  } else {
    const allMood = document.querySelector('.mood-item[data-mood="all"]');
    if (allMood) {
      allMood.click();
    } else {
      await renderGrid();
    }
  }
});

// Handle hash changes (e.g., from navbar dropdown clicks)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  const moodItem = document.querySelector(`.mood-item[data-mood="${hash}"]`);
  if (moodItem) {
    moodItem.click();
  }
});