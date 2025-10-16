// src/main.js
import './css/styles.css';
import { getImagesByQuery, PER_PAGE } from './src/js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
  galleryEl,
  loadMoreBtn,
} from './src/js/render-functions';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

/* Глобальные состояния (по ТЗ: хранить введенное пользователем глобально) */
let currentQuery = '';
let currentPage = 1;
let totalHits = 0;
let isLoading = false;

/* DOM */
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');

/* Инициализация: скрываем кнопку */
hideLoadMoreButton();

/* Обработчик отправки формы */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    iziToast.warning({ title: 'Warning', message: 'Введите ключевое слово.' });
    return;
  }

  // Если новый поиск — сбрасываем состояние
  if (query !== currentQuery) {
    currentQuery = query;
    currentPage = 1;
    totalHits = 0;
    clearGallery();
    hideLoadMoreButton();
  }

  await fetchAndRenderImages({ isNewSearch: query !== currentQuery ? true : false });
});

/* Обработчик кнопки Load more */
loadMoreBtn.addEventListener('click', async () => {
  if (!currentQuery) return;
  await fetchAndRenderImages();
});

/**
 * Выполняет запрос и отображает результаты.
 * @param {Object} options
 * @param {boolean} options.isNewSearch - флаг нового поиска (если true, page сброшен в 1)
 */
async function fetchAndRenderImages({ isNewSearch = false } = {}) {
  if (isLoading) return;
  isLoading = true;
  showLoader();
  hideLoadMoreButton();

  try {
    // при обычном запросе currentPage уже актуален; если новый поиск — убедимся, что 1
    if (isNewSearch) currentPage = 1;

    const data = await getImagesByQuery(currentQuery, currentPage);
    // data: { total, totalHits, hits: [...] }
    totalHits = data.totalHits ?? 0;
    const hits = Array.isArray(data.hits) ? data.hits : [];

    if (hits.length === 0) {
      // если ничего не найдено — показываем сообщение и скрываем кнопку
      iziToast.info({
        title: 'Info',
        message: 'No images found. Try another query.',
      });
      hideLoadMoreButton();
      return;
    }

    // Добавляем разметку (одной операцией в createGallery)
    createGallery(hits);

    // Если это первый набор результатов — уведомляем об общем количестве
    if (currentPage === 1) {
      iziToast.success({
        title: 'Success',
        message: `Hooray! We found ${totalHits} images.`,
      });
    }

    // Решаем показывать ли Load more:
    const shownSoFar = currentPage * PER_PAGE;
    if (shownSoFar >= totalHits) {
      // конец коллекции (может быть и на первой странице)
      hideLoadMoreButton();
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }

    // После успешного добавления — увеличиваем page для следующего запроса
    currentPage += 1;

    // Если мы загружаем дополнительную страницу (не первый запрос), делаем плавный скролл
    // Прокрутка по высоте одной карточки ×2
    if (currentPage > 2) {
      // ставим setTimeout, чтобы DOM успел вставить карточки и вычисления были корректны
      await new Promise((res) => setTimeout(res, 200));
      smoothScrollByCardHeight();
    }
  } catch (error) {
    // обработка ошибок сети / API
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: error?.message || 'An error occurred while fetching images.',
    });
  } finally {
    hideLoader();
    isLoading = false;
  }
}

/** Функция плавной прокрутки на две высоты карточки */
function smoothScrollByCardHeight() {
  const firstCard = galleryEl.querySelector('.photo-card');
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();
  // плавно прокручиваем на 2 высоты карточки
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}

/* При загрузке страницы — фокус в input */
input.focus();
