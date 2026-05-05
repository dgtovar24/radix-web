import { useState, useEffect } from 'react';
import { Beaker, Calendar, ShieldAlert, Calculator, Clock, FlaskConical } from 'lucide-react';
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
      <div style={{ padding: 28, borderRadius: 16, background: 'var(--b, #f9fafb)', border: '1px solid var(--br, #e5e7eb)', textAlign: 'center' }}>
        <Beaker size={28} style={{ color: 'var(--t-s, #9ca3af)', marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: 'var(--t-s, #6b7280)', margin: 0 }}>
          Selecciona un isótopo e ingresa la dosis para ver el cálculo de confinamiento
        </p>
      </div>
    );
  }

  const physicalHalfLife = isotope.halfLife;
  const biologicalHalfLife = isotope.biologicalHalfLife ?? physicalHalfLife * 10;
  const effectiveHalfLife = 1.0 / ((1.0 / physicalHalfLife) + (1.0 / biologicalHalfLife));
  const decayTime = Math.log(1.0 / initialDose) / Math.log(0.5) * effectiveHalfLife;
  const isolationDays = Math.ceil(decayTime);
  const safetyThreshold = initialDose * Math.pow(0.5, 24.0 / (effectiveHalfLife * 24.0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "'Inter', sans-serif" }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--t-s, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
        <Calculator size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Cálculo de Confinamiento
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 12, background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Beaker size={13} style={{ color: 'var(--p, #6b32e8)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-s, #6b7280)' }}>Isótopo</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t, #111827)' }}>{isotope.name}</div>
          <div style={{ fontSize: 11, color: 'var(--t-s, #9ca3af)' }}>{isotope.symbol}</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={13} style={{ color: 'var(--p, #6b32e8)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-s, #6b7280)' }}>Semivida Física</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t, #111827)' }}>{physicalHalfLife}</div>
          <div style={{ fontSize: 11, color: 'var(--t-s, #9ca3af)' }}>{isotope.halfLifeUnit}</div>
        </div>
      </div>

      <div style={{ padding: 14, borderRadius: 12, background: 'var(--b, #f9fafb)', border: '1px solid var(--br, #e5e7eb)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <FlaskConical size={13} style={{ color: 'var(--s, #f59e0b)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t-s, #6b7280)', textTransform: 'uppercase' }}>Fórmula de Decaimiento</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--t-s, #4b5563)', lineHeight: 1.6 }}>
          <div>1/T<sub>e</sub> = 1/T<sub>f</sub> + 1/T<sub>b</sub></div>
          <div>1/T<sub>e</sub> = 1/{physicalHalfLife} + 1/{biologicalHalfLife}</div>
          <div style={{ fontWeight: 600, color: 'var(--p, #6b32e8)', marginTop: 2 }}>
            T<sub>e</sub> = {effectiveHalfLife.toFixed(4)} {isotope.halfLifeUnit}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 12, background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Calendar size={13} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>Días de Aislamiento</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#92400e' }}>{isolationDays}</div>
          <div style={{ fontSize: 10, color: '#b45309', marginTop: 2 }}>
            t = ln(1/{initialDose}) / ln(0.5) × {effectiveHalfLife.toFixed(4)}
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <ShieldAlert size={13} style={{ color: '#059669' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#065f46' }}>Umbral Seguridad</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46' }}>{safetyThreshold.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>
            A(24h) = {initialDose} × 0.5<sup>1/{effectiveHalfLife.toFixed(4)}</sup> MBq
          </div>
        </div>
      </div>

      <div style={{ padding: 12, borderRadius: 10, background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t-s, #9ca3af)', textTransform: 'uppercase', marginBottom: 6 }}>Leyenda</div>
        <div style={{ fontSize: 11, color: 'var(--t-s, #6b7280)', lineHeight: 1.5 }}>
          T<sub>f</sub> = semivida física · T<sub>b</sub> = semivida biológica · T<sub>e</sub> = semivida efectiva<br />
          A<sub>0</sub> = dosis inicial · A<sub>seguro</sub> = 1 MBq (límite de exención)<br />
          t = ln(A<sub>seguro</sub>/A<sub>0</sub>) ÷ ln(½) × T<sub>e</sub>
        </div>
      </div>
    </div>
  );
}
