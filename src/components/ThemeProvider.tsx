import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  PRESET_PALETTES,
  DEFAULT_PALETTE,
  loadSavedPalette,
  savePalette,
  type ColorPalette,
} from '../data/palettes';

interface ThemeContextType {
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  updateColor: (key: keyof ColorPalette['colors'], value: string) => void;
  resetPalette: () => void;
  presets: ColorPalette[];
  isCustom: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<ColorPalette>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = loadSavedPalette();
        return saved;
      } catch (e) {
        return DEFAULT_PALETTE;
      }
    }
    return DEFAULT_PALETTE;
  });
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const saved = loadSavedPalette();
    setPaletteState(saved);
    setIsCustom(saved.isCustom ?? false);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const c = palette.colors;
    const root = document.documentElement;
    root.style.setProperty('--p', c.primary);
    root.style.setProperty('--p-l', c.primaryLight);
    root.style.setProperty('--s', c.secondary);
    root.style.setProperty('--b', c.background);
    root.style.setProperty('--sf', c.surface);
    root.style.setProperty('--t', c.text);
    root.style.setProperty('--t-s', c.textSecondary);
    root.style.setProperty('--br', c.border);
    const isDark = c.background === '#0f172a' || c.background === '#000000';
    document.documentElement.className = isDark ? 'dark' : 'light';
    try {
      savePalette(palette);
    } catch (e) {
      console.warn('[RADIX] savePalette failed:', e);
    }
  }, [palette]);

  const setPalette = useCallback((newPalette: ColorPalette) => {
    setIsCustom(newPalette.isCustom ?? false);
    setPaletteState(newPalette);
  }, []);

  const updateColor = useCallback((key: keyof ColorPalette['colors'], value: string) => {
    setPaletteState(prev => ({
      ...prev,
      isCustom: true,
      name: 'Personalizado',
      colors: { ...prev.colors, [key]: value },
    }));
    setIsCustom(true);
  }, []);

  const resetPalette = useCallback(() => {
    setIsCustom(false);
    setPaletteState(DEFAULT_PALETTE);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        palette,
        setPalette,
        updateColor,
        resetPalette,
        presets: PRESET_PALETTES,
        isCustom,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      palette: DEFAULT_PALETTE,
      setPalette: () => {},
      updateColor: () => {},
      resetPalette: () => {},
      presets: PRESET_PALETTES,
      isCustom: false,
    };
  }
  return context;
}

export function applyPalette(p: ColorPalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = p.colors;
  root.style.setProperty('--p', c.primary);
  root.style.setProperty('--p-l', c.primaryLight);
  root.style.setProperty('--s', c.secondary);
  root.style.setProperty('--b', c.background);
  root.style.setProperty('--sf', c.surface);
  root.style.setProperty('--t', c.text);
  root.style.setProperty('--t-s', c.textSecondary);
  root.style.setProperty('--br', c.border);
  const isDark = c.background === '#0f172a' || c.background === '#000000';
  document.documentElement.className = isDark ? 'dark' : 'light';
}

export type { ColorPalette };