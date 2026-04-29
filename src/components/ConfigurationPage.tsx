'use client';

import { useState } from 'react';
import { Check, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { COLOR_DEFINITIONS } from '../data/palettes';

export default function ConfigurationPage() {
  const { palette, setPalette, updateColor, resetPalette, presets, isCustom } = useTheme();
  const [activeTab, setActiveTab] = useState<'presets' | 'customize' | 'export'>('presets');
  const [customColors, setCustomColors] = useState(palette.colors);

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setPalette(preset);
    setCustomColors(preset.colors);
  };

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
    updateColor(key, value);
  };

  const handleSaveCustom = () => {
    Object.keys(customColors).forEach(key => {
      updateColor(key as keyof typeof customColors, customColors[key as keyof typeof customColors]);
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', margin: 0 }}>
            Configuración
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0', fontFamily: "'Inter', sans-serif" }}>
            Personaliza la apariencia de tu dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isCustom && (
            <button
              type="button"
              onClick={resetPalette}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <RotateCcw size={13} />
              Restablecer
            </button>
          )}
          <div style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: '#3b82f6',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
          }}>
            {palette.name}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
        {[
          { id: 'presets', label: 'TEMAS' },
          { id: 'customize', label: 'PERSONALIZAR' },
          { id: 'export', label: 'EXPORTAR' },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '12px 0',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: active ? '#111827' : '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab.label}
              {active && (
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  borderRadius: '99px',
                  background: '#3b82f6',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Presets Grid */}
      {activeTab === 'presets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {presets.map((p) => {
            const isSelected = palette.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: '#ffffff',
                  border: `2px solid ${isSelected ? p.colors.primary : '#e5e7eb'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: p.colors.primary,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    <Check size={11} color="white" strokeWidth={3} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Palette size={14} color={p.colors.primary} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: "'Inter', sans-serif" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'Inter', sans-serif", marginTop: 1 }}>{p.description}</div>
                  </div>
                </div>

                {/* Color strip - single blue bar */}
                <div style={{ height: 6, borderRadius: 99, background: p.colors.primary }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Customize Colors */}
      {activeTab === 'customize' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}>
              <Palette size={17} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif" }}>
                Editando: <span style={{ color: '#3b82f6' }}>{palette.name}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Inter', sans-serif", marginTop: 1 }}>
                Haz clic en cualquier color para personalizarlo.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {COLOR_DEFINITIONS.map(({ key, label, description }) => (
              <div key={key} style={{
                padding: 12,
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}>
                <label
                  htmlFor={`color-${key}`}
                  style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 8 }}
                >
                  {label}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={customColors[key as keyof typeof customColors]}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", color: '#6b7280', fontWeight: 500 }}>
                    {customColors[key as keyof typeof customColors]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setCustomColors(palette.colors)}
              style={{
                padding: '9px 18px',
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveCustom}
              style={{
                padding: '9px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Export Palette */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            padding: 18,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px', fontFamily: "'Inter', sans-serif" }}>Exportar Configuración</h3>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px', fontFamily: "'Inter', sans-serif" }}>
              Copia el código para guardar o compartir tu tema.
            </p>
            <pre style={{
              padding: 12,
              borderRadius: 10,
              fontSize: 10,
              fontFamily: "'Courier New', monospace",
              overflow: 'auto',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#374151',
              maxHeight: 160,
            }}>
              {JSON.stringify(palette, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(palette, null, 2))}
              style={{
                marginTop: 12,
                padding: '9px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Copiar al Portapapeles
            </button>
          </div>

          <div style={{
            padding: 18,
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px', fontFamily: "'Inter', sans-serif" }}>Importar Configuración</h3>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 10px', fontFamily: "'Inter', sans-serif" }}>
              Pega un JSON de configuración para aplicar un tema.
            </p>
            <textarea
              id="import-config"
              style={{
                width: '100%',
                height: 80,
                padding: 10,
                borderRadius: 10,
                fontSize: 10,
                fontFamily: "'Courier New', monospace",
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#374151',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Pega aquí tu configuración JSON..."
            />
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('import-config') as HTMLTextAreaElement;
                try {
                  const imported = JSON.parse(textarea.value);
                  if (imported.colors) {
                    setPalette({ ...imported, isCustom: true });
                    setCustomColors(imported.colors);
                  }
                } catch (e) {
                  alert('Configuración inválida');
                }
              }}
              style={{
                marginTop: 10,
                padding: '9px 18px',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Aplicar Configuración
            </button>
          </div>
        </div>
      )}
    </div>
  );
}