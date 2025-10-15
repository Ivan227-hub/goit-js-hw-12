// src/render-functions.js
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// селекторы DOM (экспортируем не все — только функции, но используем локально)
const galleryEl = document.getElementById('gallery');
const loaderEl = document.getElementById('loader');
const loadMoreBtn = document.getElementById('load-more-btn');

// создаём экземпляр SimpleLightbox для ссылок внутри .gallery
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

/**
 * Создаёт и добавляет в DOM разметку галереи.
 * Важно: добавляет ВСЮ новую разметку одной операцией.
 * @param {Array} images - массив объектов из Pixabay (hits)
 */
export function createGallery(images) {
  if (!Array.isArray(images) || images.length === 0) return;

  const markup = images
    .map(
      (img) => `
    <div class="photo-card">
      <a class="photo-link" href="${img.largeImageURL}">
        <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
      </a>
      <div class="info">
        <div class="stats">
          <span title="Likes">❤ ${img.likes}</span>
          <span title="Views">👁 ${img.views}</span>
          <span title="Comments">💬 ${img.comments}</span>
          <span title="Downloads">⬇ ${img.downloads}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join('');

  // одна операція вставки
  galleryEl.insertAdjacentHTML('beforeend', markup);

  // обновить SimpleLightbox (он работает с селектором .gallery a)
  lightbox.refresh();
}

/** Очищает галерею полностью */
export function clearGallery() {
  galleryEl.innerHTML = '';
  // refresh чтобы SimpleLightbox "забыл" старые ссылки
  lightbox.refresh();
}

/** Показать лоадер (добавляет класс) */
export function showLoader() {
  loaderEl.classList.remove('is-hidden');
}

/** Скрыть лоадер */
export function hideLoader() {
  loaderEl.classList.add('is-hidden');
}

/** Показать кнопку Load more */
export function showLoadMoreButton() {
  loadMoreBtn.classList.remove('is-hidden');
}

/** Скрыть кнопку Load more */
export function hideLoadMoreButton() {
  loadMoreBtn.classList.add('is-hidden');
}

// Экспортируем элементы и lightbox (если нужно где-то обратиться)
export { galleryEl, loadMoreBtn, lightbox };
