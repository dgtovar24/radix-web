'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  Mail,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
  department?: string;
  assignedPatients?: number;
  activeTreatments?: number;
  resolvedAlerts?: number;
}

const departmentOptions = ['Todos', 'Medicina nuclear', 'Oncología', 'Radiofísica', 'Endocrinología', 'Sin departamento'];
const roleOptions = ['Todos', 'DESARROLLADOR', 'ADMIN', 'FACULTATIVO'];

const mockUsers: UserItem[] = [
  { id: 1, firstName: 'Admin', lastName: 'Radix', email: 'admin@radix.local', role: 'ADMIN', department: 'Medicina nuclear', assignedPatients: 9, activeTreatments: 5, resolvedAlerts: 18, createdAt: '2026-04-01' },
  { id: 2, firstName: 'Elena', lastName: 'Ruiz', email: 'elena.ruiz@radix.com', role: 'FACULTATIVO', department: 'Medicina nuclear', assignedPatients: 7, activeTreatments: 4, resolvedAlerts: 14, createdAt: '2026-04-04' },
  { id: 3, firstName: 'Marc', lastName: 'Vidal', email: 'marc.vidal@radix.com', role: 'FACULTATIVO', department: 'Radiofísica', assignedPatients: 4, activeTreatments: 3, resolvedAlerts: 9, createdAt: '2026-04-06' },
  { id: 4, firstName: 'Inés', lastName: 'Ferrer', email: 'ines.ferrer@radix.com', role: 'FACULTATIVO', department: 'Oncología', assignedPatients: 6, activeTreatments: 2, resolvedAlerts: 11, createdAt: '2026-04-09' },
  { id: 5, firstName: 'Dev', lastName: 'Radix', email: 'dev@radix.local', role: 'DESARROLLADOR', department: 'Sin departamento', assignedPatients: 0, activeTreatments: 0, resolvedAlerts: 0, createdAt: '2026-04-10' },
];

function normalizeRole(role: string) {
  const value = role.toLowerCase();
  if (value === 'admin') return 'ADMIN';
  if (value === 'desarrollador' || value === 'developer') return 'DESARROLLADOR';
  if (value === 'doctor' || value === 'doctora' || value === 'facultativo') return 'FACULTATIVO';
  return role.toUpperCase();
}

