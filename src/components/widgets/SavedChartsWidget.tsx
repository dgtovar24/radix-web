import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface SavedChart { id: string; label: string; table: string; xColumn: string; yColumn: string; chartType: string; }

const API = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080/v2'
  : 'https://api.raddix.pro/v1';

export function SavedChartsWidget() {
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [Recharts, setRecharts] = useState<any>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem('radix-saved-charts') || '[]'); setCharts(saved); if (saved.length > 0) setActiveId(saved[0].id); } catch {}
    import('recharts').then(r => setRecharts(r));
  }, []);

  useEffect(() => {
    if (!activeId || !Recharts) return;
    const c = charts.find(ch => ch.id === activeId);
    if (!c) return;
    setLabel(c.label);
    fetch(`${API}/api/analytics/data`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: c.table, xColumn: c.xColumn, yColumn: c.yColumn, limit: 100 }),
    }).then(r => r.json()).then(d => setChartData(d.data || [])).catch(() => {});
  }, [activeId, Recharts, charts]);

  if (charts.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'var(--t-s)', fontSize: 13 }}>
        <BarChart3 size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
        <div>No hay gráficos guardados.</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Ve a <strong>Análisis</strong>, genera un gráfico y guárdalo para verlo aquí.</div>
      </div>
    );
  }

  const c = charts.find(ch => ch.id === activeId);

  return (
    <div style={{ background: 'var(--sf)', padding: 20, borderRadius: 16, border: '1px solid var(--br)', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>{label || 'Gráfico Guardado'}</div>
        {charts.length > 1 && (
          <select value={activeId || ''} onChange={e => setActiveId(e.target.value)} style={{
            padding: '4px 8px', borderRadius: 6, border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)', fontSize: 11,
          }}>
            {charts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        )}
      </div>

      {Recharts && chartData.length > 0 && c ? (
        <Recharts.ResponsiveContainer width="100%" height={280}>
          {c.chartType === 'bar' ? (
            <Recharts.BarChart data={chartData}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
              <Recharts.XAxis dataKey="x" tick={{ fontSize: 10, fill: 'var(--t-s)' }} interval={chartData.length > 15 ? Math.floor(chartData.length/5) : 0} />
              <Recharts.YAxis tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
              <Recharts.Tooltip />
              <Recharts.Bar dataKey="y" fill="var(--p)" radius={[4,4,0,0]} />
            </Recharts.BarChart>
          ) : c.chartType === 'line' ? (
            <Recharts.LineChart data={chartData}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
              <Recharts.XAxis dataKey="x" tick={{ fontSize: 10, fill: 'var(--t-s)' }} interval={chartData.length > 15 ? Math.floor(chartData.length/5) : 0} />
              <Recharts.YAxis tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
              <Recharts.Tooltip />
              <Recharts.Line type="monotone" dataKey="y" stroke="var(--p)" strokeWidth={3} dot={false} />
            </Recharts.LineChart>
          ) : c.chartType === 'pie' ? (
            <Recharts.PieChart>
              <Recharts.Pie data={chartData} dataKey="y" nameKey="x" cx="50%" cy="50%" outerRadius={100}>
                {chartData.map((_: any, i: number) => <Recharts.Cell key={i} fill={['var(--p)','var(--s)','#10b981','#f59e0b','#06b6d4','#8b5cf6'][i%6]} />)}
              </Recharts.Pie>
              <Recharts.Tooltip />
            </Recharts.PieChart>
          ) : c.chartType === 'area' ? (
            <Recharts.AreaChart data={chartData}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--br)" />
              <Recharts.XAxis dataKey="x" tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
              <Recharts.YAxis tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
              <Recharts.Tooltip />
              <Recharts.Area type="monotone" dataKey="y" stroke="var(--p)" fill="var(--p)" fillOpacity={0.2} />
            </Recharts.AreaChart>
          ) : null}
        </Recharts.ResponsiveContainer>
      ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-s)', fontSize: 12 }}>Cargando datos...</div>}
    </div>
  );
}
