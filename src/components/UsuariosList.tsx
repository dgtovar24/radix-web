'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Mail, User, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/v2/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const doctorCount = usuarios.filter(u => u.role.toLowerCase() === 'doctor').length;
  const patientCount = usuarios.filter(u => u.role.toLowerCase() === 'patient').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.35s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--t)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Usuarios del Sistema
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t-s)', margin: 0 }}>Gestiona todos los usuarios registrados.</p>
        </div>
      </div>

      {/* Stats KPI Row (Logip Style) */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--b)',
            border: '1px solid var(--br)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--p)',
          }}>
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--t-s)' }}>
              Doctores
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {doctorCount}
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 40, background: 'var(--br)' }}></div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--b)',
            border: '1px solid var(--br)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--s)',
          }}>
            <User size={20} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--t-s)' }}>
              Pacientes
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {patientCount}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--b)',
          border: '1px solid var(--br)',
          borderRadius: 99,
          padding: '8px 16px',
          width: 320,
        }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Buscar usuario..."
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
          onClick={() => window.location.href = '/usuarios/nuevo'}
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
          Nuevo Usuario
        </button>
      </div>

      {/* Table List */}
      <div style={{
        background: 'var(--sf)',
        borderRadius: 20,
        border: '1px solid var(--br)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
            Cargando usuarios...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Usuario', 'Rol', 'Email', 'Fecha Registro', 'Acciones'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--t-s)',
                    textAlign: i === 4 ? 'right' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((user, idx) => {
                const isDoctor = user.role.toLowerCase() === 'doctor';
                const isAdmin = user.role.toLowerCase() === 'admin';

                return (
                  <tr key={user.id} style={{ borderBottom: idx < filteredUsuarios.length - 1 ? '1px solid var(--br)' : 'none' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: isDoctor ? 'var(--p)' : isAdmin ? 'var(--t)' : 'var(--s)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 600,
                          flexShrink: 0,
                          opacity: 0.9,
                        }}>
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>
                            #{user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: 'var(--t)',
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: isDoctor ? 'var(--p)' : isAdmin ? 'var(--t)' : 'var(--s)'
                        }}></div>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                        <Mail size={14} style={{ color: 'var(--t-s)' }} />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: 13, color: 'var(--t-s)' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <span style={{ fontSize: 13, color: 'var(--t-s)' }}>
          Mostrando {filteredUsuarios.length} usuarios
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