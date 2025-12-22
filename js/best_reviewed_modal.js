// Injects the universal "Best Reviewed" modal into the page
(function injectBestReviewedModal() {
 if (document.getElementById('modal')) return; 
const modalHTML = `
    <div id="modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="modal-card" role="document">
      <div class="modal-left">
        <div class="cover"><img id="modalCover" src="" alt=""></div>
      </div>
      <div class="modal-right">
        <div class="modal-header">
          <div>
            <h2 id="modalTitle">Title</h2>
            <p id="modalAuthor" class="muted">Author</p>
          </div>
          <button id="closeModal" class="close-btn" aria-label="Close viewer">✕</button>
        </div>
        <div id="modalDesc" class="modal-desc muted">Description</div>
        <div class="modal-actions">
          <a id="previewLink" class="preview-btn" href="#" target="_blank" rel="noopener noreferrer">Preview on Google Books</a>
          <span id="noPreview" class="muted"></span>
        </div>
      </div>
    </div>
  </div>`;

  const temp = document.createElement('div');
  temp.innerHTML = modalHTML.trim();
  const modalEl = temp.firstElementChild;
  document.body.appendChild(modalEl);
})();
