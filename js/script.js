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
    // Perform client-side search against local JSON 'API' and show modal results
    fetch('data/books.json')
      .then(r => {
        if (!r.ok) throw new Error('books.json not found');
        return r.json();
      })
      .then(list => {
        const q = query.toLowerCase();
        const matches = list.filter(b => (b.title + ' ' + b.author + ' ' + (b.tags||[]).join(' ')).toLowerCase().includes(q));
        showSearchModal(query, matches);
      })
      .catch(err => {
        showFeedback('Search failed: ' + err.message, 'error');
      });
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
    const video = document.getElementById('bookVideo');
    const videoSource = document.getElementById('bookVideoSource');
    const captions = document.getElementById('bookCaptions');
    const content = document.getElementById('fullBookContent');
    const title = document.getElementById('overlayTitle');
    const author = document.getElementById('overlayAuthor');

    // If this page doesn't have the full-screen viewer, do nothing
    if (!viewer || !content || !title || !author) return;

    // Remove any existing YouTube iframe if present
    const existingIframe = document.querySelector('#bookViewer iframe');
    if (existingIframe) existingIframe.remove();

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

    if (btn.dataset.video) {
      const videoUrl = btn.dataset.video.trim();
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const youtubeMatch = videoUrl.match(youtubeRegex);

      if (youtubeMatch && youtubeMatch[1]) {
        // YouTube video: Hide native video and embed iframe
        if (video) video.style.display = 'none';

        const videoId = youtubeMatch[1];
        const iframe = document.createElement('iframe');
        iframe.id = 'youtubeEmbed'; // For easy reference if needed
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`; // Autoplay (may require mute or user gesture); rel=0 hides related videos
        iframe.width = '100%';
        iframe.height = '400'; // Adjust based on your layout (or use CSS for responsiveness)
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        // Insert iframe where the video would be (assuming #bookVideo is in a container; adjust selector if needed)
        const videoContainer = video ? video.parentNode : viewer;
        videoContainer.insertBefore(iframe, video || null);
      } else {
        // Non-YouTube (direct video file): Use native video
        if (video) {
          video.style.display = 'block';
          try { video.pause(); } catch (e) {}
          videoSource.src = videoUrl;
          if (captions && btn.dataset.caption) {
            captions.src = btn.dataset.caption || '';
            try { captions.setAttribute('default', ''); } catch (e) {}

            const tryShowTrack = () => {
              try {
                const tracks = video.textTracks;
                if (tracks && tracks.length > 0) tracks[0].mode = 'showing';
              } catch (e) {}
            };

            // Try to enable after metadata loads and after a short delay
            video.addEventListener('loadedmetadata', tryShowTrack, { once: true });
            setTimeout(tryShowTrack, 250);
          } else if (captions) {
            captions.removeAttribute('default');
            captions.src = '';
          }
          video.load();
          video.play().catch(() => {});
        }
      }
    } else {
      // No video: Hide native video
      if (video) video.style.display = 'none';
    }

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
    // If a video is playing, pause and unload its source for cleanup
    const video = document.getElementById('bookVideo');
    const videoSource = document.getElementById('bookVideoSource');
    const captions = document.getElementById('bookCaptions');
    if (video) {
      try { video.pause(); } catch (e) {}
      if (videoSource) videoSource.src = '';
      if (captions) captions.src = '';
      video.load();
      video.style.display = 'none';
    }
    // Remove YouTube iframe if present
    const iframe = document.querySelector('#bookViewer iframe');
    if (iframe) iframe.remove();
    viewer.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

  // --- Search modal helpers (render results inline; no separate results page) ---
  function createElem(tag, props = {}, children = []){
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>{
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else el.setAttribute(k,v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }

  function openBookByTitle(title){
    const normalized = title.toLowerCase();
    const buttons = Array.from(document.querySelectorAll('.read-book-btn'));
    let found = null;
    for (const b of buttons) { if ((b.dataset.title||'').toLowerCase() === normalized) { found = b; break; } }
    if (!found) {
      for (const b of buttons) { if ((b.dataset.title||'').toLowerCase().includes(normalized) || (b.dataset.author||'').toLowerCase().includes(normalized)) { found = b; break; } }
    }
    if (found) { try { found.click(); return; } catch (e) { console.warn(e); } }
    // not on this page or not found — navigate to index and ask it to open
    window.location.href = `index.html?open=${encodeURIComponent(title)}`;
  }

  function showSearchModal(query, matches){
    // remove existing
    const existing = document.getElementById('searchModalOverlay');
    if (existing) existing.remove();

    const overlay = createElem('div',{id:'searchModalOverlay', class:'search-modal', style:'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:flex-start;justify-content:center;padding:48px;z-index:100000;'});
    const panel = createElem('div',{class:'search-panel', style:'width:min(1000px,96%);max-height:80vh;overflow:auto;background:#fff;border-radius:10px;padding:18px;'});
    const header = createElem('div',{style:'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;'});
    const title = createElem('h2',{},[`Results for "${query}"`]);
    const close = createElem('button',{style:'border:0;background:transparent;font-size:20px;cursor:pointer;'},['✕']);
    close.addEventListener('click', ()=> overlay.remove());
    header.appendChild(title); header.appendChild(close);
    panel.appendChild(header);

    if (!matches || matches.length === 0){
      const p = createElem('p',{style:'color:#800;'},['No results found.']);
      panel.appendChild(p);
    } else {
      const grid = createElem('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;'});
      matches.forEach(b => {
        const card = createElem('div',{style:'background:#fff;border:1px solid #eee;padding:10px;border-radius:8px;'});
        const img = createElem('img',{src:b.cover || 'images/recommend-1.png', style:'width:100%;height:140px;object-fit:cover;border-radius:6px;'});
        const t = createElem('h3',{},[b.title]);
        const a = createElem('p',{style:'color:#666;margin:6px 0 10px;'},[b.author]);
        const btnRow = createElem('div',{style:'display:flex;gap:8px;'});
        const openBtn = createElem('button',{style:'flex:1;padding:8px;border-radius:6px;border:0;background:#8d5356;color:#fff;cursor:pointer;'},['Open']);
        openBtn.addEventListener('click', ()=> { overlay.remove(); openBookByTitle(b.title); });
        const detailsBtn = createElem('button',{style:'flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;'},['Details']);
        detailsBtn.addEventListener('click', ()=> { alert(b.title + '\nby ' + b.author); });
        btnRow.appendChild(openBtn); btnRow.appendChild(detailsBtn);
        card.appendChild(img); card.appendChild(t); card.appendChild(a); card.appendChild(btnRow);
        grid.appendChild(card);
      });
      panel.appendChild(grid);
    }

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }