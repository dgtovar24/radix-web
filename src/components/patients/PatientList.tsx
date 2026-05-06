'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, Phone, MapPin, Calendar, Activity, ChevronLeft, ChevronRight, MessageCircle, Pill, X } from 'lucide-react';
import { patients, type Patient } from '../../services/api';

export default function PatientList() {
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPatients();
    const click = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  const loadPatients = async () => {
    try { setLoading(true); const data = await patients.getAll(); setPatientList(data); }
    catch { console.error('Error loading patients'); }
    finally { setLoading(false); }
  };

  const filtered = patientList.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.familyAccessCode && p.familyAccessCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.35s ease-out', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 99, padding: '8px 16px', width: 'min(100%, 320px)' }}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input type="text" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13, color: 'var(--t)', background: 'transparent', border: 'none', outline: 'none' }} />
        </div>
        <button onClick={() => window.location.href = '/pacientes/nuevo'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--p)', border: 'none', borderRadius: 24, cursor: 'pointer' }}>
          <Plus size={16} /> Nuevo Paciente
        </button>
      </div>

      <div className="responsive-table-card" style={{ background: 'var(--sf)', borderRadius: 20, border: '1px solid var(--br)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando pacientes...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Nombre', 'Contacto', 'Dirección', 'Estado', 'Registro', 'Acciones'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t-s)', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} onClick={() => window.location.href = `/pacientes/${p.id}`}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--br)' : 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--b)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td data-label="Nombre" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{p.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--t-s)', marginTop: 1 }}>{p.familyAccessCode ? `Cód: ${p.familyAccessCode}` : `#${p.id}`}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contacto" style={{ padding: '16px 20px' }}>
                    {p.phone ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t)' }}><Phone size={12} style={{ color: 'var(--t-s)' }} />{p.phone}</div> : <span style={{ color: 'var(--t-s)', fontSize: 12 }}>—</span>}
                  </td>
                  <td data-label="Dirección" style={{ padding: '16px 20px' }}>
                    {p.address ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t-s)' }}><MapPin size={12} style={{ color: 'var(--t-s)' }} />{p.address.length > 20 ? p.address.slice(0, 20) + '...' : p.address}</div> : <span style={{ color: 'var(--t-s)', fontSize: 12 }}>—</span>}
                  </td>
                  <td data-label="Estado" style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--t)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.isActive ? 'var(--p)' : 'var(--t-s)' }} />
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Registro" style={{ padding: '16px 20px', fontSize: 11, color: 'var(--t-s)' }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td data-label="Acciones" style={{ padding: '16px 20px', textAlign: 'right', position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === p.id ? null : (p.id ?? null)); }}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t-s)', borderRadius: 8 }}>
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === p.id && (
                      <div ref={menuRef} style={{
                        position: 'absolute', right: 16, top: 40, zIndex: 50,
                        background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden',
                      }}>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(null); window.open(`tel:${p.phone}`, '_self'); }}
                          style={menuItemStyle}><Phone size={14} />Llamar</button>
                        <button onClick={(e) => { e.stopPropagation(); const msg = prompt('Mensaje para ' + p.fullName + ':'); if (msg && p.id) { fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fkPatientId: p.id, messageText: msg }) }).then(() => alert('Mensaje enviado')).catch(() => alert('Error al enviar')); } setOpenMenu(null); }}
                          style={menuItemStyle}><MessageCircle size={14} />Enviar mensaje</button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(null); window.location.href = `/pacientes/${p.id}`; }}
                          style={{ ...menuItemStyle, borderBottom: 'none' }}><Pill size={14} />Ver tratamiento</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <span style={{ fontSize: 12, color: 'var(--t-s)' }}>Mostrando {filtered.length} pacientes</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={pgBtn}><ChevronLeft size={14} /></button>
          <button style={{ ...pgBtn, background: 'var(--t)', color: 'var(--b)', border: 'none', fontWeight: 700 }}>1</button>
          <button style={pgBtn}><ChevronRight size={14} /></button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1400px) {
          .responsive-table-card { overflow: visible !important; background: transparent !important; border: none !important; }
          .responsive-table-card table, .responsive-table-card tbody, .responsive-table-card tr, .responsive-table-card td { display: block; width: 100%; }
          .responsive-table-card thead { display: none; }
          .responsive-table-card tbody { display: grid; gap: 12px; }
          .responsive-table-card tr { border: 1px solid var(--br) !important; border-radius: 18px; background: var(--sf); padding: 14px; }
          .responsive-table-card td { padding: 8px 4px !important; text-align: left !important; border: none !important; }
          .responsive-table-card td:not(:first-child) { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
          .responsive-table-card td:not(:first-child)::before { content: attr(data-label); font-size: 11px; font-weight: 800; color: var(--t-s); text-transform: uppercase; }
        }
      `}</style>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
  border: 'none', borderBottom: '1px solid var(--br)', background: 'var(--sf)',
  color: 'var(--t)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
  fontFamily: "'Inter', sans-serif",
};

const pgBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
  background: 'transparent', border: '1px solid var(--br)', borderRadius: '50%',
  cursor: 'pointer', color: 'var(--t-s)', fontSize: 12,
};
