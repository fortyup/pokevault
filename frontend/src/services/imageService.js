/**
 * Service pour gérer les URLs des images TCGdex
 */

/**
 * Génère l'URL complète d'une image de carte
 * @param {string} imageBaseUrl - URL de base de l'image (sans extension)
 * @param {string} quality - Qualité de l'image ('high' ou 'low')
 * @param {string} format - Format de l'image ('webp' ou 'png')
 * @returns {string} URL complète de l'image
 */
export function getCardImageUrl(imageBaseUrl, quality = 'high', format = 'webp') {
  if (!imageBaseUrl) return '';
  
  // Si l'URL a déjà une extension, la retourner telle quelle
  if (imageBaseUrl.match(/\.(webp|png|jpg)$/i)) {
    return imageBaseUrl;
  }
  
  // Sinon, ajouter la qualité et le format
  return `${imageBaseUrl}/${quality}.${format}`;
}

/**
 * Génère l'URL complète d'un logo de set
 * @param {string} logoBaseUrl - URL de base du logo (sans extension)
 * @param {string} format - Format de l'image ('webp' ou 'png')
 * @returns {string} URL complète du logo
 */
export function getLogoUrl(logoBaseUrl, format = 'webp') {
  if (!logoBaseUrl) return '';
  
  // Si l'URL a déjà une extension, la retourner telle quelle
  if (logoBaseUrl.match(/\.(webp|png|svg)$/i)) {
    return logoBaseUrl;
  }
  
  // Sinon, ajouter le format
  return `${logoBaseUrl}.${format}`;
}

/**
 * Génère l'URL complète d'un symbole de set
 * @param {string} symbolBaseUrl - URL de base du symbole (sans extension)
 * @param {string} format - Format de l'image ('webp' ou 'png')
 * @returns {string} URL complète du symbole
 */
export function getSymbolUrl(symbolBaseUrl, format = 'webp') {
  if (!symbolBaseUrl) return '';
  
  // Si l'URL a déjà une extension, la retourner telle quelle
  if (symbolBaseUrl.match(/\.(webp|png|svg)$/i)) {
    return symbolBaseUrl;
  }
  
  // Sinon, ajouter le format
  return `${symbolBaseUrl}.${format}`;
}

/**
 * Génère plusieurs URLs pour utiliser srcset (responsive images)
 * @param {string} imageBaseUrl - URL de base de l'image
 * @returns {object} Objet avec les URLs high et low
 */
export function getResponsiveImageUrls(imageBaseUrl) {
  return {
    high: getCardImageUrl(imageBaseUrl, 'high', 'webp'),
    low: getCardImageUrl(imageBaseUrl, 'low', 'webp'),
    highPng: getCardImageUrl(imageBaseUrl, 'high', 'png'),
    lowPng: getCardImageUrl(imageBaseUrl, 'low', 'png')
  };
}

export default {
  getCardImageUrl,
  getLogoUrl,
  getSymbolUrl,
  getResponsiveImageUrls
};
