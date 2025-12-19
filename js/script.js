// Navbar scroll effect
const navbarElement = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbarElement.classList.toggle('scrolled', window.scrollY > 50);
});

// All mobile menu logic (consolidated)
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // Fallback for browsers that don't support :has() in JS selectors
  const menuItemsWithSubs = Array.from(document.querySelectorAll('nav ul li'))
    .filter(li => li.querySelector('ul'));

  // If key elements are missing, don't bind anything
  if (!navbar || !menuToggle || !navMenu) return;

  // Function to add/remove back button in submenus and toggle hamburger visibility
  const updateBackButtons = () => {
    // Remove all existing back buttons
    document.querySelectorAll('.submenu-back-btn').forEach(btn => btn.remove());
    
    // Check if any submenu is active
    const anySubmenuActive = menuItemsWithSubs.some(item => item.classList.contains('active'));
    
    // Add/remove class to navbar to control hamburger visibility
    if (window.innerWidth <= 768) {
      if (anySubmenuActive) {
        navbar.classList.add('submenu-open');
      } else {
        navbar.classList.remove('submenu-open');
      }
      
      // Add back button to active submenus
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
              updateBackButtons(); // Update after closing
            });
            submenu.insertBefore(backBtn, submenu.firstChild);
          }
        }
      });
    } else {
      navbar.classList.remove('submenu-open');
    }
  };

  // Function to close all submenus
  const closeSubmenus = () => {
    menuItemsWithSubs.forEach(item => item.classList.remove('active'));
    updateBackButtons();
  };

  // Hamburger toggle for main menu
  menuToggle.addEventListener('click', () => {
    const menuIsOpen = navbar.classList.contains('open');
    const anySubmenuOpen = menuItemsWithSubs.some(li => li.classList.contains('active'));

    // If menu is open and a dropdown is open, first close just the dropdowns
    if (menuIsOpen && anySubmenuOpen) {
      closeSubmenus();
      return; // keep drawer open and keep X state
    }

    // Otherwise, toggle the whole drawer
    const isOpening = !menuIsOpen;
    menuToggle.classList.toggle('active');
    navbar.classList.toggle('open');
    if (!isOpening) {
      closeSubmenus();
    }
  });

 document.querySelectorAll('#navMenu a').forEach(link => {
  link.addEventListener('click', (e) => {
    const parentLi = link.closest('li');
    const isTopLevelWithSubmenu =
      parentLi &&
      parentLi.querySelector('ul') &&
      link === parentLi.querySelector(':scope > a');
    // Clicking the TOP-LEVEL item that has a submenu (Genre, Mood)
    if (isTopLevelWithSubmenu) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        menuItemsWithSubs.forEach(item => {
          if (item !== parentLi) item.classList.remove('active');
        });
        parentLi.classList.toggle('active');
        setTimeout(updateBackButtons, 50);
        return;
      }

      // Desktop: let navigation occur but ensure menus are closed
      menuToggle.classList.remove('active');
      navbar.classList.remove('open');
      closeSubmenus();
      return;
    }

    // Clicking an ACTUAL submenu option → CLOSE EVERYTHING
    menuToggle.classList.remove('active');
    navbar.classList.remove('open');
    closeSubmenus();

    // On desktop, also force-hide the dropdown even while cursor is still over it
    const parentTopLi = link.closest('ul')?.closest('li');
    if (parentTopLi) {
      parentTopLi.classList.add('closing');
      setTimeout(() => parentTopLi.classList.remove('closing'), 250);
    }

    // On desktop, remove focus so :focus-within dropdown hides immediately
    if (window.innerWidth > 768) {
      link.blur();
      const topLevelLink = parentTopLi?.querySelector(':scope > a');
      topLevelLink?.blur();
    }
  });
});
  // Initial check for back buttons
  updateBackButtons();
  
  // Update on window resize
  window.addEventListener('resize', updateBackButtons);
  
  // Use MutationObserver to watch for class changes on menu items
  const observer = new MutationObserver(() => {
    updateBackButtons();
  });
  
  menuItemsWithSubs.forEach(item => {
    observer.observe(item, { attributes: true, attributeFilter: ['class'] });
  });

  // Close menu if clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navbar.classList.contains('open')) {
      navbar.classList.remove('open');
      menuToggle.classList.remove('active');
      closeSubmenus();
    }
  });
});

// Search functionality (only if this page has the full search bar)
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      showFeedback('Please enter a search term.', 'error');
      searchInput.focus();
      return;
    }
    if (query.length < 2) {
      showFeedback('Too short.', 'error');
      return;
    }

    // Redirect to search results
    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
  }
}

function showFeedback(message, type = 'info') {
  const existing = document.querySelector('.search-feedback');
  if (existing) existing.remove();

  const feedback = document.createElement('div');
  feedback.className = `search-feedback ${type}`;
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.9rem;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: fadeInOut 3s forwards;
  `;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    15%, 85% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// Smooth scroll only on pages that have the hero button
const scrollLink = document.getElementById("scrollLink");
if (scrollLink) {
  scrollLink.addEventListener("click", function(e) {
    e.preventDefault(); // stop default jump

    const target = document.getElementById("trending-books");
    if (!target) return;
    const offset = 50; // pixels above

    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: y, behavior: "smooth" });
  });
}

document.querySelectorAll('.read-book-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const viewer = document.getElementById('bookViewer');
    const cover = document.getElementById('bookCoverFull');
    const content = document.getElementById('fullBookContent');
    const title = document.getElementById('overlayTitle');
    const author = document.getElementById('overlayAuthor');

    // If this page doesn't have the full-screen viewer, do nothing
    if (!viewer || !cover || !content || !title || !author) return;

    // Set data
    cover.src = btn.dataset.cover;
    title.textContent = btn.dataset.title;
    author.textContent = 'by ' + btn.dataset.author;
    content.innerHTML = '<p style="text-align:center; padding:100px 0; opacity:0.5;">Loading your book...</p>';

    // Load full text
    fetch(btn.dataset.content)
      .then(r => r.text())
      .then(text => {
        content.innerHTML = text
          .replace(/\r/g, '')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/^(.*)$/gm, '<p>$1</p>');
      })
      .catch(() => {
        content.innerHTML = '<p style="color:#800; text-align:center;">Book content not available yet.</p>';
      });

    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Close book viewer, only if it exists on this page
const exitBookBtn = document.querySelector('.exit-book');
if (exitBookBtn) {
  exitBookBtn.addEventListener('click', () => {
    const viewer = document.getElementById('bookViewer');
    if (!viewer) return;
    viewer.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}