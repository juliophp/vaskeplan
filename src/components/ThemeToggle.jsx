import { useEffect, useState } from 'react';
import { getTheme, setTheme } from '../theme.js';

export default function ThemeToggle() {
  const [mode, setMode] = useState('auto');
  useEffect(() => setMode(getTheme()), []);
  const pick = (m) => { setMode(m); setTheme(m); };
  return (
    <div className="seg" role="group" aria-label="Fargetema">
      {[['auto', 'Auto'], ['light', 'Lys'], ['dark', 'Mørk']].map(([v, l]) => (
        <button key={v} className={mode === v ? 'on' : ''} onClick={() => pick(v)}>{l}</button>
      ))}
    </div>
  );
}
