'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Mail, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function FacultativosList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultativos();
  }, []);

  const fetchFacultativos = async () => {
    try {
      const response = await fetch('http://localhost:8080/v2/api/users/role/Doctor');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (e) {
      console.error('Failed to fetch facultativos', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.35s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--t)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Facultativos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t-s)', margin: 0 }}>Gestiona el equipo médico y especialistas.</p>
        </div>
        <a href="/register" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: 'var(--p)',
          color: '#ffffff',
          borderRadius: 24,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          <Plus size={16} strokeWidth={2.5} />
          Nuevo Facultativo
        </a>
      </div>

      {/* Search Bar / Toolbar */}
      <div style={{
        display: 'flex',
        gap: 12,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--b)',
          border: '1px solid var(--br)',
          borderRadius: 99,
          padding: '8px 16px',
          flex: 1,
        }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Buscar facultativo..."
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
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          fontSize: 13, fontWeight: 600, color: 'var(--t)', background: 'var(--b)',
          border: '1px solid var(--br)', borderRadius: 24, cursor: 'pointer',
        }}>
          <Filter size={16} /> Filtros
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          fontSize: 13, fontWeight: 600, color: 'var(--t)', background: 'var(--b)',
          border: '1px solid var(--br)', borderRadius: 24, cursor: 'pointer',
        }}>
          <Download size={16} /> Exportar
        </button>
      </div>

      {/* Table Card */}
      <div style={{
        background: 'var(--sf)',
        borderRadius: 20,
        border: '1px solid var(--br)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
            Cargando facultativos...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Nombre', 'Email', 'Fecha de registro', 'Acciones'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--t-s)',
                    textAlign: i === 3 ? 'right' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 64, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
                    No se encontraron facultativos.
                  </td>
                </tr>
              ) : filteredDoctors.map((doctor, idx) => (
                <tr key={doctor.id} style={{ borderBottom: idx < filteredDoctors.length - 1 ? '1px solid var(--br)' : 'none' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--p)',
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 600, opacity: 0.9,
                      }}>
                        {doctor.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>
                          {doctor.firstName} {doctor.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>
                          #{doctor.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                      <Mail size={14} style={{ color: 'var(--t-s)' }} />
                      {doctor.email}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: 13, color: 'var(--t-s)' }}>
                    {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, background: 'transparent', border: 'none',
                      cursor: 'pointer', color: 'var(--t-s)',
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
          Mostrando {filteredDoctors.length} facultativos
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
            width: 36, height: 36, background: 'transparent', border: 'none', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--t-s)', fontSize: 13
          }}>
            2
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
    </div>
  );
}