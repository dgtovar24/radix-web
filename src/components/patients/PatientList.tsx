'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Phone, MapPin, Calendar, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { patients, type Patient } from '../../services/api';

export default function PatientList() {
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patients.getAll();
      setPatientList(data);
    } catch (err) {
      console.error('Error loading patients', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patientList.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.familyAccessCode && p.familyAccessCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.35s ease-out' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
            placeholder="Buscar paciente..."
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

        <button 
          onClick={() => window.location.href = '/pacientes/nuevo'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#ffffff',
            background: 'var(--p)',
            border: 'none',
            borderRadius: 24,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} />
          Nuevo Paciente
        </button>
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
            Cargando pacientes...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Nombre', 'Contacto', 'Dirección', 'Estado', 'Registro', 'Acciones'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--t-s)',
                    textAlign: i === 5 ? 'right' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, idx) => (
                <tr 
                  key={patient.id} 
                  onClick={() => window.location.href = `/pacientes/${patient.id}`}
                  style={{ 
                    borderBottom: idx < filteredPatients.length - 1 ? '1px solid var(--br)' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--b)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td data-label="Nombre" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--p)',
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 600, opacity: 0.9,
                      }}>
                        {patient.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>
                          {patient.fullName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>
                          {patient.familyAccessCode ? `Code: ${patient.familyAccessCode}` : `#${patient.id}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contacto" style={{ padding: '20px 24px' }}>
                    {patient.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                        <Phone size={14} style={{ color: 'var(--t-s)' }} />
                        {patient.phone}
                      </div>
                    ) : <span style={{ color: 'var(--t-s)' }}>—</span>}
                  </td>
                  <td data-label="Dirección" style={{ padding: '20px 24px' }}>
                    {patient.address ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t-s)' }}>
                        <MapPin size={14} style={{ color: 'var(--t-s)' }} />
                        {patient.address.length > 25 ? patient.address.slice(0, 25) + '...' : patient.address}
                      </div>
                    ) : <span style={{ color: 'var(--t-s)' }}>—</span>}
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
                        background: patient.isActive ? 'var(--p)' : 'var(--t-s)'
                      }}></div>
                      {patient.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Registro" style={{ padding: '20px 24px', fontSize: 13, color: 'var(--t-s)' }}>
                    {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('es-ES') : 'N/A'}
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
          Mostrando {filteredPatients.length} pacientes
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
