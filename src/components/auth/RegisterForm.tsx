import { useState, type FormEvent } from 'react';

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Paciente');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error en el registro');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass-dark rounded-[2.5rem] p-10 text-center animate-fade-in shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-glow">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">¡Cuenta Creada!</h2>
        <p className="text-white/60">Redirigiendo al sistema de acceso...</p>
      </div>
    );
  }

  return (
    <div className="glass-dark relative overflow-hidden rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl border border-white/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-radix-400/50 to-transparent"></div>

      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white/90">Nueva Credencial</h2>
        <p className="mt-2 text-sm text-white/40 font-medium">Regístrese para acceder a la infraestructura RADIX</p>
      </div>

      {error && (
        <div className="animate-fade-in mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/25 ml-1">Nombre</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej. Juan"
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05]"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/25 ml-1">Apellido</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. Pérez"
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/25 ml-1">Correo Institucional</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@hospital.com"
            className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05]"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/25 ml-1">Código de Seguridad</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/10 outline-none transition-all focus:border-radix-500/40 focus:bg-white/[0.05]"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-radix-500 to-radix-700 py-3.5 font-bold text-white shadow-lg transition-all hover:scale-[1.01]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Procesando...
                </>
              ) : (
                'Registrar Facultativo'
              )}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/30">
          ¿Ya tiene acceso? <a href="/login" className="font-bold text-radix-400 hover:text-radix-300">Inicie sesión</a>
        </div>
      </form>
    </div>
  );
}
