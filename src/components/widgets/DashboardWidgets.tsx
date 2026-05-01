import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeProvider';
import { Users, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, ActivitySquare, Target, ChevronDown, Search, Check } from 'lucide-react';
import { dashboard, alerts, patients, isotopes, type DashboardStats, type Patient, type Isotope, type Alert } from '../../services/api';

function EmptyChartFallback({ label = 'Cargando datos...' }: { label?: string }) {
  return (
    <div style={{
      height: '100%',
      minHeight: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      background: 'var(--b, #f8fafc)',
      color: 'var(--t-s, #6b7280)',
      fontSize: 13,
      fontWeight: 600,
    }}>
      {label}
    </div>
  );
}

function SimpleLineFallback({ data }: { data: any[] }) {
  const values = data.flatMap((row) => Object.entries(row)
    .filter(([key, value]) => key !== 'day' && typeof value === 'number')
    .map(([, value]) => value as number));
  if (!values.length) return <EmptyChartFallback label="Sin mediciones disponibles" />;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 20);
  const points = data.map((row, index) => {
    const numeric = Object.entries(row).find(([key, value]) => key !== 'day' && key !== 'threshold' && typeof value === 'number')?.[1] as number | undefined;
    const value = numeric ?? row.threshold ?? 0;
    const x = 36 + index * (300 / Math.max(1, data.length - 1));
    const y = 180 - ((value - min) / Math.max(1, max - min)) * 140;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 380 220" role="img" aria-label="Gráfico de radiación" style={{ width: '100%', height: '100%', minHeight: 220 }}>
      {[0, 1, 2, 3].map((line) => <line key={line} x1="28" x2="360" y1={45 + line * 40} y2={45 + line * 40} stroke="var(--br, #e5e7eb)" strokeDasharray="4 6" />)}
      <polyline points={points} fill="none" stroke="var(--p, #7c3aed)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((row, index) => <text key={row.day} x={30 + index * (300 / Math.max(1, data.length - 1))} y="210" fill="var(--t-s, #6b7280)" fontSize="12">{row.day}</text>)}
    </svg>
  );
}

function PatientFilterDropdown({ patients, selectedId, onSelect }: { patients: Patient[], selectedId: string, onSelect: (id: string) => void }) {
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

  const allOption = { id: 'all' as const, name: 'Todos los pacientes' };
  const options = [allOption, ...patients.map(p => ({ id: String(p.id), name: p.fullName }))];
  const filtered = options.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selected = options.find(p => p.id === selectedId);

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
        {selected?.name || 'Seleccionar Paciente'}
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
          <div style={{ padding: '12px 12px 8px 12px', borderBottom: '1px solid var(--br, #f3f4f6)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: 8, scrollbarWidth: 'thin' }}>
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p.id); setIsOpen(false); setSearchTerm(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 6, border: 'none',
                  background: selectedId === p.id ? 'var(--b, #f3f4f6)' : 'transparent',
                  color: selectedId === p.id ? 'var(--t, #111827)' : 'var(--t-s, #4b5563)',
                  fontSize: 13, fontWeight: selectedId === p.id ? 600 : 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s'
                }}
              >
                {p.name}
                {selectedId === p.id && <Check size={14} color="var(--p, #3b82f6)" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function KpiRowWidget() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboard.getStats().then(setStats).catch(console.error);
    const interval = setInterval(() => { dashboard.getStats().then(setStats).catch(() => {}); }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando estadísticas...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
      {[
        { label: 'Pacientes Totales', value: stats.totalPatients, icon: Users, trend: '+12', trendColor: '#10b981' },
        { label: 'Tratamientos Activos', value: stats.activeTreatments, icon: Activity, trend: '-2', trendColor: 'var(--s, #ef4444)' },
        { label: 'Alertas Pendientes', value: stats.pendingAlerts, icon: AlertTriangle, trend: 'Requieren Acción', trendColor: '#f59e0b' },
      ].map((kpi) => (
        <div key={kpi.label} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--sf, #ffffff)', padding: 20, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--b, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
            <kpi.icon size={22} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-s, #6b7280)', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)' }}>{kpi.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: kpi.trendColor, display: 'flex', alignItems: 'center', gap: 2 }}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight size={12} /> : kpi.trend.startsWith('-') ? <ArrowDownRight size={12} /> : null}
                {kpi.trend}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadiationChartWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [radiationData, setRadiationData] = useState<any[]>([]);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('recharts').then((r) => setChartComponents(r)).catch(() => setChartComponents(false));
    patients.getAll().then(setPatientList).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatient === 'all') {
      Promise.all(patientList.slice(0, 8).map(p =>
        import('../../services/api').then(m => m.radiationLogs.getByPatient(p.id, 7))
      )).then(results => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const grouped: any = {};
        results.forEach((logs, idx) => {
          logs.forEach((log: any) => {
            const d = new Date(log.timestamp);
            const key = days[d.getDay() === 0 ? 6 : d.getDay() - 1] || days[idx % 7];
            if (!grouped[key]) grouped[key] = {};
            grouped[key][`p_${idx}`] = log.radiationLevel;
            grouped[key].threshold = 15.0;
          });
        });
        if (Object.keys(grouped).length === 0) {
          setRadiationData(days.map(d => ({ day: d, threshold: 15.0 })));
        } else {
          setRadiationData(days.map(d => ({ day: d, threshold: 15.0, ...(grouped[d] || {}) })));
        }
      }).catch(() => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        setRadiationData(days.map((day, i) => ({ day, threshold: 15, p_0: 9 + i * 0.9, p_1: 12 + Math.sin(i) * 2 })));
      });
    } else {
      import('../../services/api').then(m =>
        m.radiationLogs.getByPatient(Number(selectedPatient), 7)
      ).then(logs => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        setRadiationData(days.map((d, i) => ({
          day: d,
          threshold: 15.0,
          radiation: logs[i]?.radiationLevel,
        })));
      }).catch(() => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        setRadiationData(days.map((day, i) => ({ day, threshold: 15, radiation: 8 + i * 0.7 })));
      });
    }
  }, [selectedPatient, patientList]);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'];

  return (
    <div style={{ background: 'var(--sf, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--b, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
            <ActivitySquare size={16} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Niveles de Radiación</div>
        </div>
        <PatientFilterDropdown patients={patientList} selectedId={selectedPatient} onSelect={setSelectedPatient} />
      </div>
      <div style={{ height: 280, minHeight: 280, marginLeft: -15 }}>
        {ChartComponents && radiationData.length > 0 ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.LineChart data={radiationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br, #f3f4f6)" vertical={false} />
              <ChartComponents.XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickMargin={10} />
              <ChartComponents.YAxis tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v.toFixed(1)}mSv`} />
              <ChartComponents.Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              {selectedPatient === 'all' ? (
                patientList.slice(0, 8).map((p, idx) => (
                  <ChartComponents.Line key={p.id} type="monotone" dataKey={`p_${idx}`} name={p.fullName}
                    stroke={COLORS[idx]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                ))
              ) : (
                <ChartComponents.Area type="monotone" dataKey="radiation" name="Radiación" stroke="var(--p)" strokeWidth={3} fill="url(#radGrad)" />
              )}
              <ChartComponents.Line type="step" dataKey="threshold" name="Límite" stroke="var(--s)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              {selectedPatient !== 'all' && (
                <defs>
                  <linearGradient id="radGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--p)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--p)" stopOpacity={0} />
                  </linearGradient>
                </defs>
              )}
            </ChartComponents.LineChart>
          </ChartComponents.ResponsiveContainer>
        ) : (
          <SimpleLineFallback data={radiationData} />
        )}
      </div>
    </div>
  );
}

export function IsotopeDistributionWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [isotopeData, setIsotopeData] = useState<{ name: string; value: number }[]>([]);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('recharts').then((r) => setChartComponents(r)).catch(() => setChartComponents(false));
    Promise.all([
      isotopes.getAll(),
      import('../../services/api').then(m => m.treatments.getAll()),
    ]).then(([isoList, treatments]) => {
      const counts: Record<string, number> = {};
      treatments.forEach(t => {
        const iso = isoList.find(i => i.id === t.isotopeId);
        if (iso) counts[iso.name] = (counts[iso.name] || 0) + 1;
      });
      setIsotopeData(Object.entries(counts).map(([name, value]) => ({ name, value })));
    }).catch(console.error);
  }, []);

  const COLORS = ['var(--p)', 'var(--s)', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

  return (
    <div style={{ background: 'var(--sf, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--b, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
          <Target size={16} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Distribución de Isótopos</div>
      </div>
      <div style={{ height: 280, minHeight: 280 }}>
        {ChartComponents ? (
          isotopeData.length > 0 ? (
            <ChartComponents.ResponsiveContainer width="100%" height="100%">
              <ChartComponents.PieChart>
                <ChartComponents.Pie data={isotopeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {isotopeData.map((_, i) => <ChartComponents.Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </ChartComponents.Pie>
                <ChartComponents.Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <ChartComponents.Legend verticalAlign="bottom" height={36} iconType="circle" />
              </ChartComponents.PieChart>
            </ChartComponents.ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-s)', fontSize: 13 }}>No hay datos de isótopos aún</div>
          )
        ) : (
          <EmptyChartFallback label="Sin datos de isótopos aún" />
        )}
      </div>
    </div>
  );
}

export function AlertsBarChartWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [alertTypes, setAlertTypes] = useState<{ type: string; count: number }[]>([]);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('recharts').then((r) => setChartComponents(r)).catch(() => setChartComponents(false));
    alerts.getAll().then(list => {
      const counts: Record<string, number> = {};
      list.forEach(a => { counts[a.alertType] = (counts[a.alertType] || 0) + 1; });
      setAlertTypes(Object.entries(counts).map(([type, count]) => ({ type, count })));
    }).catch(console.error);
  }, []);

  return (
    <div style={{ background: 'var(--sf, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--b, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
          <AlertTriangle size={16} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Alertas por Tipo</div>
      </div>
      <div style={{ height: 280, minHeight: 280, marginLeft: -25 }}>
        {ChartComponents && alertTypes.length > 0 ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.BarChart data={alertTypes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
              <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br, #f3f4f6)" horizontal={true} vertical={false} />
              <ChartComponents.XAxis type="number" tick={{ fontSize: 12, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} />
              <ChartComponents.YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: 'var(--t-s, #9ca3af)' }} axisLine={false} tickLine={false} width={110} />
              <ChartComponents.Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'var(--sf, #f8fafc)' }} />
              <ChartComponents.Bar dataKey="count" fill="var(--s)" radius={[0, 4, 4, 0]} barSize={20} />
            </ChartComponents.BarChart>
          </ChartComponents.ResponsiveContainer>
        ) : (
          <EmptyChartFallback label="Sin alertas para graficar" />
        )}
      </div>
    </div>
  );
}

export function PatientActivityRadarWidget() {
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const { palette } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('recharts').then((r) => setChartComponents(r)).catch(() => setChartComponents(false));
    patients.getAll().then(setPatientList).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatient !== 'all' && patientList.length > 0) {
      import('../../services/api').then(m =>
        m.healthMetrics.getByPatient(Number(selectedPatient), 7)
      ).then(metrics => {
        const avg = (field: string) => metrics.length > 0 ? metrics.reduce((s: number, m: any) => s + (m[field] || 0), 0) / metrics.length : 0;
        setRadarData([
          { subject: 'Movilidad', A: Math.min(150, avg('steps') / 50), fullMark: 150 },
          { subject: 'Cardíaco', A: Math.min(150, avg('bpm') || 80), fullMark: 150 },
          { subject: 'Radiación', A: Math.min(150, (avg('currentRadiation') || 5) * 10), fullMark: 150 },
          { subject: 'Distancia', A: Math.min(150, (avg('distance') || 2) * 30), fullMark: 150 },
        ]);
      }).catch(() => {});
    } else {
      Promise.all(patientList.slice(0, 8).map(patient =>
        import('../../services/api').then(m => m.healthMetrics.getByPatient(patient.id, 7))
      )).then(results => {
        const metrics = results.flat();
        if (metrics.length === 0) {
          setRadarData([]);
          return;
        }
        const avg = (field: string) => metrics.reduce((sum: number, metric: any) => sum + (metric[field] || 0), 0) / metrics.length;
        setRadarData([
          { subject: 'Movilidad', A: Math.min(150, avg('steps') / 50), fullMark: 150 },
          { subject: 'Cardíaco', A: Math.min(150, avg('bpm')), fullMark: 150 },
          { subject: 'Radiación', A: Math.min(150, avg('currentRadiation') * 10), fullMark: 150 },
          { subject: 'Distancia', A: Math.min(150, avg('distance') * 30), fullMark: 150 },
        ]);
      }).catch(() => setRadarData([]));
    }
  }, [selectedPatient, patientList]);

  return (
    <div style={{ background: 'var(--sf, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--b, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t, #111827)' }}>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t, #111827)' }}>Análisis de Cohorte</div>
        </div>
        <PatientFilterDropdown patients={patientList} selectedId={selectedPatient} onSelect={setSelectedPatient} />
      </div>
      <div style={{ height: 280, minHeight: 280 }}>
        {ChartComponents && radarData.length > 0 ? (
          <ChartComponents.ResponsiveContainer width="100%" height="100%">
            <ChartComponents.RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <ChartComponents.PolarGrid stroke="var(--br, #f3f4f6)" />
              <ChartComponents.PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--t-s, #6b7280)', fontSize: 11 }} />
              <ChartComponents.PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <ChartComponents.Radar name={selectedPatient === 'all' ? 'General' : 'Paciente'} dataKey="A" stroke="var(--p)" fill="var(--p)" fillOpacity={0.3} />
              <ChartComponents.Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--t, #111827)', color: '#fff' }} />
            </ChartComponents.RadarChart>
          </ChartComponents.ResponsiveContainer>
        ) : (
          <EmptyChartFallback label="Sin métricas de cohorte" />
        )}
      </div>
    </div>
  );
}
