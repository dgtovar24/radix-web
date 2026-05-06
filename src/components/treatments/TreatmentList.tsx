'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, Calendar, MoreVertical, Clock, ChevronLeft, ChevronRight, Shield, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { treatments, type Treatment } from '../../services/api';

function calcRemaining(startDate: string, isolationDays: number) {
  const start = new Date(startDate).getTime();
  const end = start + isolationDays * 86400000;
  const remaining = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  return remaining;
}

export default function TreatmentList() {
  const [treatmentList, setTreatmentList] = useState<Treatment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { loadTreatments(); }, []);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const data = await treatments.getAll();
      setTreatmentList(data);
    } catch (err) {
      console.error('Error loading treatments', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = treatmentList.filter(t =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.isotopeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.35s ease-out', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--b)', border: '1px solid var(--br)',
          borderRadius: 99, padding: '8px 16px', width: 'min(100%, 320px)',
        }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input type="text" placeholder="Buscar tratamiento..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13, color: 'var(--t)', background: 'transparent', border: 'none', outline: 'none' }} />
        </div>
      </div>

      {/* Responsive wrapper */}
      <div className="rx-table-wrap" style={{
        background: 'var(--sf)', borderRadius: 20, border: '1px solid var(--br)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando tratamientos...</div>
        ) : filteredTreatments.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>No se encontraron tratamientos.</div>
        ) : (
          <>
            {/* MOBILE CARDS — visible below 860px */}
            <div className="rx-cards" style={{ display: 'none', padding: '16px 16px 0', gap: 12 }}>
              {filteredTreatments.map(t => {
                const remaining = calcRemaining(t.startDate, t.isolationDays);
                const radPct = t.currentRadiation ? Math.min(100, (t.currentRadiation / t.safetyThreshold) * 100) : 0;
                return (
                  <div key={t.id} style={{
                    background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)',
                    borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)' }}>
                          <Activity size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>{t.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--t-s)' }}>Sala {t.room}</div>
                        </div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.isActive ? 'var(--p)' : 'var(--t-s)' }} />
                        <span style={{ color: 'var(--t)', fontWeight: 600 }}>{t.isActive ? 'Activo' : 'Finalizado'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Isótopo</span><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{t.isotopeName}</div></div>
                      <div><span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Dosis</span><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{t.initialDose.toFixed(1)} mCi</div></div>
                      <div><span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Confinamiento</span><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s)' }}>{t.isolationDays}d total</div></div>
                      <div><span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Restante</span><div style={{ fontSize: 13, fontWeight: 700, color: remaining <= 3 ? '#ef4444' : 'var(--p)' }}>{remaining}d</div></div>
                    </div>

                    {t.currentRadiation && (
                      <div style={{ background: 'var(--b)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Radiación</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: radPct > 80 ? '#ef4444' : 'var(--p)' }}>{t.currentRadiation.toFixed(2)} mSv</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--br)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${radPct}%`, height: '100%', background: radPct > 80 ? '#ef4444' : 'var(--p)', borderRadius: 2 }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t-s)' }}>
                      <span>Inicio: {t.startDate ? new Date(t.startDate).toLocaleDateString('es-ES') : 'N/A'}</span>
                      <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-s)' }}>{expanded === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    </div>
                    {expanded === t.id && (
                      <div style={{ background: 'var(--b)', borderRadius: 10, padding: 12, borderTop: '1px solid var(--br)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <FlaskConical size={12} style={{ color: 'var(--p)' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fórmula — {t.isotopeName}</span>
                        </div>
                        {(t.effectiveHalfLife && t.physicalHalfLife && t.biologicalHalfLife) ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <div style={{ background: 'var(--sf)', borderRadius: 6, padding: 8, border: '1px solid var(--br)' }}><div style={{ fontSize: 9, color: 'var(--t-s)', textTransform: 'uppercase' }}>T<sub>f</sub></div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)' }}>{t.physicalHalfLife}</div></div>
                            <div style={{ background: 'var(--sf)', borderRadius: 6, padding: 8, border: '1px solid var(--br)' }}><div style={{ fontSize: 9, color: 'var(--t-s)', textTransform: 'uppercase' }}>T<sub>b</sub></div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)' }}>{t.biologicalHalfLife}</div></div>
                            <div style={{ gridColumn: '1 / -1', background: 'var(--sf)', borderRadius: 6, padding: 8, border: '1px solid var(--br)' }}><div style={{ fontSize: 9, color: 'var(--t-s)', textTransform: 'uppercase' }}>T<sub>e</sub> = {t.effectiveHalfLife!.toFixed(4)} {t.halfLifeUnit || 'días'}</div></div>
                          </div>
                        ) : <div style={{ fontSize: 10, color: 'var(--t-s)' }}>Datos de semivida no disponibles.</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE — hidden below 860px */}
            <div className="rx-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--br)' }}>
                    {['Paciente', 'Isótopo', 'Dosis', 'Confinamiento', 'Restante', 'Radiación', 'Inicio', 'Estado'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--t-s)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTreatments.map((t, idx) => {
                    const remaining = calcRemaining(t.startDate, t.isolationDays);
                    const radPct = t.currentRadiation ? Math.min(100, (t.currentRadiation / t.safetyThreshold) * 100) : 0;
                    return (
                      <>
                       <tr key={t.id} onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                         style={{ borderBottom: idx < filteredTreatments.length - 1 ? '1px solid var(--br)' : 'none', cursor: 'pointer' }}>
                         <td style={{ padding: '14px 16px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                             <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: 0 }}>
                               <Activity size={15} />
                             </div>
                             <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{t.patientName}</div><div style={{ fontSize: 10, color: 'var(--t-s)' }}>Sala {t.room}</div></div>
                           </div>
                         </td>
                         <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, background: 'var(--b)', border: '1px solid var(--p)', color: 'var(--p)', fontSize: 11, fontWeight: 700 }}>{t.isotopeName}</span></td>
                         <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{t.initialDose.toFixed(1)}</td>
                         <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--s)' }}>{t.isolationDays}d</td>
                         <td style={{ padding: '14px 16px' }}><span style={{ fontSize: 13, fontWeight: 700, color: remaining <= 3 ? '#ef4444' : 'var(--p)' }}>{remaining}d</span></td>
                         <td style={{ padding: '14px 16px' }}>{t.currentRadiation ? <div><div style={{ fontSize: 11, fontWeight: 600, color: radPct > 80 ? '#ef4444' : 'var(--t)' }}>{t.currentRadiation.toFixed(1)} mSv</div><div style={{ height: 3, background: 'var(--br)', borderRadius: 2, marginTop: 3, width: 50 }}><div style={{ width: `${radPct}%`, height: '100%', background: radPct > 80 ? '#ef4444' : 'var(--p)', borderRadius: 2 }} /></div></div> : <span style={{ fontSize: 11, color: 'var(--t-s)' }}>—</span>}</td>
                         <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--t-s)' }}>{t.startDate ? new Date(t.startDate).toLocaleDateString('es-ES') : 'N/A'}</td>
                         <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--t)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.isActive ? 'var(--p)' : 'var(--t-s)' }} />{t.isActive ? 'Activo' : 'Finalizado'}</span>{' '}{expanded === t.id ? <ChevronUp size={14} style={{ color: 'var(--t-s)', verticalAlign: 'middle' }} /> : <ChevronDown size={14} style={{ color: 'var(--t-s)', verticalAlign: 'middle' }} />}</td>
                       </tr>
                       {expanded === t.id && (
                         <tr key={`${t.id}-formula`}>
                           <td colSpan={8} style={{ padding: 0, background: 'var(--b)' }}>
                             <div style={{ padding: '16px 20px', borderTop: '1px solid var(--br)' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                 <FlaskConical size={14} style={{ color: 'var(--p)' }} />
                                 <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fórmula de Decaimiento — {t.isotopeName}</span>
                               </div>
                               {(t.effectiveHalfLife && t.physicalHalfLife && t.biologicalHalfLife) ? (
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                                   <div style={{ background: 'var(--sf)', borderRadius: 8, padding: 10, border: '1px solid var(--br)' }}><div style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Semivida Física (T<sub>f</sub>)</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>{t.physicalHalfLife} {t.halfLifeUnit || 'días'}</div></div>
                                   <div style={{ background: 'var(--sf)', borderRadius: 8, padding: 10, border: '1px solid var(--br)' }}><div style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Semivida Biológica (T<sub>b</sub>)</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>{t.biologicalHalfLife} {t.halfLifeUnit || 'días'}</div></div>
                                   <div style={{ background: 'var(--sf)', borderRadius: 8, padding: 10, border: '1px solid var(--br)' }}><div style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Semivida Efectiva (T<sub>e</sub>)</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--p)' }}>{t.effectiveHalfLife!.toFixed(4)} {t.halfLifeUnit || 'días'}</div></div>
                                   <div style={{ background: 'var(--sf)', borderRadius: 8, padding: 10, border: '1px solid var(--br)' }}><div style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Fórmula</div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t)', lineHeight: 1.5 }}>1/T<sub>e</sub> = 1/{t.physicalHalfLife} + 1/{t.biologicalHalfLife}<br/>T<sub>e</sub> = {t.effectiveHalfLife!.toFixed(4)}<br/>t = ln(1/{t.initialDose}) / ln(0.5) × T<sub>e</sub></div></div>
                                 </div>
                               ) : (
                                 <div style={{ fontSize: 11, color: 'var(--t-s)' }}>Datos de semivida no disponibles para este isótopo. Los cálculos se basan en la fórmula simplificada: días = semivida × 10.</div>
                               )}
                               {t.calculationSteps && t.calculationSteps.length > 0 && (
                                 <div style={{ marginTop: 10, background: 'var(--sf)', borderRadius: 8, padding: 12, border: '1px solid var(--br)' }}>
                                   <div style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase', marginBottom: 6 }}>Pasos del Cálculo</div>
                                   {t.calculationSteps.map((step: string, i: number) => (
                                     <div key={i} style={{ fontSize: 11, color: 'var(--t)', lineHeight: 1.6, fontFamily: 'monospace' }}>{step}</div>
                                   ))}
                                 </div>
                               )}
                             </div>
                           </td>
                         </tr>
                       )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <span style={{ fontSize: 12, color: 'var(--t-s)' }}>Mostrando {filteredTreatments.length} tratamientos</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t-s)' }}><ChevronLeft size={14} /></button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--t)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'var(--b)', fontSize: 12, fontWeight: 600 }}>1</button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t-s)' }}><ChevronRight size={14} /></button>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .rx-table { display: none !important; }
          .rx-cards { display: flex !important; flex-direction: column; }
        }
        @media (min-width: 861px) {
          .rx-cards { display: none !important; }
          .rx-table { display: block; overflow-x: auto; }
        }
      `}</style>
    </div>
  );
}
