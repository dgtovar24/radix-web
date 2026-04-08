import { useState, type FormEvent } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Credenciales inválidas');
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Error de conexión con el servidor móvil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-dark relative overflow-hidden rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl border border-white/10">
      {/* Top glowing accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-radix-400/50 to-transparent"></div>
      
      {/* Branding for mobile */}
      <div className="mb-10 text-center lg:hidden">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-radix-500/10 p-3 shadow-glow ring-1 ring-radix-500/20">
          <svg className="h-8 w-8 text-radix-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white">RADIX</h2>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white/90">Acceso Profesional</h2>
        <p className="mt-2 text-sm text-white/40 font-medium">Ingrese sus credenciales seguras para continuar</p>
      </div>

      {error && (
        <div className="animate-fade-in mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-200 backdrop-blur-md">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-left">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/30 ml-1">
            Identificador o Correo
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-radix-400">
              <svg className="h-5 w-5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
            </div>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. Badix o adm@radix.pro"
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-12 py-4 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-radix-500/10"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-white/30 ml-1">
            Código de Seguridad
          </label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-radix-400">
              <svg className="h-5 w-5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-12 py-4 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-radix-500/10"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-radix-500 to-radix-700 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-radix-500/25 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sistema</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="h-px w-12 bg-white/5"></div>
          <p className="text-sm text-white/20">
            ¿Sin acceso? <a href="/register" className="font-bold text-radix-400 hover:text-radix-300 hover:underline">Solicite su cuenta</a>
          </p>
        </div>
      </form>
      
      <div className="mt-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/10">v1.2 // Secure Health Infrastructure</p>
      </div>
    </div>
  );
}