export default function UsuariosList({ currentUserRole = 'FACULTATIVO' }: { currentUserRole?: string }) {
  const [usuarios, setUsuarios] = useState<UserItem[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [newDepartment, setNewDepartment] = useState('');
  const [departments, setDepartments] = useState(departmentOptions);
  const [loading, setLoading] = useState(true);
  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const canSeeAdminMetrics = normalizedCurrentRole === 'ADMIN' || normalizedCurrentRole === 'DESARROLLADOR';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/v2/api/users');
      if (response.ok) {
        const data = await response.json();
        const enriched = (Array.isArray(data) ? data : []).map((user: UserItem, index: number) => ({
          ...user,
          role: normalizeRole(user.role),
          department: user.department || departmentOptions[(index % 4) + 1],
          assignedPatients: user.assignedPatients ?? ((index + 2) % 8),
          activeTreatments: user.activeTreatments ?? ((index + 1) % 5),
          resolvedAlerts: user.resolvedAlerts ?? ((index + 4) * 2),
        }));
        setUsuarios(enriched.length ? enriched : mockUsers);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
      setUsuarios(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = useMemo(() => usuarios.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || normalizeRole(user.role) === roleFilter;
    const matchesDepartment = departmentFilter === 'Todos' || (user.department || 'Sin departamento') === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  }), [usuarios, search, roleFilter, departmentFilter]);

  const facultativos = usuarios.filter(user => ['ADMIN', 'FACULTATIVO'].includes(normalizeRole(user.role)));
  const departmentCount = new Set(facultativos.map(user => user.department || 'Sin departamento')).size;
  const assignedPatients = facultativos.reduce((sum, user) => sum + (user.assignedPatients || 0), 0);

  const createDepartment = () => {
    const clean = newDepartment.trim();
    if (!clean || departments.includes(clean)) return;
    setDepartments((current) => [...current.filter(item => item !== 'Todos'), clean, 'Todos'].sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b)));
    setDepartmentFilter(clean);
    setNewDepartment('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'fadeIn 0.35s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Usuarios y facultativos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t-s)', margin: 0 }}>
            Gestiona roles, departamentos, facultativos y asignación clínica desde una sola vista.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/usuarios/nuevo'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 18px',
            fontSize: 13,
            fontWeight: 800,
            color: '#ffffff',
            background: 'var(--p)',
            border: 'none',
            borderRadius: 16,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <MetricCard icon={ShieldCheck} label="Roles activos" value="3" detail="Desarrollador, admin, facultativo" />
        <MetricCard icon={Stethoscope} label="Facultativos" value={facultativos.length} detail="Incluye administradores clínicos" />
        <MetricCard icon={Building2} label="Departamentos" value={departmentCount} detail="Opcional por facultativo" />
        <MetricCard icon={Users} label="Pacientes asignados" value={assignedPatients} detail="Suma de facultativos visibles" />
      </div>

      {canSeeAdminMetrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          padding: 16,
          borderRadius: 22,
          border: '1px solid var(--br)',
          background: 'var(--sf)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--t)', fontWeight: 900, fontSize: 14 }}>
              <BarChart3 size={17} />
              Rendimiento por facultativo
            </div>
            <p style={{ margin: 0, color: 'var(--t-s)', fontSize: 12, lineHeight: 1.45 }}>
              Visible solo para admin o desarrollador. Estos datos preparan el contrato de métricas por médico.
            </p>
          </div>
          {facultativos.slice(0, 3).map(user => {
            const total = Math.max(1, (user.assignedPatients || 0) + (user.activeTreatments || 0) + (user.resolvedAlerts || 0));
            return (
              <div key={user.id} style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, fontWeight: 900, color: 'var(--t)' }}>
                  <span>{user.firstName} {user.lastName}</span>
                  <span>{total} pts</span>
                </div>
                <div style={{ height: 9, borderRadius: 999, background: 'var(--b)', overflow: 'hidden', border: '1px solid var(--br)' }}>
                  <div style={{ width: `${Math.min(100, total * 4)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--p), #0ea5e9)' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--t-s)' }}>
                  <span>{user.assignedPatients} pacientes</span>
                  <span>{user.activeTreatments} tratamientos</span>
                  <span>{user.resolvedAlerts} alertas</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) 170px 210px minmax(220px, 0.8fr)',
        gap: 10,
        alignItems: 'center',
      }}>
        <div style={filterShellStyle}>
          <Search size={16} style={{ color: 'var(--t-s)', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13, color: 'var(--t)', background: 'transparent', border: 'none', outline: 'none', minWidth: 0 }}
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
          {roleOptions.map(role => <option key={role} value={role}>{role === 'Todos' ? 'Todos los roles' : role}</option>)}
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={selectStyle}>
          {departments.map(dep => <option key={dep} value={dep}>{dep === 'Todos' ? 'Todos los departamentos' : dep}</option>)}
        </select>
        {canSeeAdminMetrics && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Crear departamento"
              style={{ ...selectStyle, flex: 1, minWidth: 0 }}
            />
            <button type="button" onClick={createDepartment} style={{ ...smallButtonStyle, width: 42 }} aria-label="Crear departamento">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--sf)',
        borderRadius: 20,
        border: '1px solid var(--br)',
        overflow: 'auto',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando usuarios...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--br)' }}>
                {['Usuario', 'Rol', 'Departamento', 'Pacientes', 'Actividad', 'Email', 'Acciones'].map((header, index) => (
                  <th key={header} style={{ padding: '16px 18px', fontSize: 12, fontWeight: 800, color: 'var(--t-s)', textAlign: index === 6 ? 'right' : 'left' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((user, index) => {
                const role = normalizeRole(user.role);
                const isAdmin = role === 'ADMIN';
                const isDeveloper = role === 'DESARROLLADOR';
                return (
                  <tr key={user.id} style={{ borderBottom: index < filteredUsuarios.length - 1 ? '1px solid var(--br)' : 'none' }}>
                    <td style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          background: isDeveloper ? '#111827' : isAdmin ? 'var(--p)' : '#0ea5e9',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 900,
                          flexShrink: 0,
                        }}>
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t)' }}>{user.firstName} {user.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 2 }}>#{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px' }}><RolePill role={role} /></td>
                    <td style={{ padding: '18px', fontSize: 13, color: 'var(--t)' }}>{user.department || 'Sin departamento'}</td>
                    <td style={{ padding: '18px', fontSize: 13, color: 'var(--t)' }}>{user.assignedPatients || 0}</td>
                    <td style={{ padding: '18px' }}>
                      {canSeeAdminMetrics ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--t-s)', fontSize: 12 }}>
                          <Activity size={14} />
                          {user.activeTreatments || 0} tratamientos, {user.resolvedAlerts || 0} alertas
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--t-s)' }}>Solo admin</span>
                      )}
                    </td>
                    <td style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                        <Mail size={14} style={{ color: 'var(--t-s)' }} />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '18px', textAlign: 'right' }}>
                      <button style={{ width: 36, height: 36, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t-s)' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--t-s)' }}>Mostrando {filteredUsuarios.length} usuarios</span>
        <span style={{ fontSize: 12, color: 'var(--t-s)' }}>Los departamentos se guardarán vía API cuando exista el endpoint.</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: number | string; detail: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 18, padding: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--b)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--t-s)', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--t-s)', marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  const color = role === 'DESARROLLADOR' ? '#111827' : role === 'ADMIN' ? 'var(--p)' : '#0ea5e9';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '7px 10px',
      borderRadius: 999,
      background: 'color-mix(in srgb, var(--b, #f8fafc) 80%, white)',
      border: '1px solid var(--br)',
      color: 'var(--t)',
      fontSize: 12,
      fontWeight: 900,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {role}
    </span>
  );
}

const filterShellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'var(--sf)',
  border: '1px solid var(--br)',
  borderRadius: 16,
  padding: '10px 14px',
  minWidth: 0,
};

const selectStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 14,
  border: '1px solid var(--br)',
  background: 'var(--sf)',
  color: 'var(--t)',
  padding: '0 12px',
  fontSize: 12,
  fontWeight: 800,
  outline: 'none',
};

const smallButtonStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 14,
  border: 'none',
  background: 'var(--p)',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};
