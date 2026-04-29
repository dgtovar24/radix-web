import { useState, useEffect } from 'react';
import { Beaker, MapPin, Activity } from 'lucide-react';
import { treatments, patients, isotopes, type Patient, type Isotope } from '../../services/api';
import ConfinementCalculator from './ConfinementCalculator';

interface TreatmentFormProps {
  preSelectedPatientId?: number;
  onSuccess?: (treatmentId: number) => void;
  onCancel?: () => void;
}

export default function TreatmentForm({ preSelectedPatientId, onSuccess, onCancel }: TreatmentFormProps) {
  const [formData, setFormData] = useState({
    fkPatientId: preSelectedPatientId || 0,
    fkRadioisotopeId: 0,
    room: 0,
    initialDose: 0,
  });
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [isotopeList, setIsotopeList] = useState<Isotope[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([patients.getAll(), isotopes.getAll()])
      .then(([p, i]) => {
        setPatientList(p);
        setIsotopeList(i);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.name === 'room' || e.target.name === 'fkPatientId' || e.target.name === 'fkRadioisotopeId'
      ? parseInt(e.target.value) || 0
      : parseFloat(e.target.value) || 0;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fkPatientId === 0 || formData.fkRadioisotopeId === 0 || formData.room === 0 || formData.initialDose === 0) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await treatments.create(formData);
      onSuccess?.(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tratamiento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text)]">Paciente</label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <select
              name="fkPatientId"
              value={formData.fkPatientId}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none"
            >
              <option value={0}>Seleccionar paciente...</option>
              {patientList.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text)]">Isótopo</label>
          <div className="relative">
            <Beaker className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <select
              name="fkRadioisotopeId"
              value={formData.fkRadioisotopeId}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none"
            >
              <option value={0}>Seleccionar isótopo...</option>
              {isotopeList.map((iso) => (
                <option key={iso.id} value={iso.id}>
                  {iso.name} ({iso.symbol}) - t½ {iso.halfLife} {iso.halfLifeUnit}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text)]">Sala</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="number"
              name="room"
              value={formData.room || ''}
              onChange={handleChange}
              required
              min={1}
              placeholder="101"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text)]">Dosis Inicial (mCi)</label>
          <input
            type="number"
            name="initialDose"
            value={formData.initialDose || ''}
            onChange={handleChange}
            required
            min={0.1}
            step={0.1}
            placeholder="150.5"
            className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      <ConfinementCalculator
        isotopeId={formData.fkRadioisotopeId || null}
        initialDose={formData.initialDose || null}
      />

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--background)] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Beaker className="w-4 h-4" />
              Crear Tratamiento
            </>
          )}
        </button>
      </div>
    </form>
  );
}