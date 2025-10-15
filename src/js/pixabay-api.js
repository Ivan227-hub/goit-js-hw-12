// src/pixabay-api.js
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '52755140-7ddce3cbb2c82e84a1ea5fb45'; 
const PER_PAGE = 15; 

/**
 * Виконує запит до Pixabay і повертає response.data
 * @param {string} query  
 * @param {number} page 
 * @returns {Promise<Object>} 
 */
export async function getImagesByQuery(query, page = 1) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
    page,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    // возвращаем data (содержит total, totalHits, hits)
    return response.data;
  } catch (error) {
    // пробрасываем ошибку дальше — main.js обработает нотифікації
    throw error;
  }
}

export { PER_PAGE };
