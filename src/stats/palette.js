/**
 * Diagrammaning "ramkasi" — o'q, to'r, fon, maslahat oynasi ranglari.
 * Recharts CSS o'zgaruvchilarini o'qiy olmaydi, shuning uchun qiymatlar
 * shu yerda — index.css dagi tokenlar bilan mos.
 *
 * Ma'lumot ranglari (ustunlar, chiziqlar) bu yerda EMAS — ular mahsulotga
 * bog'langan va stats/products.js dan olinadi.
 */
export function chartPalette(isDark) {
  return {
    offer: isDark ? '#3b9f4c' : '#2d7a3a',
    request: isDark ? '#d4956a' : '#c08050',
    grid: isDark ? '#333345' : '#e0e0e0',
    axis: isDark ? '#92929f' : '#6b6b6b',
    label: isDark ? '#e8e8e8' : '#1a1a2e',
    surface: isDark ? '#1e1e2e' : '#ffffff',
    border: isDark ? '#333345' : '#e0e0e0',
    cursor: isDark ? 'rgba(232,232,232,0.06)' : 'rgba(26,26,46,0.05)',
    shadow: isDark ? '0 8px 24px rgba(0,0,0,0.62)' : '0 8px 24px rgba(26,26,46,0.12)',
  }
}
