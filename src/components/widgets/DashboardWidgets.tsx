import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeProvider';
import { Users, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, ActivitySquare, Target, ChevronDown, Search, Check } from 'lucide-react';
import {
  MOCK_STATS,
  MOCK_RADIATION_LOGS,
  MOCK_ISOTOPE_DISTRIBUTION,
  MOCK_ALERTS_DATA,
  MOCK_RADAR_DATA,
  MOCK_PATIENTS_LIST
} from './mockDashboardData';

// --- Custom Patient Filter Dropdown ---
function PatientFilterDropdown({ selectedId, onSelect }: { selectedId: string, onSelect: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = MOCK_PATIENTS_LIST.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPatient = MOCK_PATIENTS_LIST.find(p => p.id === selectedId);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--b, #f8fafc)',
          border: '1px solid var(--br, #e5e7eb)',
          fontSize: 13, fontWeight: 600, color: 'var(--t, #111827)',
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        {selectedPatient?.name || 'Seleccionar Paciente'}
        <ChevronDown size={14} color="var(--t-s, #6b7280)" />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 240, background: 'var(--sf, #ffffff)',
          border: '1px solid var(--br, #e5e7eb)', borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 50, display: 'flex', flexDirection: 'column'
        }}>
          {/* Search Input */}
          <div style={{ padding: '12px 12px 8px 12px', borderBottom: '1px solid var(--br, #f3f4f6)' }}>
            <div style={{
              position: 'relative', display: 'flex', alignItems: 'center',
            }}>
              <Search size={14} color="var(--t-s, #9ca3af)" style={{ position: 'absolute', left: 10 }} />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 30px',
                  borderRadius: 6, border: '1px solid var(--br, #e5e7eb)',
                  background: 'var(--b, #f9fafb)',
                  fontSize: 13, color: 'var(--t, #111827)',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div style={{
            maxHeight: 220, overflowY: 'auto', padding: 8,
            scrollbarWidth: 'thin', scrollbarColor: 'var(--br, #d1d5db) transparent'
          }}>
            {filteredPatients.length === 0 ? (
              <div style={{ padding: '12px', fontSize: 13, color: 'var(--t-s, #6b7280)', textAlign: 'center' }}>
                No se encontraron pacientes
              </div>
            ) : (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => {
                    onSelect(patient.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 6, border: 'none',
                    background: selectedId === patient.id ? 'var(--b, #f3f4f6)' : 'transparent',
                    color: selectedId === patient.id ? 'var(--t, #111827)' : 'var(--t-s, #4b5563)',
                    fontSize: 13, fontWeight: selectedId === patient.id ? 600 : 500,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--b, #f3f4f6)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedId === patient.id ? 'var(--b, #f3f4f6)' : 'transparent'}
                >
                  {patient.name}
                  {selectedId === patient.id && <Check size={14} color="var(--p, #3b82f6)" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function KpiRowWidget() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 20,
    }}>
      {/* Total Patients */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--b, #ffffff)', padding: 20, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: 'var(--sf, #f8fafc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)'
        }}>
          <Users size={22} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #6b7280)', marginBottom: 4 }}>Pacientes Totales</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)' }}>{MOCK_STATS.totalPatients}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} /> +12
            </span>
          </div>
        </div>
      </div>

      {/* Active Treatments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--b, #ffffff)', padding: 20, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: 'var(--sf, #f8fafc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)'
        }}>
          <Activity size={22} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #6b7280)', marginBottom: 4 }}>Tratamientos Activos</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)' }}>{MOCK_STATS.activeTreatments}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--s, #ef4444)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowDownRight size={12} /> -2
            </span>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--b, #ffffff)', padding: 20, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: 'var(--sf, #f8fafc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)'
        }}>
          <AlertTriangle size={22} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #6b7280)', marginBottom: 4 }}>Alertas Pendientes</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)' }}>{MOCK_STATS.pendingAlerts}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
              Requieren Acción
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RadiationChartWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.all([import('recharts')]).then(([recharts]) => {
      setChartComponents(recharts);
    });
  }, []);

  // Generar datos dinámicos para múltiples pacientes
  const displayData = React.useMemo(() => {
    return MOCK_RADIATION_LOGS.map(log => {
      const base = log.radiation;
      const dataPoint: any = { day: log.day, threshold: log.threshold };
      
      if (selectedPatient === 'all') {
        // Generar una línea para cada paciente con ligera variación
        MOCK_PATIENTS_LIST.filter(p => p.id !== 'all').forEach((p, idx) => {
          // Variación seudoaleatoria pero consistente basada en el índice
          const variation = (Math.sin(idx * 1.5) * 2) + (Math.cos(idx * 0.5) * 1.5);
          dataPoint[`p_${p.id}`] = Math.max(5, Math.min(20, base + variation));
        });
      } else {
        // Un solo paciente seleccionado
        const idx = parseInt(selectedPatient) || 1;
        const variation = (Math.sin(idx * 1.5) * 2) + (Math.cos(idx * 0.5) * 1.5);
        dataPoint['radiation'] = Math.max(5, Math.min(20, base + variation));
      }
      return dataPoint;
    });
  }, [selectedPatient]);

  const activePatients = MOCK_PATIENTS_LIST.filter(p => p.id !== 'all');
  // Usar colores sutiles para las múltiples líneas
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];

  // Custom Tooltip para evitar el problema de scroll con muchos pacientes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--t, #111827)',
          borderRadius: 12,
          padding: 12,
          color: '#fff',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          pointerEvents: 'none',
          border: 'none',
          zIndex: 1000,
          position: 'relative'
        }}>
          <div style={{ color: '#9ca3af', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>{label}</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: payload.length > 5 ? '1fr 1fr' : '1fr', 
            columnGap: 16,
            rowGap: 4
          }}>
            {payload.map((entry: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
                <span style={{ color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }} title={entry.name}>{entry.name}:</span>
                <span style={{ fontWeight: 600 }}>{entry.value}mSv</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'var(--b, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sf, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
            <ActivitySquare size={16} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Niveles Medios de Radiación</div>
        </div>
        <PatientFilterDropdown selectedId={selectedPatient} onSelect={setSelectedPatient} />
      </div>
      
      <div style={{ flex: 1, minHeight: 250, marginLeft: -15 }}>
        {ChartComponents ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            {selectedPatient === 'all' ? (
              <ChartComponents.LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br, #f3f4f6)" vertical={false} />
                <ChartComponents.XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickMargin={10} />
                <ChartComponents.YAxis tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}mSv`} />
                <ChartComponents.Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 1000 }}
                  cursor={{ stroke: 'var(--br, #e5e7eb)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {activePatients.map((p, idx) => (
                  <ChartComponents.Line 
                    key={p.id} 
                    type="monotone" 
                    dataKey={`p_${p.id}`} 
                    name={p.name}
                    stroke={COLORS[idx % COLORS.length]} 
                    strokeWidth={1.5} 
                    dot={false}
                    activeDot={{ r: 4 }} 
                    isAnimationActive={true} 
                  />
                ))}
                <ChartComponents.Line type="step" dataKey="threshold" name="Límite Seguro" stroke="var(--s)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={true} />
              </ChartComponents.LineChart>
            ) : (
              <ChartComponents.AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="radGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--p)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--p)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br, #f3f4f6)" vertical={false} />
                <ChartComponents.XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickMargin={10} />
                <ChartComponents.YAxis tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}mSv`} />
                <ChartComponents.Tooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <ChartComponents.Area type="monotone" name="Radiación" dataKey="radiation" stroke="var(--p)" strokeWidth={3} fill="url(#radGrad)" activeDot={{ r: 6, fill: 'var(--p)', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={true} />
                <ChartComponents.Line type="step" dataKey="threshold" name="Límite Seguro" stroke="var(--s)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={true} />
              </ChartComponents.AreaChart>
            )}
          </ChartComponents.ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

export function IsotopeDistributionWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.all([import('recharts')]).then(([recharts]) => {
      setChartComponents(recharts);
    });
  }, []);

  const COLORS = ['var(--p)', 'var(--s)', '#10b981', '#f59e0b'];

  return (
    <div style={{ background: 'var(--b, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sf, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
          <Target size={16} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Distribución de Isótopos</div>
      </div>
      
      <div style={{ flex: 1, minHeight: 250 }}>
        {ChartComponents ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.PieChart>
              <ChartComponents.Pie
                data={MOCK_ISOTOPE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {MOCK_ISOTOPE_DISTRIBUTION.map((entry, index) => (
                  <ChartComponents.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </ChartComponents.Pie>
              <ChartComponents.Tooltip 
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <ChartComponents.Legend verticalAlign="bottom" height={36} iconType="circle" />
            </ChartComponents.PieChart>
          </ChartComponents.ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

export function AlertsBarChartWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.all([import('recharts')]).then(([recharts]) => {
      setChartComponents(recharts);
    });
  }, []);

  return (
    <div style={{ background: 'var(--b, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sf, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
          <AlertTriangle size={16} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Alertas Recientes por Tipo</div>
      </div>
      
      <div style={{ flex: 1, minHeight: 250, marginLeft: -25 }}>
        {ChartComponents ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.BarChart data={MOCK_ALERTS_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
              <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br, #f3f4f6)" horizontal={true} vertical={false} />
              <ChartComponents.XAxis type="number" tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} />
              <ChartComponents.YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} width={80} />
              <ChartComponents.Tooltip 
                wrapperStyle={{ zIndex: 1000 }}
                cursor={{ fill: 'var(--sf, #f8fafc)' }}
                contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <ChartComponents.Bar dataKey="count" fill="var(--s)" radius={[0, 4, 4, 0]} barSize={20} />
            </ChartComponents.BarChart>
          </ChartComponents.ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

export function PatientActivityRadarWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.all([import('recharts')]).then(([recharts]) => {
      setChartComponents(recharts);
    });
  }, []);

  // Simular filtrado para afectar la gráfica
  const displayData = selectedPatient === 'all' 
    ? MOCK_RADAR_DATA 
    : MOCK_RADAR_DATA.map(d => ({ ...d, A: Math.max(50, d.A - 30) }));

  return (
    <div style={{ background: 'var(--b, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sf, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Análisis de Cohorte de Pacientes</div>
        </div>
        <PatientFilterDropdown selectedId={selectedPatient} onSelect={setSelectedPatient} />
      </div>
      
      <div style={{ flex: 1, minHeight: 250 }}>
        {ChartComponents ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayData}>
              <ChartComponents.PolarGrid stroke="var(--br, #f3f4f6)" />
              <ChartComponents.PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--t-s, #6b7280)', fontSize: 11 }} />
              <ChartComponents.PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <ChartComponents.Radar name={selectedPatient === 'all' ? "Semana Actual" : "Estado del Paciente"} dataKey="A" stroke="var(--p)" fill="var(--p)" fillOpacity={0.3} isAnimationActive={true} />
              {selectedPatient === 'all' && (
                <ChartComponents.Radar name="Semana Anterior" dataKey="B" stroke="var(--s)" fill="var(--s)" fillOpacity={0.3} isAnimationActive={true} />
              )}
              <ChartComponents.Tooltip 
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }}
              />
              <ChartComponents.Legend wrapperStyle={{ fontSize: 12 }} />
            </ChartComponents.RadarChart>
          </ChartComponents.ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
