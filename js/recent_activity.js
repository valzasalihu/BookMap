const RECENT_KEY = 'bookmap:recentlyViewed';
const MAX_RECENT = 5;

function saveRecentBook(book) {
    if (!book || !book.title) return;
    try {
        const recent = getRecentBooks();
        const item = {
            id: book.id || null,
            title: book.title,
            authors: book.authors || '',
            cover: book.cover || '',
            desc: book.desc || '',
            previewLink: book.previewLink || '',
            timestamp: Date.now(),
    };
    const filtered = recent.filter(r => r.title !== item.title || r.authors !== item.authors);
    filtered.unshift(item);
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
    renderRecentWidget();
    } catch (err) {
    console.warn('Could not save recent book', err);
        }
}

function getRecentBooks() {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
        }
}

function renderRecentWidget() {
    const container = document.getElementById('recentBooksWidget');
    if (!container) return;
    const recent = getRecentBooks();
    if (!recent.length) {
    container.innerHTML = '<tr><td colspan="4" class="muted">No recent activity yet.</td></tr>';
    return;
}
container.innerHTML = recent.map(b => `
    <tr class="recent-row" data-book='${JSON.stringify(b).replace(/'/g, '&apos;')}'>
        <td><img src="${b.cover}" alt="${b.title}" class="recent-cover" loading="lazy"></td>
        <td class="recent-title">${b.title}</td>
        <td class="recent-author">${b.authors}</td>
        <td><button class="view-btn" aria-label="View ${b.title}">View</button></td>
    </tr>
    `).join('');

    container.querySelectorAll('.view-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
        const row = btn.closest('.recent-row');
        const book = JSON.parse(row.dataset.book);
        if (typeof openModal === 'function') openModal(book);
        });
    });
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', renderRecentWidget);
} else {
renderRecentWidget();
}
