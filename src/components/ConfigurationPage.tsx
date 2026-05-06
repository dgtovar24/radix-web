'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Bell,
  Bot,
  Check,
  Database,
  KeyRound,
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
import { oauthClients, systemSettings, type OAuthClient, type SystemSettingsResponse, type TokenResponse } from '../services/api';
import { useModules } from '../context/ModulesContext';

type SettingsTab = 'appearance' | 'smtp' | 'ai' | 'security' | 'organization' | 'notifications' | 'integrations' | 'apiKeys' | 'data' | 'modules';

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
  { id: 'apiKeys', label: 'Credenciales API', icon: KeyRound },
  { id: 'data', label: 'Datos', icon: Database },
  { id: 'modules', label: 'Módulos', icon: ShieldCheck },
];

function randomCredential(prefix = '') {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export default function ConfigurationPage() {
  const { palette, setPalette, updateColor, resetPalette, presets, isCustom } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [appearanceMode, setAppearanceMode] = useState<'presets' | 'customize' | 'export'>('presets');
  const [customColors, setCustomColors] = useState(palette.colors);
  const [savedAt, setSavedAt] = useState('');
  const [apiClients, setApiClients] = useState<OAuthClient[]>([]);
  const [apiStatus, setApiStatus] = useState('');
  const [generatedToken, setGeneratedToken] = useState<TokenResponse | null>(null);
  const [apiCredentialForm, setApiCredentialForm] = useState(() => ({
    clientName: 'Integración clínica',
    clientId: randomCredential('radix_'),
    clientSecret: randomCredential(),
    grantType: 'client_credentials',
    scopes: 'patients:read treatments:read alerts:write settings:write',
  }));

  const [smtp, setSmtp] = useState({
    enabled: false,
    host: '',
    port: '',
    security: '',
    username: '',
    password: '',
    senderName: '',
    senderEmail: '',
    replyTo: '',
    testEmail: '',
  });

  const [ai, setAi] = useState({
    provider: 'deepseek',
    model: 'deepseek-v4-pro',
    apiKey: '',
    baseUrl: 'https://api.deepseek.io/v1',
    temperature: '0.7',
    maxTokens: '1024',
    isActive: true,
  });

  const [aiStatus, setAiStatus] = useState('');

  useEffect(() => {
    fetch('/api/config/ai').then(r => r.json()).then(data => {
      if (data.configured) {
        setAi({
          provider: data.provider || 'deepseek',
          model: data.model || 'deepseek-v4-pro',
          apiKey: data.apiKey || '',
          baseUrl: data.baseUrl || 'https://api.deepseek.io/v1',
          temperature: String(data.temperature ?? 0.7),
          maxTokens: String(data.maxTokens ?? 1024),
          isActive: data.isActive ?? true,
        });
      }
    }).catch(() => {});
  }, []);

  const [security, setSecurity] = useState({
    sessionMinutes: '480',
    twoFactor: true,
    auditLog: true,
    forceStrongPasswords: true,
    ipAllowlist: '',
  });

  const [organization, setOrganization] = useState({
    clinicName: '',
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    defaultDepartment: '',
    patientCodePrefix: '',
  });

  const [notifications, setNotifications] = useState({
    criticalAlertsEmail: true,
    treatmentDigest: true,
    patientInvites: true,
    rixSummary: true,
    quietHours: '22:00-07:00',
  });

  const [integrations, setIntegrations] = useState({
    apiBase: '',
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
    systemSettings.get()
      .then((settings) => {
        if (settings.smtp) setSmtp((current) => ({ ...current, ...settings.smtp }));
        if (settings.ai) setAi((current) => ({ ...current, ...settings.ai }));
        if (settings.security) setSecurity((current) => ({ ...current, ...settings.security }));
        if (settings.organization) setOrganization((current) => ({ ...current, ...settings.organization }));
        if (settings.notifications) setNotifications((current) => ({ ...current, ...settings.notifications }));
        if (settings.integrations) setIntegrations((current) => ({ ...current, ...settings.integrations }));
        if (settings.dataSettings) setDataSettings((current) => ({ ...current, ...settings.dataSettings }));
        setSavedAt('Configuración cargada desde API');
      })
      .catch(() => setSavedAt('Configuración pendiente de endpoint /api/system-settings'));
  }, []);

  useEffect(() => {
    oauthClients.getAll()
      .then(setApiClients)
      .catch(() => setApiStatus('No se pudieron cargar las credenciales API.'));
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

  const persistSettings = async () => {
    try {
      await systemSettings.update(settingsSnapshot as SystemSettingsResponse);
      setSavedAt(`Guardado ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
    } catch (error) {
      setSavedAt('No se pudo guardar: falta /api/system-settings');
    }
  };

  const testSmtp = async () => {
    try {
      const result = await systemSettings.testSmtp(smtp.testEmail);
      setSavedAt(result.message || (result.sent ? 'Correo de prueba enviado' : 'No se pudo enviar el correo'));
    } catch (error) {
      setSavedAt('No se pudo probar SMTP: falta /api/system-settings/smtp/test');
    }
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

  const createApiClient = async () => {
    try {
      const created = await oauthClients.create(apiCredentialForm);
      setApiClients((current) => [created, ...current]);
      setApiStatus('Client ID y secret creados en la API.');
    } catch {
      setApiStatus('No se pudo crear el cliente OAuth en la API.');
    }
  };

  const requestApiToken = async () => {
    try {
      const token = await oauthClients.createToken({
        grantType: apiCredentialForm.grantType,
        clientId: apiCredentialForm.clientId,
        clientSecret: apiCredentialForm.clientSecret,
        scope: apiCredentialForm.scopes,
      });
      setGeneratedToken(token);
      setApiStatus('Token generado desde /api/auth/token.');
    } catch {
      setApiStatus('No se pudo generar el token con estas credenciales.');
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 22, minWidth: 0 }}>
      <div className="settings-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
        <div className="settings-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {savedAt && <span style={{ fontSize: 12, color: 'var(--t-s, #6b7280)', fontWeight: 700 }}>{savedAt}</span>}
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

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 240px) minmax(0, 1fr)', gap: 20, alignItems: 'start', minWidth: 0 }}>
        <aside className="settings-tabs" style={{
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
                <button type="button" onClick={testSmtp} style={secondaryButtonStyle}><Send size={15} /> Enviar correo de prueba</button>
              </div>
            </SectionCard>
          )}

          {activeTab === 'ai' && (
            <SectionCard icon={Bot} title="Chatbot Rix" subtitle="Configura el modelo de IA, la API Key y los parámetros del asistente clínico.">
              <div style={{ display: 'grid', gap: 12 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <SelectField label="Proveedor" value={ai.provider} onChange={(value) => setAi({ ...ai, provider: value })} options={['deepseek', 'openai', 'anthropic', 'custom']} />
                  <TextField label="Modelo" value={ai.model} onChange={(value) => setAi({ ...ai, model: value })} placeholder="deepseek-v4-pro" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <TextField label="API Key" value={ai.apiKey} onChange={(value) => setAi({ ...ai, apiKey: value })} placeholder="sk-cp-..." type="password" />
                  <TextField label="Base URL" value={ai.baseUrl} onChange={(value) => setAi({ ...ai, baseUrl: value })} placeholder="https://api.deepseek.io/v1" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <TextField label="Temperatura" value={ai.temperature} onChange={(value) => setAi({ ...ai, temperature: value })} placeholder="0.7" />
                  <TextField label="Max Tokens" value={ai.maxTokens} onChange={(value) => setAi({ ...ai, maxTokens: value })} placeholder="1024" />
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <ToggleField label="Activo" checked={ai.isActive} onChange={(value) => setAi({ ...ai, isActive: value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={async () => {
                    setAiStatus('Probando...');
                    try {
                      const res = await (await fetch('/api/config/ai/test', { method: 'POST' })).json();
                      setAiStatus(res.success ? '✓ ' + res.message : '✗ ' + res.message);
                    } catch { setAiStatus('✗ Error de conexión'); }
                  }} style={{
                    padding: '10px 20px', borderRadius: 10, border: '1px solid var(--br)',
                    background: 'var(--sf)', color: 'var(--t)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Probar conexión</button>

                  <button type="button" onClick={async () => {
                    setAiStatus('Guardando...');
                    try {
                      const res = await (await fetch('/api/config/ai', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ai),
                      })).json();
                      setAiStatus('✓ ' + (res.message || 'Guardado correctamente'));
                    } catch { setAiStatus('✗ Error al guardar'); }
                  }} style={{
                    padding: '10px 20px', borderRadius: 10, border: 'none',
                    background: 'var(--p)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>Guardar configuración</button>

                  {aiStatus && <span style={{ alignSelf: 'center', fontSize: 12, fontWeight: 600, color: aiStatus.startsWith('✓') ? '#10b981' : aiStatus.startsWith('✗') ? '#ef4444' : 'var(--t-s)' }}>{aiStatus}</span>}
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

          {activeTab === 'apiKeys' && (
            <SectionCard icon={KeyRound} title="Credenciales API" subtitle="Crea client ID, client secret y tokens para consumir la API Radix.">
              <div style={twoColumnGridStyle}>
                <TextField label="Nombre del cliente" value={apiCredentialForm.clientName} onChange={(value) => setApiCredentialForm({ ...apiCredentialForm, clientName: value })} />
                <SelectField label="Grant type" value={apiCredentialForm.grantType} onChange={(value) => setApiCredentialForm({ ...apiCredentialForm, grantType: value })} options={['client_credentials', 'family_access', 'api_access']} />
                <TextField label="Client ID" value={apiCredentialForm.clientId} onChange={(value) => setApiCredentialForm({ ...apiCredentialForm, clientId: value })} />
                <TextField label="Client secret" value={apiCredentialForm.clientSecret} onChange={(value) => setApiCredentialForm({ ...apiCredentialForm, clientSecret: value })} />
                <TextField label="Scopes" value={apiCredentialForm.scopes} onChange={(value) => setApiCredentialForm({ ...apiCredentialForm, scopes: value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setApiCredentialForm({
                  ...apiCredentialForm,
                  clientId: randomCredential('radix_'),
                  clientSecret: randomCredential(),
                })} style={secondaryButtonStyle}>
                  <RotateCcw size={15} />
                  Regenerar valores
                </button>
                <button type="button" onClick={createApiClient} style={primaryButtonStyle}>
                  <Save size={15} />
                  Crear cliente
                </button>
                <button type="button" onClick={requestApiToken} style={secondaryButtonStyle}>
                  <KeyRound size={15} />
                  Crear token
                </button>
              </div>
              {apiStatus && <div style={{ padding: 12, borderRadius: 14, background: 'color-mix(in srgb, var(--p, #7c3aed) 8%, #ffffff)', color: 'var(--p, #7c3aed)', fontSize: 12, fontWeight: 900 }}>{apiStatus}</div>}
              {generatedToken && (
                <pre style={codeBlockStyle}>{JSON.stringify(generatedToken, null, 2)}</pre>
              )}
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={smallTitleStyle}>Clientes existentes</div>
                {apiClients.length === 0 ? (
                  <div style={{ padding: 14, borderRadius: 14, border: '1px solid var(--br, #e5e7eb)', color: 'var(--t-s, #6b7280)', fontSize: 12 }}>
                    La API no devolvió clientes OAuth todavía.
                  </div>
                ) : apiClients.map(client => (
                  <div key={client.id || client.clientId} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, padding: 14, borderRadius: 16, border: '1px solid var(--br, #e5e7eb)', background: 'var(--b, #f8fafc)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--t, #111827)' }}>{client.clientName || client.clientId}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--t-s, #6b7280)', fontWeight: 800 }}>{client.clientId} · {client.scopes}</div>
                    </div>
                    <span style={{ alignSelf: 'center', fontSize: 11, fontWeight: 900, color: client.isActive ? '#10b981' : '#ef4444' }}>{client.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                ))}
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
          {activeTab === 'modules' && (
            <ModulesTab />
          )}
        </main>
      </div>
      <style>{`
        @media (max-width: 1180px) {
          .settings-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .settings-tabs {
            position: static !important;
            display: flex !important;
            overflow-x: auto !important;
            gap: 8px !important;
            scrollbar-width: thin;
          }

          .settings-tabs > button {
            width: auto !important;
            flex: 0 0 auto !important;
            white-space: nowrap;
          }
        }

        @media (max-width: 760px) {
          .settings-header,
          .settings-actions {
            width: 100%;
          }

          .settings-actions > button {
            flex: 1 1 100%;
          }
        }
      `}</style>
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

function ModulesTab() {
  const { modules, loading, toggleModule } = useModules();

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando módulos...</div>;

  return (
    <SectionCard icon={ShieldCheck} title="Módulos del Sistema" subtitle="Activa o desactiva funcionalidades de la organización.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modules.map(mod => (
          <div key={mod.moduleKey} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--sf, #ffffff)', border: '1px solid var(--br, #e5e7eb)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)' }}>{mod.moduleName}</div>
              <div style={{ fontSize: 11, color: 'var(--t-s, #6b7280)', marginTop: 2 }}>
                {mod.moduleKey === 'patient_assignment' && 'Permite asignar pacientes a doctores y ver la relación en la tabla de facultativos.'}
                {mod.moduleKey === 'room_assignment' && 'Muestra el campo de habitación en tratamientos y la columna Sala en las tablas.'}
                {mod.moduleKey === 'doctor_schedules' && 'Activa la pestaña Horarios con la rejilla semanal de turnos de los doctores.'}
                {mod.moduleKey === 'quick_login' && 'Habilita el inicio de sesión rápido con PIN y selector de doctores en el login.'}
              </div>
            </div>
            <button
              onClick={() => toggleModule(mod.moduleKey, !mod.isEnabled)}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 'none',
                background: mod.isEnabled ? 'var(--p, #6b32e8)' : 'var(--br, #d1d5db)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: mod.isEnabled ? 23 : 3, transition: 'left 0.2s',
              }} />
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
