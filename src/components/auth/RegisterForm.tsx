import { useState, type FormEvent } from 'react';

interface Props {
  creatorRole?: string;
  creatorToken?: string | number;
}

export default function RegisterForm({ creatorRole, creatorToken }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDoctor = creatorRole === 'Admin';
  const isPatient = creatorRole === 'Doctor';

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
          password,
          phone: isPatient ? phone : undefined,
          address: isPatient ? address : undefined,
          role: isPatient ? 'Patient' : 'Doctor'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error en el registro');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass-dark rounded-[2.5rem] p-10 text-center shadow-2xl">
        <h2 className="font-display text-2xl font-bold text-white mb-2">¡Cuenta Creada!</h2>
        <p className="text-white/60">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <div className="glass-dark relative overflow-hidden rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white/90">
          Nueva Credencial de {isDoctor ? 'Facultativo (Médico)' : isPatient ? 'Paciente' : 'Acceso'}
        </h2>
        <p className="mt-2 text-sm text-white/40 font-medium">Complete los datos para añadir al sistema</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-bold text-white/30">Nombre</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-bold text-white/30">Apellido</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-[10px] uppercase font-bold text-white/30">Correo</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
        </div>

        {isPatient && (
          <>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-white/30">Teléfono (Opcional)</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-white/30">Dirección (Opcional)</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
            </div>
          </>
        )}

        <div className="space-y-1 text-left">
          <label className="text-[10px] uppercase font-bold text-white/30">Contraseña temporal</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-xl bg-radix-600 py-3.5 font-bold text-white hover:bg-radix-500 mt-4">
          {"Registrar"}
        </button>
      </form>
    </div>
  );
}
