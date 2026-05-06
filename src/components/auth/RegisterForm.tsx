'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080/v2'
  : 'https://api.raddix.pro/v1';

interface Props {
  creatorRole?: string;
  creatorToken?: string | number;
}

export default function RegisterForm({ creatorRole }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = creatorRole === 'Admin';
  const isDoctor = creatorRole === 'Doctor';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone: isDoctor ? phone : undefined,
          address: isDoctor ? address : undefined,
          role: isDoctor ? 'Patient' : 'Doctor',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el registro');
      }

      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{
        padding: 40,
        background: '#ffffff',
        borderRadius: 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          margin: '0 auto 16px',
          background: '#d1fae5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
        }}>
          <CheckCircle size={28} strokeWidth={2} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px', fontFamily: "'Inter', sans-serif" }}>
          ¡Cuenta Creada!
        </h2>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, fontFamily: "'Inter', sans-serif" }}>
          Redirigiendo al dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: 32,
      background: '#ffffff',
      borderRadius: 24,
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
    }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px', fontFamily: "'Inter', sans-serif" }}>
          Nuevo {isAdmin ? 'Médico' : isDoctor ? 'Paciente' : 'Usuario'}
        </h2>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, fontFamily: "'Inter', sans-serif" }}>
          Complete los datos para añadir al sistema
        </p>
      </div>

      {error && (
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 20,
          fontFamily: "'Inter', sans-serif",
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nombre" value={firstName} onChange={setFirstName} placeholder="Ej: Juan" />
          <Field label="Apellido" value={lastName} onChange={setLastName} placeholder="Ej: Pérez" />
        </div>

        {/* Email */}
        <Field label="Correo" type="email" value={email} onChange={setEmail} />

        {/* Phone + Address for patient registration */}
        {isDoctor && (
          <>
            <Field label="Teléfono (Opcional)" value={phone} onChange={setPhone} />
            <Field label="Dirección (Opcional)" value={address} onChange={setAddress} />
          </>
        )}

        {/* Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 6,
            fontFamily: "'Inter', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Contraseña temporal
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 48px 12px 14px',
                fontSize: 13,
                color: '#111827',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                transition: 'all 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6b32e8';
                e.target.style.boxShadow = '0 0 0 3px rgba(107,50,232,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px',
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            background: loading
              ? 'linear-gradient(135deg, #9b87d4 0%, #7c5cb8 100%)'
              : 'linear-gradient(135deg, #6b32e8 0%, #4a1aa8 100%)',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? 'none' : '0 4px 16px rgba(107,50,232,0.3)',
            transition: 'all 0.2s',
            marginTop: 4,
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
              Registrando...
            </>
          ) : 'Registrar'}
        </button>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 6,
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: 13,
          color: '#111827',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          outline: 'none',
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          transition: 'all 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6b32e8';
          e.target.style.boxShadow = '0 0 0 3px rgba(107,50,232,0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}