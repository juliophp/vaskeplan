const KEY = 'vask.theme';
export const getTheme = () => { try { return localStorage.getItem(KEY) || 'auto'; } catch { return 'auto'; } };
export function setTheme(mode) {
  const r = document.documentElement;
  if (mode === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', mode);
  try { localStorage.setItem(KEY, mode); } catch {}
}
