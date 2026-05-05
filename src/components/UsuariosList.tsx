'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Mail, User as UserIcon, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { users, type User as ApiUser } from '../services/api';

export default function UsuariosList() {
  const [userList, setUserList] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.getAll().then(data => {
      setUserList(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load users', err);
      setLoading(false);
    });
  }, []);

  const filtered = userList.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const doctorCount = userList.filter(u => u.role?.toLowerCase() === 'doctor').length;
  const adminCount = userList.filter(u => u.role?.toLowerCase() === 'admin').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn 0.35s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--t)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Usuarios del Sistema</h1>
          <p style={{ fontSize: 13, color: 'var(--t-s)', margin: 0 }}>Gestiona todos los usuarios registrados.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)' }}>
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--t-s)' }}>Doctores</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)' }}>{doctorCount}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--br)' }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s)' }}>
            <UserIcon size={20} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--t-s)' }}>Admins</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)' }}>{adminCount}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 99, padding: '8px 16px', width: 'min(100%, 320px)' }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input type="text" placeholder="Buscar usuario..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13, color: 'var(--t)', background: 'transparent', border: 'none', outline: 'none' }} />
        </div>
      </div>

      <div className="responsive-table-card" style={{ background: 'var(--sf)', borderRadius: 20, border: '1px solid var(--br)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando usuarios...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Usuario', 'Rol', 'Email', 'Registro', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--t-s)', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isDoctor = u.role?.toLowerCase() === 'doctor';
                const isAdmin = u.role?.toLowerCase() === 'admin';
                return (
                  <tr key={u.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--br)' : 'none' }}>
                    <td data-label="Usuario" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDoctor ? 'var(--p)' : isAdmin ? 'var(--t)' : 'var(--s)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600 }}>
                          {u.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Rol" style={{ padding: '20px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDoctor ? 'var(--p)' : isAdmin ? 'var(--t)' : 'var(--s)' }} />
                        {u.role}
                      </span>
                    </td>
                    <td data-label="Email" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                        <Mail size={14} style={{ color: 'var(--t-s)' }} />
                        {u.email}
                      </div>
                    </td>
                    <td data-label="Registro" style={{ padding: '20px 24px', fontSize: 13, color: 'var(--t-s)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td data-label="Acciones" style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t-s)' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <span style={{ fontSize: 13, color: 'var(--t-s)' }}>Mostrando {filtered.length} usuarios</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t-s)' }}>
            <ChevronLeft size={16} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'var(--t)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'var(--b)', fontSize: 13, fontWeight: 600 }}>1</button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%', cursor: 'pointer', color: 'var(--t-s)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 1180px) {
          .responsive-table-card { overflow: visible !important; background: transparent !important; border: none !important; }
          .responsive-table-card table,
          .responsive-table-card tbody,
          .responsive-table-card tr,
          .responsive-table-card td { display: block; width: 100%; }
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
            box-sizing: border-box;
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
