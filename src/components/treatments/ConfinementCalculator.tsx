import { useState, useEffect } from 'react';
import { Beaker, Calendar, ShieldAlert } from 'lucide-react';
import { isotopes } from '../../services/api';
import type { Isotope } from '../../services/api';

interface ConfinementCalculatorProps {
  isotopeId: number | null;
  initialDose: number | null;
}

export default function ConfinementCalculator({ isotopeId, initialDose }: ConfinementCalculatorProps) {
  const [isotope, setIsotope] = useState<Isotope | null>(null);

  useEffect(() => {
    if (isotopeId) {
      isotopes.getById(isotopeId).then(setIsotope).catch(console.error);
    } else {
      setIsotope(null);
    }
  }, [isotopeId]);

  if (!isotope || initialDose === null || initialDose <= 0) {
    return (
      <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
        <Beaker className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          Selecciona un isótopo e ingresa la dosis para ver el cálculo
        </p>
      </div>
    );
  }

  const isolationDays = Math.ceil(isotope.halfLife * 10);
  const safetyThreshold = initialDose * 0.1;

  return (
    <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-4">
      <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Cálculo de Confinamiento
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">Isótopo</span>
          </div>
          <p className="text-lg font-bold text-[var(--text)]">{isotope.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">{isotope.symbol}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">Half-life</span>
          </div>
          <p className="text-lg font-bold text-[var(--text)]">{isotope.halfLife}</p>
          <p className="text-xs text-[var(--text-secondary)]">{isotope.halfLifeUnit}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Días de Aislamiento</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{isolationDays}</p>
          <p className="text-xs text-amber-400/80">ceil({isotope.halfLife} × 10)</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Threshold Seguridad</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{safetyThreshold.toFixed(3)} mCi</p>
          <p className="text-xs text-emerald-400/80">10% de {initialDose}</p>
        </div>
      </div>
    </div>
  );
}