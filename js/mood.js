
const moodQueries = {
  'all': 'bestsellers OR popular fiction',
  'happy': 'happiness OR comedy OR uplifting OR feel-good',
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

// Navbar toggle/submenus are handled globally in js/script.js


moodSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = moodSearchInput.value.trim();
    if (query) {
      fetchBooks(query);
      deselectMoods();
    }
  }
});

// Mood selection
moodItems.forEach(item => {
  item.addEventListener('click', () => {
    moodItems.forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    const mood = item.dataset.mood;
    const query = moodQueries[mood] || 'fiction';
    fetchBooks(query);
    moodSearchInput.value = '';
  });
});

//Fetch books from Google Books API
async function fetchBooks(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance`);
    const data = await response.json();
    const books = data.items || [];
    displayBooks(books);
    if (books.length > 0) {
      setBestBook(books[0]);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    grid.innerHTML = '<p>Sorry, something went wrong. Please try again later.</p>';
  }
}

//Display books in grid
function displayBooks(books) {
  grid.innerHTML = '';
  if (books.length === 0) {
    grid.innerHTML = '<p>No books found. Try a different mood or search.</p>';
    return;
  }
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.classList.add('book-card');
    card.innerHTML = `
      <div class="cover">
        <img src="${info.imageLinks?.thumbnail || '/assets/placeholder.jpg'}" alt="${info.title || 'Book cover'}">
      </div>
      <h3 class="title">${info.title || 'Unknown Title'}</h3>
      <p class="author">${info.authors?.join(', ') || 'Unknown Author'}</p>
    `;
    card.addEventListener('click', () => openModal(book));
    grid.appendChild(card);
  });
}

//Set best reviewed book
function setBestBook(book) {
  const info = book.volumeInfo;
  bestHeading.textContent = info.title || 'Featured Book';
  bestBy.textContent = info.authors?.join(', ') || 'Unknown Author';
  bestHeroImage.src = info.imageLinks?.thumbnail || '/assets/placeholder.jpg';
  bestHeroImage.alt = `${info.title || 'Book'} cover`;
}

function openModal(book) {
  const info = book.volumeInfo;
  modalCover.src = info.imageLinks?.thumbnail || '/assets/placeholder.jpg';
  modalTitle.textContent = info.title || 'Unknown Title';
  modalAuthor.textContent = info.authors?.join(', ') || 'Unknown Author';
  modalDesc.textContent = info.description || 'No description available.';
  
  if (book.accessInfo?.webReaderLink) {
    previewLink.href = book.accessInfo.webReaderLink;
    previewLink.style.display = 'inline-block';
    noPreview.style.display = 'none';
  } else {
    previewLink.style.display = 'none';
    noPreview.textContent = 'No preview available.';
    noPreview.style.display = 'block';
  }
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Persist this view for the Recently Viewed widget
  if (typeof saveRecentBook === 'function') {
    const recentBook = {
      id: book.id,
      title: info.title || 'Unknown Title',
      authors: info.authors?.join(', ') || 'Unknown Author',
      cover: info.imageLinks?.thumbnail || '/assets/placeholder.jpg',
      desc: info.description || 'No description available.',
      previewLink: book.accessInfo?.webReaderLink || info.infoLink || ''
    };
    saveRecentBook(recentBook);
  }
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function deselectMoods() {
  moodItems.forEach(i => i.classList.remove('selected'));
  document.querySelector('.mood-item[data-mood="all"]').classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.substring(1); // remove #
  const moodItem = document.querySelector(`.mood-item[data-mood="${hash}"]`);
  if (moodItem) {
    moodItem.click();
  } else {
    const allMood = document.querySelector('.mood-item[data-mood="all"]');
    if (allMood) {
      allMood.click();
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