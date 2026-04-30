'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Bell,
  Bot,
  Check,
  Database,
  Link2,
  Mail,
  Palette,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { COLOR_DEFINITIONS } from '../data/palettes';

type SettingsTab = 'appearance' | 'smtp' | 'ai' | 'security' | 'organization' | 'notifications' | 'integrations' | 'data';

const aiModels = [
  { id: 'gpt-4.1', name: 'GPT-4.1', detail: 'Mayor calidad para razonamiento clínico y explicaciones largas.' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', detail: 'Equilibrio entre coste, velocidad y precisión.' },
  { id: 'gpt-4o', name: 'GPT-4o', detail: 'Respuesta multimodal y conversación fluida.' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', detail: 'Modelo rápido para tareas operativas y chat interno.' },
  { id: 'local-clinical', name: 'Modelo clínico local', detail: 'Preparado para instalación privada cuando exista backend.' },
];

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Palette }> = [
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'smtp', label: 'SMTP', icon: Mail },
  { id: 'ai', label: 'Rix IA', icon: Bot },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck },
  { id: 'organization', label: 'Organización', icon: Users },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'integrations', label: 'Integraciones', icon: Link2 },
  { id: 'data', label: 'Datos', icon: Database },
];

export default function ConfigurationPage() {
  const { palette, setPalette, updateColor, resetPalette, presets, isCustom } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [appearanceMode, setAppearanceMode] = useState<'presets' | 'customize' | 'export'>('presets');
  const [customColors, setCustomColors] = useState(palette.colors);
  const [savedAt, setSavedAt] = useState('');

  const [smtp, setSmtp] = useState({
    enabled: true,
    host: 'smtp.raddix.pro',
    port: '587',
    security: 'STARTTLS',
    username: 'notificaciones@raddix.pro',
    password: '',
    senderName: 'Radix Salud',
    senderEmail: 'notificaciones@raddix.pro',
    replyTo: 'soporte@raddix.pro',
    testEmail: 'admin@radix.local',
  });

  const [ai, setAi] = useState({
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    fallbackModel: 'gpt-4o-mini',
    temperature: '0.2',
    maxTokens: '1200',
    clinicalGuardrails: true,
    citeSources: true,
    allowPatientContext: true,
    retentionDays: '30',
    systemPrompt: 'Rix es el asistente clínico de Radix. Responde en español, prioriza seguridad del paciente y pide confirmación cuando falten datos clínicos.',
  });

  const [security, setSecurity] = useState({
    sessionMinutes: '480',
    twoFactor: true,
    auditLog: true,
    forceStrongPasswords: true,
    ipAllowlist: '',
  });

  const [organization, setOrganization] = useState({
    clinicName: 'Radix Salud',
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    defaultDepartment: 'Medicina nuclear',
    patientCodePrefix: 'RAD',
  });

  const [notifications, setNotifications] = useState({
    criticalAlertsEmail: true,
    treatmentDigest: true,
    patientInvites: true,
    rixSummary: true,
    quietHours: '22:00-07:00',
  });

  const [integrations, setIntegrations] = useState({
    apiBase: 'https://api.raddix.pro/v2',
    webhookUrl: '',
    fhirEnabled: false,
    smartwatchSyncMinutes: '5',
  });

  const [dataSettings, setDataSettings] = useState({
    backupFrequency: 'Diario',
    exportFormat: 'CSV + JSON',
    anonymizeExports: true,
    retentionMonths: '60',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('radix-settings-center');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed.smtp) setSmtp(parsed.smtp);
      if (parsed.ai) setAi(parsed.ai);
      if (parsed.security) setSecurity(parsed.security);
      if (parsed.organization) setOrganization(parsed.organization);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.integrations) setIntegrations(parsed.integrations);
      if (parsed.dataSettings) setDataSettings(parsed.dataSettings);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }, []);

  const settingsSnapshot = useMemo(() => ({
    smtp,
    ai,
    security,
    organization,
    notifications,
    integrations,
    dataSettings,
  }), [smtp, ai, security, organization, notifications, integrations, dataSettings]);

  const persistSettings = () => {
    localStorage.setItem('radix-settings-center', JSON.stringify(settingsSnapshot));
    setSavedAt(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setPalette(preset);
    setCustomColors(preset.colors);
  };

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
    updateColor(key, value);
  };

  const handleSaveCustom = () => {
    Object.keys(customColors).forEach(key => {
      updateColor(key as keyof typeof customColors, customColors[key as keyof typeof customColors]);
    });
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--t, #111827)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.03em', margin: 0 }}>
            Centro de configuración
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t-s, #6b7280)', margin: '7px 0 0', fontFamily: "'Inter', sans-serif", lineHeight: 1.45 }}>
            Ajusta apariencia, correo, Rix, seguridad, clínica e integraciones desde una sola superficie.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedAt && <span style={{ fontSize: 12, color: 'var(--t-s, #6b7280)', fontWeight: 700 }}>Guardado {savedAt}</span>}
          {isCustom && (
            <button type="button" onClick={resetPalette} style={secondaryButtonStyle}>
              <RotateCcw size={14} />
              Restablecer tema
            </button>
          )}
          <button type="button" onClick={persistSettings} style={primaryButtonStyle}>
            <Save size={15} />
            Guardar configuración
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 240px) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <aside style={{
          position: 'sticky',
          top: 0,
          display: 'grid',
          gap: 6,
          padding: 10,
          borderRadius: 22,
          background: 'var(--sf, #ffffff)',
          border: '1px solid var(--br, #e5e7eb)',
          boxShadow: '0 16px 42px rgba(15,23,42,0.05)',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 14,
                  border: 'none',
                  background: active ? 'color-mix(in srgb, var(--p, #7c3aed) 10%, #ffffff)' : 'transparent',
                  color: active ? 'var(--p, #7c3aed)' : 'var(--t-s, #6b7280)',
                  fontSize: 13,
                  fontWeight: active ? 900 : 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'left',
                }}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <main style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          {activeTab === 'appearance' && (
            <SectionCard icon={Palette} title="Apariencia" subtitle={`Tema activo: ${palette.name}`}>
              <SegmentedControl
                value={appearanceMode}
                onChange={(value) => setAppearanceMode(value as typeof appearanceMode)}
                options={[
                  ['presets', 'Temas'],
                  ['customize', 'Personalizar'],
                  ['export', 'Exportar'],
                ]}
              />

              {appearanceMode === 'presets' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {presets.map((preset) => {
                    const isSelected = palette.id === preset.id;
                    return (
                      <button key={preset.id} type="button" onClick={() => handlePresetSelect(preset)} style={{
                        padding: 16,
                        borderRadius: 16,
                        background: 'var(--b, #ffffff)',
                        border: `2px solid ${isSelected ? preset.colors.primary : 'var(--br, #e5e7eb)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                      }}>
                        {isSelected && <CheckBadge color={preset.colors.primary} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 11, background: preset.colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Palette size={15} color={preset.colors.primary} />
                          </div>
                          <div>
                            <div style={smallTitleStyle}>{preset.name}</div>
                            <div style={mutedTinyStyle}>{preset.description}</div>
                          </div>
                        </div>
                        <div style={{ height: 7, borderRadius: 99, background: `linear-gradient(90deg, ${preset.colors.primary}, ${preset.colors.secondary}, ${preset.colors.accent})` }} />
                      </button>
                    );
                  })}
                </div>
              )}

              {appearanceMode === 'customize' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    {COLOR_DEFINITIONS.map(({ key, label }) => (
                      <div key={key} style={fieldCardStyle}>
                        <label htmlFor={`color-${key}`} style={labelStyle}>{label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            id={`color-${key}`}
                            type="color"
                            value={customColors[key as keyof typeof customColors]}
                            onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--br, #e5e7eb)', cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--t-s, #6b7280)', fontWeight: 800 }}>{customColors[key as keyof typeof customColors]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" onClick={() => setCustomColors(palette.colors)} style={secondaryButtonStyle}>Cancelar</button>
                    <button type="button" onClick={handleSaveCustom} style={primaryButtonStyle}>Guardar colores</button>
                  </div>
                </div>
              )}

              {appearanceMode === 'export' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  <pre style={codeBlockStyle}>{JSON.stringify(palette, null, 2)}</pre>
                  <button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(palette, null, 2))} style={primaryButtonStyle}>
                    Copiar tema
                  </button>
                </div>
              )}
            </SectionCard>
          )}

          {activeTab === 'smtp' && (
            <SectionCard icon={Mail} title="Servidor SMTP" subtitle="Configura el correo saliente para invitaciones, alertas y resúmenes.">
              <div style={twoColumnGridStyle}>
                <ToggleField label="Activar envío de correo" checked={smtp.enabled} onChange={(value) => setSmtp({ ...smtp, enabled: value })} />
                <SelectField label="Seguridad" value={smtp.security} onChange={(value) => setSmtp({ ...smtp, security: value })} options={['STARTTLS', 'SSL/TLS', 'Sin cifrado']} />
                <TextField label="Host SMTP" value={smtp.host} onChange={(value) => setSmtp({ ...smtp, host: value })} placeholder="smtp.example.com" />
                <TextField label="Puerto" value={smtp.port} onChange={(value) => setSmtp({ ...smtp, port: value })} placeholder="587" />
                <TextField label="Usuario" value={smtp.username} onChange={(value) => setSmtp({ ...smtp, username: value })} placeholder="correo@dominio.com" />
                <TextField label="Contraseña" type="password" value={smtp.password} onChange={(value) => setSmtp({ ...smtp, password: value })} placeholder="••••••••" />
                <TextField label="Nombre remitente" value={smtp.senderName} onChange={(value) => setSmtp({ ...smtp, senderName: value })} />
                <TextField label="Email remitente" value={smtp.senderEmail} onChange={(value) => setSmtp({ ...smtp, senderEmail: value })} />
                <TextField label="Responder a" value={smtp.replyTo} onChange={(value) => setSmtp({ ...smtp, replyTo: value })} />
                <TextField label="Enviar prueba a" value={smtp.testEmail} onChange={(value) => setSmtp({ ...smtp, testEmail: value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={persistSettings} style={primaryButtonStyle}><Save size={15} /> Guardar SMTP</button>
                <button type="button" style={secondaryButtonStyle}><Send size={15} /> Enviar correo de prueba</button>
              </div>
            </SectionCard>
          )}

          {activeTab === 'ai' && (
            <SectionCard icon={Bot} title="Chatbot Rix" subtitle="Define el proveedor, modelo, límites y comportamiento clínico del asistente.">
              <div style={twoColumnGridStyle}>
                <SelectField label="Proveedor" value={ai.provider} onChange={(value) => setAi({ ...ai, provider: value })} options={['OpenAI', 'Azure OpenAI', 'Servidor local', 'Anthropic']} />
                <SelectField label="Modelo principal" value={ai.model} onChange={(value) => setAi({ ...ai, model: value })} options={aiModels.map(model => model.id)} />
                <SelectField label="Modelo de respaldo" value={ai.fallbackModel} onChange={(value) => setAi({ ...ai, fallbackModel: value })} options={aiModels.map(model => model.id)} />
                <TextField label="Temperatura" value={ai.temperature} onChange={(value) => setAi({ ...ai, temperature: value })} />
                <TextField label="Máximo de tokens" value={ai.maxTokens} onChange={(value) => setAi({ ...ai, maxTokens: value })} />
                <TextField label="Retención de conversaciones (días)" value={ai.retentionDays} onChange={(value) => setAi({ ...ai, retentionDays: value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {aiModels.map(model => (
                  <button key={model.id} type="button" onClick={() => setAi({ ...ai, model: model.id })} style={{
                    ...modelCardStyle,
                    borderColor: ai.model === model.id ? 'var(--p, #7c3aed)' : 'var(--br, #e5e7eb)',
                    background: ai.model === model.id ? 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)' : 'var(--b, #ffffff)',
                  }}>
                    <div style={smallTitleStyle}>{model.name}</div>
                    <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: 'var(--t-s, #6b7280)' }}>{model.detail}</p>
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <ToggleField label="Usar contexto de pacientes autorizado" checked={ai.allowPatientContext} onChange={(value) => setAi({ ...ai, allowPatientContext: value })} />
                <ToggleField label="Activar guardrails clínicos" checked={ai.clinicalGuardrails} onChange={(value) => setAi({ ...ai, clinicalGuardrails: value })} />
                <ToggleField label="Pedir citas/fuentes cuando aplique" checked={ai.citeSources} onChange={(value) => setAi({ ...ai, citeSources: value })} />
                <div>
                  <label style={labelStyle}>Prompt del sistema</label>
                  <textarea value={ai.systemPrompt} onChange={(event) => setAi({ ...ai, systemPrompt: event.target.value })} style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'security' && (
            <SectionCard icon={ShieldCheck} title="Seguridad y auditoría" subtitle="Controles base para sesión, trazabilidad y acceso.">
              <div style={twoColumnGridStyle}>
                <TextField label="Duración de sesión (minutos)" value={security.sessionMinutes} onChange={(value) => setSecurity({ ...security, sessionMinutes: value })} />
                <TextField label="Lista blanca de IPs" value={security.ipAllowlist} onChange={(value) => setSecurity({ ...security, ipAllowlist: value })} placeholder="192.168.1.10, 10.0.0.5" />
                <ToggleField label="Doble factor obligatorio" checked={security.twoFactor} onChange={(value) => setSecurity({ ...security, twoFactor: value })} />
                <ToggleField label="Auditoría de acciones clínicas" checked={security.auditLog} onChange={(value) => setSecurity({ ...security, auditLog: value })} />
                <ToggleField label="Contraseñas fuertes" checked={security.forceStrongPasswords} onChange={(value) => setSecurity({ ...security, forceStrongPasswords: value })} />
              </div>
            </SectionCard>
          )}

          {activeTab === 'organization' && (
            <SectionCard icon={Users} title="Organización clínica" subtitle="Datos generales, localización y reglas por defecto.">
              <div style={twoColumnGridStyle}>
                <TextField label="Nombre de la clínica" value={organization.clinicName} onChange={(value) => setOrganization({ ...organization, clinicName: value })} />
                <SelectField label="Zona horaria" value={organization.timezone} onChange={(value) => setOrganization({ ...organization, timezone: value })} options={['Europe/Madrid', 'Europe/London', 'America/New_York', 'America/Mexico_City']} />
                <SelectField label="Idioma y formato" value={organization.locale} onChange={(value) => setOrganization({ ...organization, locale: value })} options={['es-ES', 'en-US', 'ca-ES']} />
                <TextField label="Departamento por defecto" value={organization.defaultDepartment} onChange={(value) => setOrganization({ ...organization, defaultDepartment: value })} />
                <TextField label="Prefijo de código paciente" value={organization.patientCodePrefix} onChange={(value) => setOrganization({ ...organization, patientCodePrefix: value })} />
              </div>
            </SectionCard>
          )}

          {activeTab === 'notifications' && (
            <SectionCard icon={Bell} title="Notificaciones" subtitle="Canales y reglas para correos, alertas y resúmenes.">
              <div style={{ display: 'grid', gap: 10 }}>
                <ToggleField label="Enviar alertas críticas por email" checked={notifications.criticalAlertsEmail} onChange={(value) => setNotifications({ ...notifications, criticalAlertsEmail: value })} />
                <ToggleField label="Resumen diario de tratamientos" checked={notifications.treatmentDigest} onChange={(value) => setNotifications({ ...notifications, treatmentDigest: value })} />
                <ToggleField label="Invitaciones de pacientes por correo" checked={notifications.patientInvites} onChange={(value) => setNotifications({ ...notifications, patientInvites: value })} />
                <ToggleField label="Resumen generado por Rix al cerrar turno" checked={notifications.rixSummary} onChange={(value) => setNotifications({ ...notifications, rixSummary: value })} />
                <TextField label="Horario silencioso" value={notifications.quietHours} onChange={(value) => setNotifications({ ...notifications, quietHours: value })} />
              </div>
            </SectionCard>
          )}

          {activeTab === 'integrations' && (
            <SectionCard icon={Link2} title="Integraciones" subtitle="Conectores externos, API base y sincronización de dispositivos.">
              <div style={twoColumnGridStyle}>
                <TextField label="API base" value={integrations.apiBase} onChange={(value) => setIntegrations({ ...integrations, apiBase: value })} />
                <TextField label="Webhook clínico" value={integrations.webhookUrl} onChange={(value) => setIntegrations({ ...integrations, webhookUrl: value })} placeholder="https://..." />
                <TextField label="Sincronización reloj (minutos)" value={integrations.smartwatchSyncMinutes} onChange={(value) => setIntegrations({ ...integrations, smartwatchSyncMinutes: value })} />
                <ToggleField label="Activar interoperabilidad FHIR" checked={integrations.fhirEnabled} onChange={(value) => setIntegrations({ ...integrations, fhirEnabled: value })} />
              </div>
            </SectionCard>
          )}

          {activeTab === 'data' && (
            <SectionCard icon={Database} title="Datos y cumplimiento" subtitle="Retención, copias de seguridad y exportaciones.">
              <div style={twoColumnGridStyle}>
                <SelectField label="Frecuencia de backup" value={dataSettings.backupFrequency} onChange={(value) => setDataSettings({ ...dataSettings, backupFrequency: value })} options={['Cada 6 horas', 'Diario', 'Semanal']} />
                <SelectField label="Formato de exportación" value={dataSettings.exportFormat} onChange={(value) => setDataSettings({ ...dataSettings, exportFormat: value })} options={['CSV + JSON', 'JSON', 'CSV', 'FHIR Bundle']} />
                <TextField label="Retención de datos (meses)" value={dataSettings.retentionMonths} onChange={(value) => setDataSettings({ ...dataSettings, retentionMonths: value })} />
                <ToggleField label="Anonimizar exportaciones" checked={dataSettings.anonymizeExports} onChange={(value) => setDataSettings({ ...dataSettings, anonymizeExports: value })} />
              </div>
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }: { icon: typeof Palette; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section style={{
      display: 'grid',
      gap: 18,
      padding: 22,
      borderRadius: 24,
      background: 'var(--sf, #ffffff)',
      border: '1px solid var(--br, #e5e7eb)',
      boxShadow: '0 18px 50px rgba(15,23,42,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'color-mix(in srgb, var(--p, #7c3aed) 10%, #ffffff)', color: 'var(--p, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--t, #111827)', letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--t-s, #6b7280)', lineHeight: 1.45 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  const id = fieldId(label);

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const id = fieldId(label);

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 48,
      padding: '10px 12px',
      borderRadius: 14,
      border: '1px solid var(--br, #e5e7eb)',
      background: 'var(--b, #f8fafc)',
      color: 'var(--t, #111827)',
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      textAlign: 'left',
    }}>
      <span style={{ fontSize: 13, fontWeight: 800 }}>{label}</span>
      <span style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        padding: 3,
        background: checked ? 'var(--p, #7c3aed)' : 'var(--br, #e5e7eb)',
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 4px rgba(15,23,42,0.18)' }} />
      </span>
    </button>
  );
}

function fieldId(label: string) {
  return `setting-${label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

function SegmentedControl({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 4, padding: 4, borderRadius: 16, background: 'var(--b, #f8fafc)', border: '1px solid var(--br, #e5e7eb)', maxWidth: 460 }}>
      {options.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)} style={{
          padding: '9px 12px',
          borderRadius: 12,
          border: 'none',
          background: value === id ? 'var(--sf, #ffffff)' : 'transparent',
          color: value === id ? 'var(--t, #111827)' : 'var(--t-s, #6b7280)',
          boxShadow: value === id ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
        }}>{label}</button>
      ))}
    </div>
  );
}

function CheckBadge({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color, boxShadow: '0 2px 8px rgba(0,0,0,0.16)' }}>
      <Check size={12} color="white" strokeWidth={3} />
    </div>
  );
}

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 16px',
  fontSize: 12,
  fontWeight: 900,
  color: '#ffffff',
  background: 'var(--p, #7c3aed)',
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 16px',
  fontSize: 12,
  fontWeight: 900,
  color: 'var(--t-s, #6b7280)',
  background: 'var(--sf, #ffffff)',
  border: '1px solid var(--br, #e5e7eb)',
  borderRadius: 14,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 42,
  padding: '10px 12px',
  borderRadius: 14,
  border: '1px solid var(--br, #e5e7eb)',
  background: 'var(--b, #f8fafc)',
  color: 'var(--t, #111827)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 7,
  color: 'var(--t-s, #6b7280)',
  fontSize: 11,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const twoColumnGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};

const fieldCardStyle: CSSProperties = {
  padding: 12,
  background: 'var(--b, #ffffff)',
  borderRadius: 14,
  border: '1px solid var(--br, #e5e7eb)',
};

const codeBlockStyle: CSSProperties = {
  padding: 14,
  borderRadius: 14,
  fontSize: 11,
  fontFamily: "'Courier New', monospace",
  overflow: 'auto',
  background: 'var(--b, #f8fafc)',
  border: '1px solid var(--br, #e5e7eb)',
  color: 'var(--t, #111827)',
  maxHeight: 260,
};

const smallTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: 'var(--t, #111827)',
};

const mutedTinyStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--t-s, #6b7280)',
  marginTop: 2,
};

const modelCardStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: '1px solid var(--br, #e5e7eb)',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: "'Inter', sans-serif",
};
