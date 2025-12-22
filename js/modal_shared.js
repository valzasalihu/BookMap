// Shared modal helpers to reduce duplication across pages
function createModalHandlers({
    modal,
    modalCover,
    modalTitle,
    modalAuthor,
    modalDesc,
    previewLink,
    noPreview,
    closeModalBtn
}) {
    const sanitizeDesc = (text) => text ? text.replace(/<[^>]*>/g, '') : 'No description available.';

    const openModal = (book) => {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        if (modalCover) modalCover.src = book.cover;
        if (modalTitle) modalTitle.textContent = book.title;
        if (modalAuthor) modalAuthor.textContent = book.authors;
        if (modalDesc) modalDesc.textContent = sanitizeDesc(book.desc);

        if (book.previewLink) {
            if (previewLink) {
                previewLink.href = book.previewLink;
                previewLink.style.display = 'inline-block';
            }
            if (noPreview) noPreview.textContent = '';
        } else {
            if (previewLink) previewLink.style.display = 'none';
            if (noPreview) noPreview.textContent = 'Preview not available';
        }

        document.body.style.overflow = 'hidden';

        if (typeof saveRecentBook === 'function') {
            saveRecentBook(book);
        }

        if (closeModalBtn) closeModalBtn.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    return { openModal, closeModal };
}
