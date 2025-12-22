/**
 * CLIENT-SERVER MODEL DEMONSTRATION
 * 
 * When a user clicks "Read Now":
 * 1. The CLIENT (browser) sends an HTTP GET request to the server
 *    for the book text file (e.g., "pride-and-prejudice.txt").
 * 2. The SERVER responds with the file contents (HTTP 200 OK + text/plain).
 * 3. The client receives the response and dynamically inserts the text
 *    into the book viewer using JavaScript.
 * 
 * This is a classic example of client-server communication.
 * 
 * Similar process occurs for loading video/audio sources and captions.
 */

//Navbar scroll effect
const navbarElement = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbarElement.classList.toggle('scrolled', window.scrollY > 50);
});

//Mobile menu logic
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (!navbar || !menuToggle || !navMenu) return;

  const menuItemsWithSubs = Array.from(navMenu.querySelectorAll('li')).filter(li => li.querySelector('ul'));

  const updateBackButtons = () => {
    document.querySelectorAll('.submenu-back-btn').forEach(btn => btn.remove());

    const anySubmenuActive = menuItemsWithSubs.some(item => item.classList.contains('active'));

    if (window.innerWidth <= 768) {
      if (anySubmenuActive) navbar.classList.add('submenu-open');
      else navbar.classList.remove('submenu-open');

      menuItemsWithSubs.forEach(item => {
        if (item.classList.contains('active')) {
          const submenu = item.querySelector('ul');
          if (submenu && !submenu.querySelector('.submenu-back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.className = 'submenu-back-btn';
            backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
            backBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              item.classList.remove('active');
              updateBackButtons();
            });
            submenu.insertBefore(backBtn, submenu.firstChild);
          }
        }
      });
    } else {
      navbar.classList.remove('submenu-open');
    }
  };

  const closeSubmenus = () => {
    menuItemsWithSubs.forEach(item => item.classList.remove('active'));
    updateBackButtons();
  };

  menuToggle.addEventListener('click', () => {
    const menuIsOpen = navbar.classList.contains('open');
    const anySubmenuOpen = menuItemsWithSubs.some(li => li.classList.contains('active'));

    if (menuIsOpen && anySubmenuOpen) {
      closeSubmenus();
      return;
    }

    menuToggle.classList.toggle('active');
    navbar.classList.toggle('open');
    if (!navbar.classList.contains('open')) closeSubmenus();
  });

  document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', (e) => {
      const parentLi = link.closest('li');
      const isTopLevelWithSubmenu = parentLi && parentLi.querySelector('ul') && link === parentLi.querySelector(':scope > a');

      if (isTopLevelWithSubmenu && window.innerWidth <= 768) {
        e.preventDefault();
        menuItemsWithSubs.forEach(item => item !== parentLi && item.classList.remove('active'));
        parentLi.classList.toggle('active');
        setTimeout(updateBackButtons, 50);
        return;
      }

      menuToggle.classList.remove('active');
      navbar.classList.remove('open');
      closeSubmenus();
    });
  });

  updateBackButtons();
  window.addEventListener('resize', updateBackButtons);

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navbar.classList.contains('open')) {
      navbar.classList.remove('open');
      menuToggle.classList.remove('active');
      closeSubmenus();
    }
  });
});

//smooth scroll
const scrollLink = document.getElementById("scrollLink");
if (scrollLink) {
  scrollLink.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.getElementById("trending-books");
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
    }
  });
}

