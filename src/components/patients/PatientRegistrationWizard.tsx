import React, { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import { 
  User, Watch, ActivitySquare, CheckCircle, ChevronRight, ChevronLeft, Save, Shield
} from 'lucide-react';

interface WizardData {
  // Step 1
  fullName: string;
  phone: string;
  address: string;
  familyAccessCode: string;
  // Step 2
  imei: string;
  macAddress: string;
  model: string;
  // Step 3
  radioisotope: string;
  room: string;
  initialDose: string;
  isolationDays: string;
  startDate: string;
}

export default function PatientRegistrationWizard() {
  const { palette } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    fullName: '', phone: '', address: '', familyAccessCode: '',
    imei: '', macAddress: '', model: '',
    radioisotope: '', room: '', initialDose: '', isolationDays: '', startDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: keyof WizardData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      window.location.href = '/pacientes';
    }, 1500);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid var(--br, #e5e7eb)',
    background: 'var(--b, #ffffff)',
    color: 'var(--t, #111827)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--t-s, #4b5563)',
    marginBottom: 6,
  };

  const steps = [
    { id: 1, title: 'Datos del Paciente', icon: User },
    { id: 2, title: 'Dispositivo Médico', icon: Watch },
    { id: 3, title: 'Tratamiento Médico', icon: ActivitySquare },
    { id: 4, title: 'Resumen', icon: CheckCircle },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)', marginBottom: 8 }}>Registro de Nuevo Paciente</h1>
        <p style={{ fontSize: 14, color: 'var(--t-s, #6b7280)' }}>Completa el proceso paso a paso para configurar un nuevo paciente, su dispositivo y el plan de tratamiento.</p>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, background: 'var(--sf, #ffffff)', padding: 24, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)' }}>
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 120, flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: step >= s.id ? 'var(--p)' : 'var(--b, #f3f4f6)',
                color: step >= s.id ? '#ffffff' : 'var(--t-s, #9ca3af)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s'
              }}>
                <s.icon size={20} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 13, fontWeight: step >= s.id ? 600 : 500, color: step >= s.id ? 'var(--t, #111827)' : 'var(--t-s, #9ca3af)', textAlign: 'center', lineHeight: 1.2 }}>
                {s.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s.id ? 'var(--p)' : 'var(--br, #e5e7eb)', transition: 'background 0.3s', marginTop: 24 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div style={{ background: 'var(--sf, #ffffff)', padding: 40, borderRadius: 16, border: '1px solid var(--br, #f3f4f6)', minHeight: 400 }}>
        
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Información Personal</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Nombre Completo *</label>
                <input type="text" value={data.fullName} onChange={e => handleChange('fullName', e.target.value)} style={inputStyle} placeholder="Ej. Ana García" />
              </div>
              <div>
                <label style={labelStyle}>Teléfono de Contacto</label>
                <input type="tel" value={data.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} placeholder="+34 600 000 000" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Dirección Residencial</label>
              <input type="text" value={data.address} onChange={e => handleChange('address', e.target.value)} style={inputStyle} placeholder="Calle Principal 123, Madrid" />
            </div>
            <div>
              <label style={labelStyle}>Código de Acceso Familiar *</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={data.familyAccessCode} onChange={e => handleChange('familyAccessCode', e.target.value)} style={{...inputStyle, paddingLeft: 40}} placeholder="RADIX-FAM-XXXX" />
                <Shield size={16} color="var(--t-s, #9ca3af)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--t-s, #6b7280)', marginTop: 8 }}>Este código permite a los familiares acceder al portal de seguimiento.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Emparejamiento de Smartwatch</h2>
            <p style={{ fontSize: 14, color: 'var(--t-s, #4b5563)' }}>Introduce los datos del dispositivo wearable que llevará el paciente durante el aislamiento para monitorizar radiación y constantes vitales.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Número IMEI *</label>
                <input type="text" value={data.imei} onChange={e => handleChange('imei', e.target.value)} style={inputStyle} placeholder="35928108492011" />
              </div>
              <div>
                <label style={labelStyle}>Dirección MAC</label>
                <input type="text" value={data.macAddress} onChange={e => handleChange('macAddress', e.target.value)} style={inputStyle} placeholder="00:1B:44:11:3A:B7" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Modelo del Dispositivo</label>
              <select value={data.model} onChange={e => handleChange('model', e.target.value)} style={inputStyle}>
                <option value="">Selecciona un modelo...</option>
                <option value="RadixWatch Pro v2">RadixWatch Pro v2</option>
                <option value="RadixWatch Lite">RadixWatch Lite</option>
                <option value="External Generic">External Generic Watch</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Configuración del Tratamiento</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Radioisótopo *</label>
                <select value={data.radioisotope} onChange={e => handleChange('radioisotope', e.target.value)} style={inputStyle}>
                  <option value="">Selecciona isótopo...</option>
                  <option value="I-131">Yodo-131 (I-131)</option>
                  <option value="Tc-99m">Tecnecio-99m (Tc-99m)</option>
                  <option value="Y-90">Itrio-90 (Y-90)</option>
                  <option value="Lu-177">Lutecio-177 (Lu-177)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Número de Habitación (Aislamiento)</label>
                <input type="number" value={data.room} onChange={e => handleChange('room', e.target.value)} style={inputStyle} placeholder="Ej. 402" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Dosis Inicial Administrada (mCi)</label>
                <input type="number" value={data.initialDose} onChange={e => handleChange('initialDose', e.target.value)} style={inputStyle} placeholder="150" />
              </div>
              <div>
                <label style={labelStyle}>Días de Confinamiento Previstos</label>
                <input type="number" value={data.isolationDays} onChange={e => handleChange('isolationDays', e.target.value)} style={inputStyle} placeholder="5" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Fecha de Inicio</label>
              <input type="date" value={data.startDate} onChange={e => handleChange('startDate', e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Resumen de Registro</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} /> Paciente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Nombre:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.fullName || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Teléfono:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.phone || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Cód. Familiar:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.familyAccessCode || '-'}</span></div>
                </div>
              </div>

              <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ActivitySquare size={16} /> Tratamiento</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Isótopo:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.radioisotope || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Dosis:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.initialDose ? `${data.initialDose} mCi` : '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Días Aislamiento:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.isolationDays || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Habitación:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.room || '-'}</span></div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Watch size={16} /> Dispositivo Vinculado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Modelo:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.model || 'No asignado'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>IMEI:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.imei || '-'}</span></div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <button
          onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 8,
            background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)',
            color: 'var(--t, #111827)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s'
          }}
        >
          <ChevronLeft size={16} /> {step === 1 ? 'Cancelar' : 'Atrás'}
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 8,
              background: 'var(--p)', border: 'none',
              color: '#ffffff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'opacity 0.2s'
            }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 8,
              background: 'var(--s)', border: 'none',
              color: '#ffffff', fontSize: 14, fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer', 
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Guardando...' : <><Save size={16} /> Confirmar Registro</>}
          </button>
        )}
      </div>

    </div>
  );
}
