import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { 
  User, Shield, Briefcase, CheckCircle, ChevronRight, ChevronLeft, Save, Mail, Lock
} from 'lucide-react';

interface UserWizardData {
  // Step 1
  role: string;
  email: string;
  password: '';
  // Step 2
  firstName: string;
  lastName: string;
  phone: string;
  // Step 3 (Doctors only)
  colegiadoNumber: string;
  specialty: string;
}

export default function UserRegistrationWizard() {
  const { palette } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<UserWizardData>({
    role: 'DOCTOR', email: '', password: '',
    firstName: '', lastName: '', phone: '',
    colegiadoNumber: '', specialty: ''
  });

  const handleChange = (field: keyof UserWizardData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      window.location.href = '/usuarios';
    }, 1500);
  };

  const isDoctor = data.role === 'DOCTOR';
  const totalSteps = isDoctor ? 4 : 3; // Skip professional details if not a doctor

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

  // Dynamically build steps
  const steps = [
    { id: 1, title: 'Cuenta y Rol', icon: Shield },
    { id: 2, title: 'Datos Personales', icon: User },
  ];
  
  if (isDoctor) {
    steps.push({ id: 3, title: 'Datos Profesionales', icon: Briefcase });
  }
  
  steps.push({ id: isDoctor ? 4 : 3, title: 'Resumen', icon: CheckCircle });

  const currentStepData = steps.find(s => s.id === step);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else window.history.back();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t, #111827)', marginBottom: 8 }}>Registro de Nuevo Usuario</h1>
        <p style={{ fontSize: 14, color: 'var(--t-s, #6b7280)' }}>Crea una nueva cuenta de acceso al sistema y asigna los permisos correspondientes.</p>
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
        
        {/* STEP 1: Cuenta y Rol */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Cuenta y Privilegios</h2>
            
            <div>
              <label style={labelStyle}>Rol del Usuario *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div 
                  onClick={() => handleChange('role', 'DOCTOR')}
                  style={{ 
                    border: `2px solid ${data.role === 'DOCTOR' ? 'var(--p)' : 'var(--br, #e5e7eb)'}`, 
                    padding: 16, borderRadius: 12, cursor: 'pointer',
                    background: data.role === 'DOCTOR' ? 'var(--p)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: data.role === 'DOCTOR' ? 'var(--b)' : 'var(--t)'
                  }}
                >
                  <Briefcase size={24} color={data.role === 'DOCTOR' ? 'var(--b)' : 'var(--t-s, #9ca3af)'} />
                  <div>
                    <div style={{ fontWeight: 600, color: data.role === 'DOCTOR' ? 'var(--b)' : 'var(--t, #111827)' }}>Médico Especialista</div>
                    <div style={{ fontSize: 12, color: data.role === 'DOCTOR' ? 'var(--b)' : 'var(--t-s, #6b7280)', opacity: 0.8 }}>Acceso a pacientes y tratamientos</div>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleChange('role', 'ADMIN')}
                  style={{ 
                    border: `2px solid ${data.role === 'ADMIN' ? 'var(--p)' : 'var(--br, #e5e7eb)'}`, 
                    padding: 16, borderRadius: 12, cursor: 'pointer',
                    background: data.role === 'ADMIN' ? 'var(--p)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: data.role === 'ADMIN' ? 'var(--b)' : 'var(--t)'
                  }}
                >
                  <Shield size={24} color={data.role === 'ADMIN' ? 'var(--b)' : 'var(--t-s, #9ca3af)'} />
                  <div>
                    <div style={{ fontWeight: 600, color: data.role === 'ADMIN' ? 'var(--b)' : 'var(--t, #111827)' }}>Administrador</div>
                    <div style={{ fontSize: 12, color: data.role === 'ADMIN' ? 'var(--b)' : 'var(--t-s, #6b7280)', opacity: 0.8 }}>Gestión total del sistema</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Correo Electrónico *</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={data.email} onChange={e => handleChange('email', e.target.value)} style={{...inputStyle, paddingLeft: 40}} placeholder="doctor@clinica.es" />
                  <Mail size={16} color="var(--t-s, #9ca3af)" style={{ position: 'absolute', left: 14, top: 14 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Contraseña *</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" value={data.password} onChange={e => handleChange('password', e.target.value)} style={{...inputStyle, paddingLeft: 40}} placeholder="••••••••" />
                  <Lock size={16} color="var(--t-s, #9ca3af)" style={{ position: 'absolute', left: 14, top: 14 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Datos Personales */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Datos Personales</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" value={data.firstName} onChange={e => handleChange('firstName', e.target.value)} style={inputStyle} placeholder="Ej. Carlos" />
              </div>
              <div>
                <label style={labelStyle}>Apellidos *</label>
                <input type="text" value={data.lastName} onChange={e => handleChange('lastName', e.target.value)} style={inputStyle} placeholder="Ej. López Gómez" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Teléfono de Contacto</label>
              <input type="tel" value={data.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} placeholder="+34 600 000 000" />
            </div>
          </div>
        )}

        {/* STEP 3 (Doctor): Datos Profesionales */}
        {isDoctor && step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Datos Profesionales Médicos</h2>
            <p style={{ fontSize: 14, color: 'var(--t-s, #4b5563)' }}>Información requerida para el registro oficial de facultativos en la plataforma clínica.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>Nº de Colegiado *</label>
                <input type="text" value={data.colegiadoNumber} onChange={e => handleChange('colegiadoNumber', e.target.value)} style={inputStyle} placeholder="Ej. 282865432" />
              </div>
              <div>
                <label style={labelStyle}>Especialidad *</label>
                <select value={data.specialty} onChange={e => handleChange('specialty', e.target.value)} style={inputStyle}>
                  <option value="">Selecciona especialidad...</option>
                  <option value="Medicina Nuclear">Medicina Nuclear</option>
                  <option value="Oncología">Oncología Radioterápica</option>
                  <option value="Endocrinología">Endocrinología</option>
                  <option value="Radiofísica">Radiofísica Hospitalaria</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4/3: Resumen */}
        {step === totalSteps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t, #111827)', borderBottom: '1px solid var(--br, #f3f4f6)', paddingBottom: 16 }}>Resumen de Usuario</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} /> Perfil</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Nombre Completo:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.firstName || '-'} {data.lastName}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Teléfono:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.phone || '-'}</span></div>
                </div>
              </div>

              <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={16} /> Cuenta</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Email de Acceso:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.email || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Nivel de Acceso:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.role === 'DOCTOR' ? 'Médico Especialista' : 'Administrador'}</span></div>
                </div>
              </div>
            </div>

            {isDoctor && (
              <div style={{ background: 'var(--b, #f9fafb)', padding: 20, borderRadius: 12, border: '1px solid var(--br, #e5e7eb)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={16} /> Licencia Médica</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Nº Colegiado:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.colegiadoNumber || '-'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t-s, #6b7280)', fontSize: 13 }}>Especialidad:</span> <span style={{ color: 'var(--t, #111827)', fontWeight: 500, fontSize: 13 }}>{data.specialty || '-'}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <button
          onClick={prevStep}
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

        {step < totalSteps ? (
          <button
            onClick={nextStep}
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
            {isSubmitting ? 'Guardando...' : <><Save size={16} /> Finalizar Registro</>}
          </button>
        )}
      </div>

    </div>
  );
}