//trending books
const trendingBooks = [
  { img: "images/trending-books/book1.jpg", alt: "Harry Potter book cover", title: "Harry Potter", author: "J.K. Rowling" },
  { img: "images/trending-books/book2.jpg", alt: "The Great Gatsby book cover", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { img: "images/trending-books/book3.jpg", alt: "To Kill a Mockingbird book cover", title: "To Kill a Mockingbird", author: "Harper Lee" },
  { img: "images/trending-books/book4.jpg", alt: "The Story of a Lonely Boy book cover", title: "The Story of a Lonely Boy", author: "Korina Villanueva" },
  { img: "images/trending-books/book5.jpg", alt: "The Beloved Girls book cover", title: "The Beloved Girls", author: "Harriet Evans" },
  { img: "images/trending-books/book6.jpg", alt: "The Metamorphosis book cover", title: "The Metamorphosis", author: "Franz Kafka" }
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;

  [...trendingBooks, ...trendingBooks].forEach(book => {
    const item = document.createElement('div');
    item.className = 'book-item';
    item.innerHTML = `
      <figure>
        <img src="${book.img}" alt="${book.alt}">
        <figcaption>${book.title} <em>by ${book.author}</em></figcaption>
      </figure>
    `;
    grid.appendChild(item);
  });
});

document.querySelectorAll('.read-book-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const viewer = document.getElementById('bookViewer');
    const hardcover = document.querySelector('.hardcover.left');
    const video = document.getElementById('bookVideo');
    const videoSource = document.getElementById('bookVideoSource');
    const captions = document.getElementById('bookCaptions');
    const audio = document.getElementById('bookAudio');
    const audioSource = document.getElementById('bookAudioSource');
    const content = document.getElementById('fullBookContent');
    const titleEl = document.getElementById('overlayTitle');
    const authorEl = document.getElementById('overlayAuthor');

    if (!viewer || !content || !titleEl || !authorEl || !hardcover) return;

    titleEl.textContent = btn.dataset.title;
    authorEl.textContent = 'by ' + btn.dataset.author;

    content.innerHTML = '<p style="text-align:center; padding:100px 0; opacity:0.6; font-style:italic;">Loading...</p>';
    fetch(btn.dataset.content)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => {
        const formatted = text.replace(/\r/g, '').split('\n\n')
          .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
        content.innerHTML = formatted || '<p style="text-align:center; color:#888;">No content available.</p>';
      })
      .catch(() => {
        content.innerHTML = '<p style="text-align:center; color:#c0392b;">Failed to load book content.</p>';
      });

    hardcover.querySelectorAll('iframe').forEach(el => el.remove());
    if (video) {
      video.classList.remove('active');
      video.pause();
    }
    if (audio) {
      audio.classList.remove('active');
      audio.pause();
    }

    const audioUrl = btn.dataset.audio?.trim();
    const videoUrl = btn.dataset.video?.trim();

    if (audioUrl && audioUrl !== '') {
      audioSource.src = audioUrl;
      audio.load();
      audio.classList.add('active');
      audio.play().catch(() => console.log('Autoplay prevented'));
    }
    else if (videoUrl && videoUrl !== '') {
      const ytMatch = videoUrl.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        hardcover.appendChild(iframe);
      } else {
        videoSource.src = videoUrl;
        video.load();
        if (btn.dataset.caption?.trim()) {
          captions.src = btn.dataset.caption;
          video.addEventListener('loadedmetadata', () => {
            if (video.textTracks[0]) video.textTracks[0].mode = 'showing';
          });
        } else {
          captions.src = '';
        }
        video.classList.add('active');
        video.play().catch(() => {});
      }
    }

    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

//close book viewer
const exitBookBtn = document.querySelector('.exit-book');
if (exitBookBtn) {
  exitBookBtn.addEventListener('click', () => {
    const viewer = document.getElementById('bookViewer');
    const hardcover = document.querySelector('.hardcover.left');
    const video = document.getElementById('bookVideo');
    const audio = document.getElementById('bookAudio');

    hardcover.querySelectorAll('iframe').forEach(el => el.remove());

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.classList.remove('active');
    }
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.classList.remove('active');
    }

    viewer.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

//click outside to close
document.getElementById('bookViewer')?.addEventListener('click', (e) => {
  if (e.target.id === 'bookViewer') exitBookBtn?.click();
});

//search
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
if (searchInput && searchBtn) {
  const performSearch = () => {
    const query = searchInput.value.trim();
    if (!query) {
      return;
    }
    window.location.href = `genre.html?q=${encodeURIComponent(query)}`;
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());
};
