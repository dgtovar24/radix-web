'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6d32e8', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runAnalytics = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('https://api.raddix.pro/v1/api/config/ai/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  // Auto-detect best chart type
  const detectChartType = (data: any[]) => {
    if (!data?.length) return 'bar';
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
    const textKeys = keys.filter(k => typeof data[0][k] !== 'number');
    if (textKeys.length === 1 && numericKeys.length === 1) return 'pie';
    if (numericKeys.length >= 1) return 'bar';
    return 'table';
  };

  const chartType = result?.data ? detectChartType(result.data) : 'table';
  const numericCols = result?.columns?.filter((c: string) => typeof result.data?.[0]?.[c] === 'number') || [];
  const labelCol = result?.columns?.find((c: string) => typeof result.data?.[0]?.[c] !== 'number') || result?.columns?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Inter', sans-serif", animation: 'fadeIn 0.35s ease-out' }}>
      {/* Input area */}
      <div style={{
        background: 'var(--sf)', borderRadius: 18, border: '1px solid var(--br)',
        padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', margin: '0 0 6px' }}>
          Análisis de Datos con Rix
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t-s)', margin: '0 0 14px' }}>
          Haz una pregunta en lenguaje natural y Rix generará la consulta SQL y el gráfico correspondiente.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAnalytics(); } }}
            placeholder="Ej: ¿Cuál es la radiación media por isótopo? o ¿Cuántos tratamientos activos hay por paciente?"
            rows={2}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              border: '1px solid var(--br)', background: 'var(--b)',
              color: 'var(--t)', fontSize: 13, outline: 'none',
              fontFamily: "'Inter', sans-serif", resize: 'none',
            }}
          />
          <button onClick={runAnalytics} disabled={loading || !query.trim()} style={{
            padding: '0 24px', borderRadius: 12, border: 'none',
            background: loading || !query.trim() ? 'var(--br)' : 'var(--p)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
          }}>
            {loading ? 'Consultando...' : 'Analizar'}
          </button>
        </div>
        {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12 }}>{error}</div>}
      </div>

      {/* Results */}
      {result?.data && (
        <div style={{
          background: 'var(--sf)', borderRadius: 18, border: '1px solid var(--br)',
          padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', margin: '0 0 4px' }}>
            {result.title}
          </h3>
          <p style={{ fontSize: 11, color: 'var(--t-s)', margin: '0 0 20px', fontFamily: 'monospace' }}>
            {result.sql}
          </p>

          {/* Chart */}
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie data={result.data} dataKey={numericCols[0]} nameKey={labelCol} cx="50%" cy="50%" outerRadius={120} label>
                    {result.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--br)' }} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={result.data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--br)" vertical={false} />
                  <XAxis dataKey={labelCol} tick={{ fontSize: 11, fill: 'var(--t-s)' }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--br)' }} />
                  {numericCols.map((col: string, i: number) => (
                    <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Data table */}
          <details style={{ marginTop: 20 }}>
            <summary style={{ fontSize: 12, fontWeight: 600, color: 'var(--t-s)', cursor: 'pointer' }}>Ver datos</summary>
            <div style={{ overflowX: 'auto', marginTop: 10, borderRadius: 10, border: '1px solid var(--br)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--br)', background: 'var(--b)' }}>
                    {result.columns.map((c: string) => (
                      <th key={c} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--t-s)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: i < result.data.length - 1 ? '1px solid var(--br)' : 'none' }}>
                      {result.columns.map((c: string) => (
                        <td key={c} style={{ padding: '8px 12px', color: 'var(--t)' }}>{String(row[c] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
