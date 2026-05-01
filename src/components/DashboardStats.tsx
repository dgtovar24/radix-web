'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Eye, EyeOff, Save } from 'lucide-react';
import { 
  KpiRowWidget, 
  RadiationChartWidget, 
  IsotopeDistributionWidget, 
  AlertsBarChartWidget, 
  PatientActivityRadarWidget 
} from './widgets/DashboardWidgets';

interface WidgetConfig {
  id: string;
  visible: boolean;
  component: React.ReactNode;
  title: string;
}

export default function DashboardStats() {
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<Record<string, boolean>>({
    kpi: true,
    radiation: true,
    isotope: true,
    alerts: true,
    radar: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('radix-dashboard-widgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse widget config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleWidget = (id: string) => {
    const newWidgets = { ...widgets, [id]: !widgets[id] };
    setWidgets(newWidgets);
    localStorage.setItem('radix-dashboard-widgets', JSON.stringify(newWidgets));
  };

  const widgetDefinitions: WidgetConfig[] = [
    { id: 'kpi', visible: widgets.kpi !== false, component: <KpiRowWidget />, title: 'Key Performance Indicators' },
    { id: 'radiation', visible: widgets.radiation !== false, component: <RadiationChartWidget />, title: 'Radiation Logs' },
    { id: 'isotope', visible: widgets.isotope !== false, component: <IsotopeDistributionWidget />, title: 'Isotope Distribution' },
    { id: 'alerts', visible: widgets.alerts !== false, component: <AlertsBarChartWidget />, title: 'Alertas' },
    { id: 'radar', visible: widgets.radar !== false, component: <PatientActivityRadarWidget />, title: 'Patient Analytics' },
  ];

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Dashboard Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: isEditing ? 'var(--p, #3b82f6)' : 'var(--b, #ffffff)',
            color: isEditing ? '#ffffff' : 'var(--t-s, #4b5563)',
            border: isEditing ? '1px solid var(--p, #3b82f6)' : '1px solid var(--br, #e5e7eb)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isEditing ? (
            <>
              <Save size={16} /> Finish Editing
            </>
          ) : (
            <>
              <Pencil size={16} /> Edit Dashboard
            </>
          )}
        </button>
      </div>

      {/* KPI Row is always full width if visible */}
      {(() => {
        const kpiDef = widgetDefinitions.find(w => w.id === 'kpi');
        if (!kpiDef) return null;
        if (!kpiDef.visible && !isEditing) return null;

        return (
          <div style={{ position: 'relative', opacity: (!kpiDef.visible && isEditing) ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {kpiDef.component}
            {isEditing && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.1)', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 16, border: '2px dashed var(--p, #3b82f6)'
              }}>
                <button
                  onClick={() => toggleWidget(kpiDef.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 20,
                    background: kpiDef.visible ? 'var(--b, #ffffff)' : 'var(--t, #111827)',
                    color: kpiDef.visible ? 'var(--t, #111827)' : '#ffffff',
                    border: '1px solid var(--br, #e5e7eb)',
                    fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                >
                  {kpiDef.visible ? <><EyeOff size={16} /> Hide {kpiDef.title}</> : <><Eye size={16} /> Show {kpiDef.title}</>}
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Grid for remaining charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 18,
      }}>
        {widgetDefinitions.filter(w => w.id !== 'kpi').map(def => {
          if (!def.visible && !isEditing) return null;

          return (
            <div key={def.id} style={{ position: 'relative', opacity: (!def.visible && isEditing) ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: 350 }}>
              {def.component}
              {isEditing && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(255,255,255,0.1)', zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 16, border: '2px dashed var(--p, #3b82f6)'
                }}>
                  <button
                    onClick={() => toggleWidget(def.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', borderRadius: 20,
                      background: def.visible ? 'var(--b, #ffffff)' : 'var(--t, #111827)',
                      color: def.visible ? 'var(--t, #111827)' : '#ffffff',
                      border: '1px solid var(--br, #e5e7eb)',
                      fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    {def.visible ? <><EyeOff size={16} /> Hide Widget</> : <><Eye size={16} /> Show Widget</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
