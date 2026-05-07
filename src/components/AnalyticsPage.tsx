'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart3, TrendingUp, PieChart, AreaChart, Target, ScatterChart, X, FlaskConical, Activity, Save, Trash2, Play, Sparkles, Loader2, SendHorizontal } from 'lucide-react';

const API = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080/v2'
  : 'https://api.raddix.pro/v1';
const chartIcons: Record<string, any> = { BarChart3, TrendingUp, PieChart, AreaChart, Target, ScatterChart };

interface Column { key: string; label: string; type: string; }
interface Table { id: string; label: string; columns: Column[]; }
interface ChartType { id: string; label: string; icon: string; }
interface SavedChart { id: string; label: string; table: string; xColumn: string; yColumn: string; chartType: string; createdAt: string; table2?: string; joinField?: string; }

function loadSaved(): SavedChart[] {
  try { return JSON.parse(localStorage.getItem('radix-saved-charts') || '[]'); } catch { return []; }
}
function saveCharts(charts: SavedChart[]) { localStorage.setItem('radix-saved-charts', JSON.stringify(charts)); }

export default function AnalyticsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [chartTypes, setChartTypes] = useState<ChartType[]>([]);
  const [selTable, setSelTable] = useState('');
  const [selX, setSelX] = useState('');
  const [selY, setSelY] = useState('');
  const [selChart, setSelChart] = useState('bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [useTwoTables, setUseTwoTables] = useState(false);
  const [selTable2, setSelTable2] = useState('');
  const [joinField, setJoinField] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [ChartComponents, setChartComponents] = useState<any>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [rixQuery, setRixQuery] = useState('');
  const [rixLoading, setRixLoading] = useState(false);
  const [rixError, setRixError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/analytics/schema`).then(r => r.json()).then(d => {
      setTables(d.tables || []);
      setChartTypes(d.chartTypes || []);
    });
    import('recharts').then(r => setChartComponents(r));
    setSavedCharts(loadSaved());
  }, []);

  const saveCurrent = () => {
    if (!selTable || !selX || !selY || chartData.length === 0) return;
    setSaveName(`${tables.find(t=>t.id===selTable)?.label || selTable} — ${selChart}`);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (!saveName.trim()) return;
    const chart: SavedChart = { id: Date.now().toString(), label: saveName.trim(), table: selTable, xColumn: selX, yColumn: selY, chartType: selChart, createdAt: new Date().toISOString(), table2: useTwoTables ? selTable2 : undefined, joinField: useTwoTables ? joinField : undefined };
    saveCharts([...savedCharts, chart]);
    setSavedCharts(loadSaved());
    setShowSaveModal(false);
  };

  const loadChart = (c: SavedChart) => {
    setSelTable(c.table);
    setSelX(c.xColumn);
    setSelY(c.yColumn);
    setSelChart(c.chartType);
    if (c.table2 && c.joinField) { setUseTwoTables(true); setSelTable2(c.table2); setJoinField(c.joinField); }
    else setUseTwoTables(false);
    generateWith(c.table, c.xColumn, c.yColumn, !!(c.table2 && c.joinField), c.table2 || '', c.joinField || '');
  };

  const deleteChart = (id: string) => {
    saveCharts(savedCharts.filter(c => c.id !== id));
    setSavedCharts(loadSaved());
  };

  const columns = tables.find(t => t.id === selTable)?.columns || [];

  const generateWith = async (table: string, xCol: string, yCol: string, twoTables = false, table2 = '', join = '', sort = '') => {
    setLoading(true);
    try {
      const body: any = { table, xColumn: xCol, yColumn: yCol, limit: 200 };
      if (twoTables && table2 && join) { body.table2 = table2; body.joinField = join; }
      if (sort) body.sortOrder = sort;
      const r = await fetch(`${API}/api/analytics/data`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      setChartData(d.data || []);
    } catch {} finally { setLoading(false); }
  };

  const generate = () => { if (selTable && selX && selY) generateWith(selTable, selX, selY, useTwoTables, selTable2, joinField, sortOrder); };

  const rixSubmit = async () => {
    if (!rixQuery.trim() || rixLoading) return;
    setRixLoading(true);
    setRixError('');
    try {
      const r = await fetch(`${API}/api/analytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rixQuery.trim() }),
      });
      const d = await r.json();
      if (d.error) { setRixError(d.error); return; }
      if (!d.table || !d.xColumn || !d.yColumn) {
        setRixError('No se pudieron determinar los parámetros del gráfico.');
        return;
      }

      setSelTable(d.table);
      setSelX(d.xColumn);
      setSelY(d.yColumn);
      setSelChart(d.chartType || 'bar');
      const sort = d.sortOrder || '';
      setSortOrder(sort);
      const hasTwo = !!(d.table2 && d.joinField);
      if (hasTwo) {
        setUseTwoTables(true);
        setSelTable2(d.table2);
        setJoinField(d.joinField);
      } else {
        setUseTwoTables(false);
      }

      generateWith(d.table, d.xColumn, d.yColumn, hasTwo, d.table2 || '', d.joinField || '', sort);
    } catch {
      setRixError('Error de conexión.');
    } finally { setRixLoading(false); }
  };

  const handlePointClick = (point: any) => {
    const pid = point?.fk_patient_id || point?.id;
    if (pid) fetch(`${API}/api/analytics/patient/${pid}/full`).then(r => r.json()).then(setModal);
  };

  const fmt = (v: any) => typeof v === 'number' ? v.toFixed(2) : v;
  const fmtVal = (v: any) => typeof v === 'number' ? v.toFixed(2) : v;
  const fmtPie = (entry: any) => `${entry.name} (${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value})`;

  return (
    <div style={{ display: 'flex', gap: 20, fontFamily: "'Inter', sans-serif", minHeight: 'calc(100vh - 200px)' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rix-scroll::-webkit-scrollbar { width: 5px; }
        .rix-scroll::-webkit-scrollbar-track { background: transparent; }
        .rix-scroll::-webkit-scrollbar-thumb { background: var(--br); border-radius: 10px; }
        .rix-scroll::-webkit-scrollbar-thumb:hover { background: var(--t-s); }
      `}</style>
      {/* LEFT PANEL */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: 16, background: 'var(--sf)', borderRadius: 14, border: '1px solid var(--br)' }}>
          <h3 style={sH}>Datos</h3>
          <label style={lbl}>Tabla</label>
          <select value={selTable} onChange={e => { setSelTable(e.target.value); setSelX(''); setSelY(''); }} style={sel}><option value="">Seleccionar...</option>{tables.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <label style={{ ...lbl, marginTop: 10 }}>Eje X</label>
          <select value={selX} onChange={e => setSelX(e.target.value)} style={sel}><option value="">Seleccionar columna...</option>{columns.map(c => <option key={c.key} value={c.key}>{c.label} ({c.type})</option>)}</select>
          <label style={{ ...lbl, marginTop: 10 }}>Eje Y</label>
          <select value={selY} onChange={e => setSelY(e.target.value)} style={sel}><option value="">Seleccionar columna...</option>{columns.map(c => <option key={c.key} value={c.key}>{c.label} ({c.type})</option>)}</select>

          <label style={{ ...lbl, marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={useTwoTables} onChange={e => setUseTwoTables(e.target.checked)} style={{ width: 14, height: 14, cursor: 'pointer' }} />
            <span>Usar dos tablas distintas</span>
          </label>

          {useTwoTables && (
            <>
              <label style={{ ...lbl, marginTop: 10 }}>Tabla para eje Y</label>
              <select value={selTable2} onChange={e => setSelTable2(e.target.value)} style={sel}><option value="">Seleccionar...</option>{tables.filter(t => t.id !== selTable).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>

              <label style={{ ...lbl, marginTop: 10 }}>Campo de unión</label>
              <select value={joinField} onChange={e => setJoinField(e.target.value)} style={sel}>
                <option value="">Seleccionar campo...</option>
                <option value="fk_patient_id">ID del Paciente (fk_patient_id)</option>
                <option value="fk_treatment_id">ID del Tratamiento (fk_treatment_id)</option>
              </select>
            </>
          )}

          <label style={{ ...lbl, marginTop: 10 }}>Ordenar</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={sel}>
            <option value="">Sin ordenar</option>
            <option value="x-asc">X Ascendente (A-Z / menor a mayor)</option>
            <option value="x-desc">X Descendente (Z-A / mayor a menor)</option>
            <option value="y-asc">Y Ascendente</option>
            <option value="y-desc">Y Descendente</option>
          </select>

          <button onClick={generate} disabled={!selX || !selY || loading} style={{
            width: '100%', marginTop: 14, padding: '10px', borderRadius: 10, border: 'none',
            background: loading ? 'var(--br)' : 'var(--p)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{loading ? 'Generando...' : 'Generar Gráfico'}</button>
        </div>

        <div style={{ padding: 16, background: 'var(--sf)', borderRadius: 14, border: '1px solid var(--br)' }}>
          <h3 style={sH}>Tipo de Gráfico</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {chartTypes.map(ct => {
              const Icon = chartIcons[ct.icon] || BarChart3;
              const active = selChart === ct.id;
              return (
                <button key={ct.id} onClick={() => setSelChart(ct.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 10,
                  border: active ? '2px solid var(--p)' : '1px solid var(--br)',
                  background: active ? 'color-mix(in srgb, var(--p) 8%, #fff)' : 'var(--sf)', cursor: 'pointer',
                }}><Icon size={18} style={{ color: active ? 'var(--p)' : 'var(--t-s)' }} /><span style={{ fontSize: 10, fontWeight: 700, color: active ? 'var(--p)' : 'var(--t-s)' }}>{ct.label}</span></button>
              );
            })}
          </div>
        </div>

        {savedCharts.length > 0 && (
          <div style={{ padding: 16, background: 'var(--sf)', borderRadius: 14, border: '1px solid var(--br)' }}>
            <h3 style={sH}>Mis Gráficos ({savedCharts.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 250, overflowY: 'auto' }}>
              {savedCharts.map(c => {
                const Icon = chartIcons[c.chartType] || BarChart3;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--b)', border: '1px solid var(--br)' }}>
                    <Icon size={14} style={{ color: 'var(--p)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--t-s)' }}>{c.table} · {c.chartType}</div>
                    </div>
                    <button onClick={() => loadChart(c)} title="Cargar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p)', padding: 4 }}><Play size={14} /></button>
                    <button onClick={() => deleteChart(c.id)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-s)', padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CHART AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ flex: 1, background: 'var(--sf)', borderRadius: 14, border: '1px solid var(--br)', padding: 20, minHeight: 400 }}>
          {chartData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-s)', gap: 12 }}>
            <BarChart3 size={40} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Selecciona tabla, columnas y genera un gráfico</div>
            <div style={{ fontSize: 11, maxWidth: 300, textAlign: 'center', lineHeight: 1.5 }}>Elige tabla, columnas X/Y, tipo de gráfico y genera. Haz clic en los puntos para ver detalles del paciente.</div>
          </div>
        ) : ChartComponents ? (
          <ChartComponents.ResponsiveContainer width="100%" height={400}>
            {selChart === 'bar' ? (
              <ChartComponents.BarChart data={chartData}>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
                <ChartComponents.XAxis dataKey="x" tick={{ fontSize: 11, fill: 'var(--t-s)' }} interval={chartData.length > 20 ? Math.floor(chartData.length / 8) : 0} />
                <ChartComponents.YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                <ChartComponents.Tooltip formatter={fmtVal} /><ChartComponents.Bar dataKey="y" fill="var(--p)" radius={[4,4,0,0]} onClick={(e: any) => handlePointClick(e)} />
              </ChartComponents.BarChart>
            ) : selChart === 'line' ? (
              <ChartComponents.LineChart data={chartData}>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
                <ChartComponents.XAxis dataKey="x" tick={{ fontSize: 11, fill: 'var(--t-s)' }} interval={chartData.length > 20 ? Math.floor(chartData.length / 8) : 0} />
                <ChartComponents.YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                <ChartComponents.Tooltip formatter={fmtVal} /><ChartComponents.Line type="monotone" dataKey="y" stroke="var(--p)" strokeWidth={3} dot={chartData.length <= 30} activeDot={{ onClick: (_: any, e: any) => handlePointClick(e.payload) }} />
              </ChartComponents.LineChart>
            ) : selChart === 'pie' ? (
              <ChartComponents.PieChart>
                <ChartComponents.Pie data={chartData} dataKey="y" nameKey="x" cx="50%" cy="50%" outerRadius={120} label={fmtPie} onClick={(e: any) => handlePointClick(e)}>
                  {chartData.map((_: any, i: number) => <ChartComponents.Cell key={i} fill={['var(--p)','var(--s)','#10b981','#f59e0b','#06b6d4','#8b5cf6'][i % 6]} />)}
                </ChartComponents.Pie>
                <ChartComponents.Tooltip formatter={fmtVal} />
              </ChartComponents.PieChart>
            ) : selChart === 'area' ? (
              <ChartComponents.AreaChart data={chartData}>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
                <ChartComponents.XAxis dataKey="x" tick={{ fontSize: 11, fill: 'var(--t-s)' }} /><ChartComponents.YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                <ChartComponents.Tooltip formatter={fmtVal} /><ChartComponents.Area type="monotone" dataKey="y" stroke="var(--p)" fill="var(--p)" fillOpacity={0.2} onClick={(e: any) => handlePointClick(e)} />
              </ChartComponents.AreaChart>
            ) : selChart === 'scatter' ? (
              <ChartComponents.ScatterChart>
                <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
                <ChartComponents.XAxis dataKey="x" tick={{ fontSize: 11, fill: 'var(--t-s)' }} tickFormatter={fmt} />
                <ChartComponents.YAxis dataKey="y" tick={{ fontSize: 11, fill: 'var(--t-s)' }} tickFormatter={fmt} />
                <ChartComponents.Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any) => typeof v === 'number' ? v.toFixed(2) : v} />
                <ChartComponents.Scatter data={chartData} fill="var(--p)" onClick={(e: any) => e?.payload && handlePointClick(e.payload)} />
              </ChartComponents.ScatterChart>
            ) : null}
          </ChartComponents.ResponsiveContainer>
        ) : null}
        {chartData.length > 0 && (
          <>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t-s)', marginTop: 8 }}>{chartData.length} puntos · Haz clic en un punto para ver detalles.</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <button onClick={saveCurrent} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--p)', background: 'var(--sf)', color: 'var(--p)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <Save size={14} /> Guardar Gráfico
              </button>
            </div>
          </>
        )}
      </div>

      {/* Rix AI Query — below chart */}
      <div style={{ padding: 16, background: 'var(--sf)', borderRadius: 14, border: '1px solid var(--br)' }}>
        <h3 style={{ ...sH, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Sparkles size={14} style={{ color: 'var(--p)' }} />
          Pregúntale a Rix
        </h3>
        <div style={{ position: 'relative' }}>
          <textarea
            value={rixQuery}
            onChange={e => setRixQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); rixSubmit(); } }}
            placeholder="Ej: muéstrame la radiación promedio por paciente..."
            rows={5}
            className="rix-scroll"
            style={{
              width: '100%', padding: '12px 44px 12px 12px', borderRadius: 12, border: '1px solid var(--br)',
              background: 'var(--b)', color: 'var(--t)', fontSize: 12, resize: 'none',
              outline: 'none', fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
              maxHeight: 150, overflowY: 'auto',
            }}
          />
          <button onClick={rixSubmit} disabled={rixLoading || !rixQuery.trim()} style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 34, height: 34, borderRadius: 10, border: 'none',
            background: rixLoading || !rixQuery.trim() ? 'var(--br)' : 'var(--p)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }} title="Enviar">
            {rixLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <SendHorizontal size={16} />}
          </button>
        </div>
        {rixError && (
          <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4 }}>
            <span style={{ color: '#ef4444' }}>{rixError}</span>
          </div>
        )}
      </div>
      </div>

      {/* PORTAL: Patient Detail Modal */}
      {modal && createPortal(
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--sf)', borderRadius: 18, padding: 28, maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t)', margin: 0 }}>{modal.patient?.fullName}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-s)' }}><X size={20} /></button>
            </div>
            {modal.patient && <div style={{ fontSize: 12, color: 'var(--t-s)', marginBottom: 16 }}>📞 {modal.patient.phone} · 📍 {modal.patient.address} · 🏷️ {modal.patient.familyAccessCode}</div>}
            {modal.treatments?.length > 0 && <Section title="Tratamientos" icon={FlaskConical}>{modal.treatments.map((t: any, i: number) => <div key={i} style={{ fontSize: 12, color: 'var(--t)', padding: '4px 0' }}>Dosis: {t.initialDose} mCi · Umbral: {t.safetyThreshold} mSv · {t.isolationDays}d · {t.isActive ? 'Activo' : 'Completado'}</div>)}</Section>}
            {modal.latestMetrics && <Section title="Últimas Métricas" icon={Activity}><div style={{ fontSize: 12, color: 'var(--t)' }}>BPM: {modal.latestMetrics.bpm} · Pasos: {modal.latestMetrics.steps} · Distancia: {modal.latestMetrics.distance} km · Radiación: {modal.latestMetrics.currentRadiation} mSv</div></Section>}
            {modal.alerts?.length > 0 && <Section title="Alertas" icon={Activity}>{modal.alerts.map((a: any, i: number) => <div key={i} style={{ fontSize: 11, color: 'var(--t)' }}>[{a.alertType}] {a.message} — {a.isResolved ? '✓' : '⚠️'}</div>)}</Section>}
            {modal.radiationHistory?.length > 0 && <Section title="Historial Radiación" icon={Activity}><div style={{ fontSize: 11, color: 'var(--t-s)' }}>{modal.radiationHistory.length} registros</div></Section>}
          </div>
        </div>,
        document.body
      )}

      {/* PORTAL: Save Chart Modal */}
      {showSaveModal && createPortal(
        <div onClick={() => setShowSaveModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--sf)', borderRadius: 18, padding: 28, maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', margin: 0 }}>Guardar Gráfico</h2>
              <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-s)' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t-s)', marginBottom: 14 }}>Dale un nombre descriptivo para identificarlo en el dashboard.</p>
            <input autoFocus value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmSave(); }}
              placeholder="Ej: BPM medio por paciente"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--br)', background: 'var(--sf)', color: 'var(--t)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmSave} disabled={!saveName.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: saveName.trim() ? 'var(--p)' : 'var(--br)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saveName.trim() ? 'pointer' : 'default' }}>Guardar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: 'var(--b)', border: '1px solid var(--br)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon size={14} style={{ color: 'var(--p)' }} /><span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)' }}>{title}</span></div>
      {children}
    </div>
  );
}

const sH: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: 'var(--t-s)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 };
const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--t-s)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 };
const sel: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)', fontSize: 12, outline: 'none' };
