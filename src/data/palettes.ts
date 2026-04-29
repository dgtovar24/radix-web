export type ColorPalette = {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
  };
};

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'hospital-purple',
    name: 'Hospital Purple',
    description: ' purple 医疗系统 - 默认',
    colors: {
      primary: '#6b32e8',
      primaryLight: '#7c50f5',
      secondary: '#4a1aa8',
      background: '#ffffff',
      surface: '#f5f2ff',
      text: '#1a1a1a',
      textSecondary: '#666666',
      accent: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#e5e7eb',
    },
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: '  deep 蓝色 海洋',
    colors: {
      primary: '#0369a1',
      primaryLight: '#0ea5e9',
      secondary: '#023e8a',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      accent: '#38bdf8',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      border: '#bae6fd',
    },
  },
  {
    id: 'forest-sanctuary',
    name: 'Forest Sanctuary',
    description: ' verde 自然 康复',
    colors: {
      primary: '#15803d',
      primaryLight: '#22c55e',
      secondary: '#166534',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textSecondary: '#166534',
      accent: '#4ade80',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      border: '#bbf7d0',
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: ' warm 橙色 温暖',
    colors: {
      primary: '#c2410c',
      primaryLight: '#ea580c',
      secondary: '#9a3412',
      background: '#fff7ed',
      surface: '#ffedd5',
      text: '#431407',
      textSecondary: '#9a3412',
      accent: '#fb923c',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#dc2626',
      border: '#fed7aa',
    },
  },
  {
    id: 'midnight-command',
    name: 'Midnight Command',
    description: ' dark mode 专业 控制中心',
    colors: {
      primary: '#818cf8',
      primaryLight: '#a5b4fc',
      secondary: '#6366f1',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#38bdf8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      border: '#334155',
    },
  },
  {
    id: 'slate-elegance',
    name: 'Slate Elegance',
    description: ' gray 专业 简洁',
    colors: {
      primary: '#475569',
      primaryLight: '#64748b',
      secondary: '#334155',
      background: '#f8fafc',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#475569',
      accent: '#0ea5e9',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#e2e8f0',
    },
  },
  {
    id: 'rose-diagnostic',
    name: 'Rose Diagnostic',
    description: ' rosa 医疗 诊断',
    colors: {
      primary: '#be185d',
      primaryLight: '#ec4899',
      secondary: '#9d174d',
      background: '#fdf2f8',
      surface: '#fce7f3',
      text: '#831843',
      textSecondary: '#9d174d',
      accent: '#f472b6',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      border: '#f9a8d4',
    },
  },
  {
    id: 'teal-vital',
    name: 'Teal Vital',
    description: ' teal 活力 生命体征',
    colors: {
      primary: '#0d9488',
      primaryLight: '#14b8a6',
      secondary: '#0f766e',
      background: '#f0fdfa',
      surface: '#ccfbf1',
      text: '#134e4a',
      textSecondary: '#115e59',
      accent: '#2dd4bf',
      success: '#0d9488',
      warning: '#ca8a04',
      error: '#dc2626',
      border: '#99f6e4',
    },
  },
];

export function createCustomPalette(base?: Partial<ColorPalette['colors']>): ColorPalette {
  const custom: ColorPalette = {
    id: `custom-${Date.now()}`,
    name: 'Personalizado',
    description: 'Tu configuración única',
    isCustom: true,
    colors: {
      primary: base?.primary ?? '#6b32e8',
      primaryLight: base?.primaryLight ?? '#7c50f5',
      secondary: base?.secondary ?? '#4a1aa8',
      background: base?.background ?? '#ffffff',
      surface: base?.surface ?? '#f5f2ff',
      text: base?.text ?? '#1a1a1a',
      textSecondary: base?.textSecondary ?? '#666666',
      accent: base?.accent ?? '#3b82f6',
      success: base?.success ?? '#22c55e',
      warning: base?.warning ?? '#f59e0b',
      error: base?.error ?? '#ef4444',
      border: base?.border ?? '#e5e7eb',
    },
  };
  return custom;
}

export const DEFAULT_PALETTE = PRESET_PALETTES[0];

export function getPaletteById(id: string): ColorPalette | undefined {
  return PRESET_PALETTES.find(p => p.id === id);
}

export function loadSavedPalette(): ColorPalette {
  if (typeof window === 'undefined') return DEFAULT_PALETTE;

  try {
    const saved = localStorage.getItem('radix-palette');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.colors && parsed.id) {
        return parsed as ColorPalette;
      }
    }
  } catch (e) {
    console.warn('[RADIX] Failed to load saved palette, using default:', e);
    try { localStorage.removeItem('radix-palette'); } catch {}
  }
  return DEFAULT_PALETTE;
}

export function savePalette(palette: ColorPalette): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('radix-palette', JSON.stringify(palette));
  } catch (e) {
    console.warn('[RADIX] Failed to save palette:', e);
  }
}

export const COLOR_DEFINITIONS: { key: keyof ColorPalette['colors']; label: string; description: string }[] = [
  { key: 'primary', label: 'Primario', description: 'Color principal de la interfaz' },
  { key: 'primaryLight', label: 'Primario Claro', description: 'Variante clara del color primario' },
  { key: 'secondary', label: 'Secundario', description: 'Color de contraste profundo' },
  { key: 'background', label: 'Fondo', description: 'Fondo principal de la app' },
  { key: 'surface', label: 'Superficie', description: 'Cards, sidebar, elementos elevados' },
  { key: 'text', label: 'Texto Principal', description: 'Color del texto principal' },
  { key: 'textSecondary', label: 'Texto Secundario', description: 'Hints y texto auxiliar' },
  { key: 'accent', label: 'Acento', description: 'Highlights y elementos especiales' },
  { key: 'success', label: 'Éxito', description: 'Indicadores positivos' },
  { key: 'warning', label: 'Advertencia', description: 'Alertas y precaución' },
  { key: 'error', label: 'Error', description: 'Estados críticos' },
  { key: 'border', label: 'Borde', description: 'Líneas y divisorias' },
];