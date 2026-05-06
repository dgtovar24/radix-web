'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, ChevronLeft, ChevronRight, FlaskConical, X } from 'lucide-react';
import { treatments, type Treatment } from '../../services/api';

function calcRemaining(startDate: string, isolationDays: number) {
  const start = new Date(startDate).getTime();
  const end = start + isolationDays * 86400000;
  const remaining = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  return remaining;
}

function TreatmentDetailsModal({
  treatment,
  remaining,
  onClose,
}: {
  treatment: Treatment;
  remaining: number;
  onClose: () => void;
}) {
  const radPct = treatment.currentRadiation
    ? Math.min(100, (treatment.currentRadiation / treatment.safetyThreshold) * 100)
    : 0;
  const hasHalfLifeData = Boolean(
    treatment.effectiveHalfLife &&
    treatment.physicalHalfLife &&
    treatment.biologicalHalfLife
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles del tratamiento de ${treatment.patientName}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 260,
        background: 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(100%, 760px)',
          maxHeight: 'min(88dvh, 760px)',
          overflowY: 'auto',
          borderRadius: 24,
          background: 'var(--sf, #ffffff)',
          border: '1px solid var(--br, #e5e7eb)',
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.24)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          padding: '22px 22px 16px',
          background: 'color-mix(in srgb, var(--sf, #ffffff) 94%, transparent)',
          borderBottom: '1px solid var(--br, #e5e7eb)',
          backdropFilter: 'blur(12px)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: 'var(--b, #f8fafc)',
                border: '1px solid var(--br, #e5e7eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--p, #7c3aed)',
              }}>
                <Activity size={19} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: 'var(--t, #111827)', fontSize: 22, lineHeight: 1.1, fontWeight: 900 }}>
                  {treatment.patientName}
                </h2>
                <div style={{ color: 'var(--t-s, #6b7280)', fontSize: 12, fontWeight: 700 }}>
                  Sala {treatment.room} · {treatment.isActive ? 'Tratamiento activo' : 'Tratamiento finalizado'}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid var(--br, #e5e7eb)',
              background: 'var(--b, #f8fafc)',
              color: 'var(--t, #111827)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: 22, display: 'grid', gap: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {[
              ['Isótopo', treatment.isotopeName],
              ['Dosis inicial', `${treatment.initialDose.toFixed(1)} mCi`],
              ['Confinamiento', `${treatment.isolationDays} días`],
              ['Restante', `${remaining} días`],
              ['Inicio', treatment.startDate ? new Date(treatment.startDate).toLocaleDateString('es-ES') : 'N/A'],
              ['Estado', treatment.isActive ? 'Activo' : 'Finalizado'],
            ].map(([label, value]) => (
              <div key={label} style={{
                borderRadius: 16,
                border: '1px solid var(--br, #e5e7eb)',
                background: 'var(--b, #f8fafc)',
                padding: 14,
                minWidth: 0,
              }}>
                <div style={{ color: 'var(--t-s, #6b7280)', fontSize: 10, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {label}
                </div>
                <div style={{ marginTop: 5, color: 'var(--t, #111827)', fontSize: 14, fontWeight: 850, overflowWrap: 'anywhere' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderRadius: 18,
            border: '1px solid var(--br, #e5e7eb)',
            background: 'var(--b, #f8fafc)',
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
              <span style={{ color: 'var(--t-s, #6b7280)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>Radiación actual</span>
              <span style={{ color: radPct > 80 ? '#ef4444' : 'var(--p, #7c3aed)', fontSize: 16, fontWeight: 900 }}>
                {treatment.currentRadiation ? `${treatment.currentRadiation.toFixed(2)} mSv` : 'Sin lectura'}
              </span>
            </div>
            <div style={{ height: 7, background: 'var(--br, #e5e7eb)', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${radPct}%`, height: '100%', background: radPct > 80 ? '#ef4444' : 'var(--p, #7c3aed)', borderRadius: 999 }} />
            </div>
          </div>

          <div style={{
            borderRadius: 18,
            border: '1px solid var(--br, #e5e7eb)',
            background: 'var(--sf, #ffffff)',
            padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FlaskConical size={16} style={{ color: 'var(--p, #7c3aed)' }} />
              <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--t, #111827)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fórmula de decaimiento
              </span>
            </div>
            {hasHalfLifeData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                <FormulaMetric label="Semivida física" value={`${treatment.physicalHalfLife} ${treatment.halfLifeUnit || 'días'}`} />
                <FormulaMetric label="Semivida biológica" value={`${treatment.biologicalHalfLife} ${treatment.halfLifeUnit || 'días'}`} />
                <FormulaMetric label="Semivida efectiva" value={`${treatment.effectiveHalfLife!.toFixed(4)} ${treatment.halfLifeUnit || 'días'}`} accent />
                <div style={{
                  gridColumn: '1 / -1',
                  borderRadius: 12,
                  border: '1px solid var(--br, #e5e7eb)',
                  background: 'var(--b, #f8fafc)',
                  padding: 12,
                  color: 'var(--t, #111827)',
                  fontSize: 12,
                  lineHeight: 1.55,
                  fontWeight: 700,
                }}>
                  1/T<sub>e</sub> = 1/{treatment.physicalHalfLife} + 1/{treatment.biologicalHalfLife}<br />
                  T<sub>e</sub> = {treatment.effectiveHalfLife!.toFixed(4)}<br />
                  t = ln(1/{treatment.initialDose}) / ln(0.5) x T<sub>e</sub>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--t-s, #6b7280)', fontSize: 12, lineHeight: 1.5 }}>
                Datos de semivida no disponibles para este isótopo. Los cálculos usan la fórmula simplificada.
              </div>
            )}
            {treatment.calculationSteps && treatment.calculationSteps.length > 0 && (
              <div style={{ marginTop: 12, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)', background: 'var(--b, #f8fafc)', padding: 12 }}>
                <div style={{ color: 'var(--t-s, #6b7280)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>Pasos del cálculo</div>
                {treatment.calculationSteps.map((step: string, index: number) => (
                  <div key={index} style={{ color: 'var(--t, #111827)', fontSize: 11, lineHeight: 1.55, fontFamily: 'monospace' }}>{step}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormulaMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid var(--br, #e5e7eb)',
      background: 'var(--b, #f8fafc)',
      padding: 12,
    }}>
      <div style={{ color: 'var(--t-s, #6b7280)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 5, color: accent ? 'var(--p, #7c3aed)' : 'var(--t, #111827)', fontSize: 14, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

export default function TreatmentList() {
  const [treatmentList, setTreatmentList] = useState<Treatment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

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

      <div className="rx-table-wrap" style={{
        background: 'transparent', borderRadius: 20, border: 'none', overflow: 'visible',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando tratamientos...</div>
        ) : filteredTreatments.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>No se encontraron tratamientos.</div>
        ) : (
          <>
            <div className="rx-cards" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 12,
            }}>
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
                      <div><span style={{ fontSize: 10, color: 'var(--t-s)', textTransform: 'uppercase' }}>Isótopo</span><div style={{ fontSize: 11, lineHeight: 1.25, fontWeight: 700, color: 'var(--t)', overflowWrap: 'anywhere' }}>{t.isotopeName}</div></div>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--t-s)', marginTop: 'auto' }}>
                      <span>Inicio: {t.startDate ? new Date(t.startDate).toLocaleDateString('es-ES') : 'N/A'}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTreatment(t)}
                        style={{
                          border: '1px solid var(--br, #e5e7eb)',
                          background: 'var(--b, #f8fafc)',
                          color: 'var(--t, #111827)',
                          borderRadius: 999,
                          padding: '7px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wide table kept as a non-rendered fallback while the UI uses responsive cards. */}
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
                       <tr key={t.id} onClick={() => setSelectedTreatment(t)}
                         style={{ borderBottom: idx < filteredTreatments.length - 1 ? '1px solid var(--br)' : 'none', cursor: 'pointer' }}>
                         <td style={{ padding: '14px 16px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                             <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: 0 }}>
                               <Activity size={15} />
                             </div>
                             <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{t.patientName}</div><div style={{ fontSize: 10, color: 'var(--t-s)' }}>Sala {t.room}</div></div>
                           </div>
                         </td>
                         <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', padding: '3px 7px', borderRadius: 6, background: 'var(--b)', border: '1px solid var(--p)', color: 'var(--p)', fontSize: 10, lineHeight: 1.2, fontWeight: 700, maxWidth: 90, overflowWrap: 'anywhere' }}>{t.isotopeName}</span></td>
                         <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{t.initialDose.toFixed(1)}</td>
                         <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--s)' }}>{t.isolationDays}d</td>
                         <td style={{ padding: '14px 16px' }}><span style={{ fontSize: 13, fontWeight: 700, color: remaining <= 3 ? '#ef4444' : 'var(--p)' }}>{remaining}d</span></td>
                         <td style={{ padding: '14px 16px' }}>{t.currentRadiation ? <div><div style={{ fontSize: 11, fontWeight: 600, color: radPct > 80 ? '#ef4444' : 'var(--t)' }}>{t.currentRadiation.toFixed(1)} mSv</div><div style={{ height: 3, background: 'var(--br)', borderRadius: 2, marginTop: 3, width: 50 }}><div style={{ width: `${radPct}%`, height: '100%', background: radPct > 80 ? '#ef4444' : 'var(--p)', borderRadius: 2 }} /></div></div> : <span style={{ fontSize: 11, color: 'var(--t-s)' }}>—</span>}</td>
                         <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--t-s)' }}>{t.startDate ? new Date(t.startDate).toLocaleDateString('es-ES') : 'N/A'}</td>
                         <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--t)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.isActive ? 'var(--p)' : 'var(--t-s)' }} />{t.isActive ? 'Activo' : 'Finalizado'}</span></td>
                       </tr>
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

      {selectedTreatment && (
        <TreatmentDetailsModal
          treatment={selectedTreatment}
          remaining={calcRemaining(selectedTreatment.startDate, selectedTreatment.isolationDays)}
          onClose={() => setSelectedTreatment(null)}
        />
      )}

      <style>{`
        .rx-table {
          display: none !important;
        }
        @media (max-width: 760px) {
          .rx-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
