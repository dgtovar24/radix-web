'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, Calendar, MoreVertical, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { treatments, type Treatment } from '../../services/api';

export default function TreatmentList() {
  const [treatmentList, setTreatmentList] = useState<Treatment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatments();
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.35s ease-out' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--b)',
          border: '1px solid var(--br)',
          borderRadius: 99,
          padding: '8px 16px',
          width: 'min(100%, 320px)',
        }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Buscar tratamiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              fontSize: 13,
              color: 'var(--t)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table List */}
      <div className="responsive-table-card" style={{
        background: 'var(--sf)',
        borderRadius: 20,
        border: '1px solid var(--br)',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
            Cargando tratamientos...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Paciente', 'Isótopo', 'Dosis Inicial', 'Confinamiento', 'Inicio', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--t-s)',
                    textAlign: i === 6 ? 'right' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 64, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
                    No se encontraron tratamientos.
                  </td>
                </tr>
              ) : filteredTreatments.map((treatment, idx) => (
                <tr key={treatment.id} style={{ borderBottom: idx < filteredTreatments.length - 1 ? '1px solid var(--br)' : 'none' }}>
                  <td data-label="Paciente" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '12px', background: 'transparent',
                        border: '1px solid var(--br)',
                        color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>
                          {treatment.patientName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>
                          Sala {treatment.room}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Isótopo" style={{ padding: '20px 24px' }}>
                    <span style={{
                      display: 'inline-flex', padding: '4px 10px', borderRadius: 8,
                      background: 'transparent', border: '1px solid var(--p)', color: 'var(--p)',
                      fontSize: 12, fontWeight: 600
                    }}>
                      {treatment.isotopeName}
                    </span>
                  </td>
                  <td data-label="Dosis Inicial" style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--t)' }}>
                      {treatment.initialDose.toFixed(2)} mCi
                    </span>
                  </td>
                  <td data-label="Confinamiento" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--s)' }}>
                      <Clock size={14} />
                      <span style={{ fontWeight: 600 }}>{treatment.isolationDays}</span> días
                    </div>
                  </td>
                  <td data-label="Inicio" style={{ padding: '20px 24px', fontSize: 13, color: 'var(--t-s)' }}>
                    {treatment.startDate ? new Date(treatment.startDate).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td data-label="Estado" style={{ padding: '20px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--t)',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: treatment.isActive ? 'var(--p)' : 'var(--t-s)'
                      }}></div>
                      {treatment.isActive ? 'Activo' : 'Finalizado'}
                    </span>
                  </td>
                  <td data-label="Acciones" style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--t-s)',
                    }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <span style={{ fontSize: 13, color: 'var(--t-s)' }}>
          Mostrando {filteredTreatments.length} tratamientos
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--t-s)'
          }}>
            <ChevronLeft size={16} />
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, background: 'var(--t)', border: 'none', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--b)', fontSize: 13, fontWeight: 600
          }}>
            1
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--t-s)'
          }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 1180px) {
          .responsive-table-card { overflow: visible !important; background: transparent !important; border: none !important; }
          .responsive-table-card table, .responsive-table-card tbody, .responsive-table-card tr, .responsive-table-card td { display: block; width: 100%; }
          .responsive-table-card thead { display: none; }
          .responsive-table-card tbody { display: grid; gap: 12px; }
          .responsive-table-card tr {
            border: 1px solid var(--br) !important;
            border-radius: 18px;
            background: var(--sf);
            padding: 14px;
          }
          .responsive-table-card td {
            padding: 8px 4px !important;
            text-align: left !important;
            border: none !important;
          }
          .responsive-table-card td:not(:first-child) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }
          .responsive-table-card td:not(:first-child)::before {
            content: attr(data-label);
            font-size: 11px;
            font-weight: 800;
            color: var(--t-s);
            text-transform: uppercase;
          }
        }
      `}</style>
    </div>
  );
}
