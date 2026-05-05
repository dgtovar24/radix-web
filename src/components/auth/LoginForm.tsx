'use client';

import { useState } from 'react';
import { Activity, Lock, User, Shield, AlertCircle } from 'lucide-react';

const API_URL = 'https://api.raddix.pro/v1';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      const userData = data.user || data;
      document.cookie = `radix-user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=28800`;
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 24,
      padding: '40px 40px 36px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      maxWidth: 400,
      width: '100%',
      boxSizing: 'border-box',
      animation: 'fadeUp 0.4s ease-out both',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          margin: '0 auto 16px',
          background: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
        }}>
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 6px',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-0.02em',
        }}>
          Iniciar Sesión
        </h2>
        <p style={{
          fontSize: 13,
          color: '#6b7280',
          margin: 0,
          fontFamily: "'Inter', sans-serif",
        }}>
          Accede a tu panel de control
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 12,
          color: '#dc2626',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 20,
          fontFamily: "'Inter', sans-serif",
        }}>
          <AlertCircle size={15} strokeWidth={2.5} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 6,
            fontFamily: "'Inter', sans-serif",
          }}>
            Usuario o correo
          </label>
          <div style={{ position: 'relative' }}>
            <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Radix o usuario@dominio.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                fontSize: 13,
                color: '#111827',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px #dbeafe';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 6,
            fontFamily: "'Inter', sans-serif",
          }}>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 44px 12px 40px',
                fontSize: 13,
                color: '#111827',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px #dbeafe';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '13px',
            fontSize: 13,
            fontWeight: 600,
            color: '#ffffff',
            background: '#3b82f6',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s, transform 0.15s',
            marginTop: 4,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#3b82f6'; }}
        >
          {loading ? (
            <>
              <span style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
              <span>Verificando...</span>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      {/* Footer Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
          <Shield size={14} strokeWidth={2} />
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: "'Inter', sans-serif",
          }}>
            Conexión Segura
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
