'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import { alerts, messages, patients, type Alert, type Patient } from '../../services/api';

interface AlertListProps {
  filterPending?: boolean;
  patientId?: number;
}

export default function AlertList({ filterPending = false, patientId }: AlertListProps) {
  const [alertList, setAlertList] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [patientMap, setPatientMap] = useState<Record<number, Patient>>({});

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const data = patientId
        ? await alerts.getByPatient(patientId)
        : filterPending
        ? await alerts.getPending()
        : await alerts.getAll();
      setAlertList(data);
    } catch (err) {
      console.error('Error loading alerts', err);
      setError('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  }, [filterPending, patientId]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    patients.getAll()
      .then((list) => setPatientMap(Object.fromEntries(list.map((patient) => [patient.id, patient]))))
      .catch(() => setPatientMap({}));
  }, []);

  useEffect(() => {
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:8080' : 'api.raddix.pro';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${wsHost}/ws/alerts`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const newAlert = JSON.parse(event.data) as Alert;
            setAlertList((prev) => [newAlert, ...prev]);
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {}
    };

    connect();

    const pollInterval = setInterval(loadAlerts, 30000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [loadAlerts]);

  const handleResolve = async (alertId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres marcar esta alerta como resuelta?")) return;
    try {
      await alerts.resolve(alertId);
      setAlertList((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isResolved: true } : a))
      );
    } catch (err) {
      console.error('Error resolving alert', err);
    }
  };

  const handleQuickMessage = async (alert: Alert) => {
    const text = window.prompt(`Mensaje rápido para ${alert.patientName}`, `Hola ${alert.patientName}, hemos revisado tu alerta. ¿Puedes confirmar cómo te encuentras?`);
    if (!text?.trim()) return;
    try {
      await messages.send({ fkPatientId: alert.patientId, messageText: text.trim() });
      window.alert('Mensaje enviado al paciente.');
    } catch {
      window.alert('No se pudo enviar el mensaje. Revisa la conexión con la API.');
    }
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando alertas...</div>;
  }

  if (alertList.length === 0) {
    return (
      <div style={{ padding: 64, textAlign: 'center', background: 'var(--sf)', borderRadius: 20, border: '1px solid var(--br)' }}>
        <CheckCircle size={32} style={{ color: '#10b981', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t)', margin: '0 0 8px' }}>No hay alertas</h3>
        <p style={{ fontSize: 14, color: 'var(--t-s)', margin: 0 }}>
          {filterPending ? 'No hay alertas pendientes' : 'El sistema está tranquilo'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.35s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--t)', margin: 0 }}>
          Alertas ({alertList.length})
        </h3>
        {wsConnected && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
            Tiempo real
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alertList.map((alert) => (
          <div
            key={alert.id}
            style={{
              padding: 20,
              background: 'var(--sf)',
              borderRadius: 16,
              border: alert.isResolved ? '1px solid var(--br)' : '1px solid rgba(239, 68, 68, 0.3)',
              opacity: alert.isResolved ? 0.7 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div style={{
              padding: 10,
              borderRadius: 12,
              background: alert.isResolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {alert.isResolved ? (
                <CheckCircle size={20} style={{ color: '#10b981' }} />
              ) : (
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: alert.alertType === 'RADIATION_HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: alert.alertType === 'RADIATION_HIGH' ? '#ef4444' : '#f59e0b',
                }}>
                  {alert.alertType.replace('_', ' ')}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: alert.isResolved ? '#10b981' : '#ef4444',
                }}>
                  {alert.isResolved ? 'Resuelta' : 'Pendiente'}
                </span>
              </div>

              <p style={{ fontSize: 14, color: 'var(--t)', margin: '0 0 8px', fontWeight: 500 }}>
                {alert.message}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--t-s)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  {new Date(alert.createdAt).toLocaleString('es-ES')}
                </span>
                <span>Paciente: <strong style={{ color: 'var(--t)', fontWeight: 600 }}>{alert.patientName}</strong></span>
              </div>
            </div>

            <div className="alert-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.location.href = `/pacientes/${alert.patientId}`}
                title="Ver paciente"
                style={alertActionStyle}
              >
                <ExternalLink size={15} />
                Paciente
              </button>
              <button
                onClick={() => handleQuickMessage(alert)}
                title="Enviar mensaje al paciente"
                style={alertActionStyle}
              >
                <MessageCircle size={15} />
                Mensaje
              </button>
              <a
                href={patientMap[alert.patientId]?.phone ? `tel:${patientMap[alert.patientId].phone}` : undefined}
                title="Llamar al paciente"
                style={{ ...alertActionStyle, textDecoration: 'none', opacity: patientMap[alert.patientId]?.phone ? 1 : 0.55, pointerEvents: patientMap[alert.patientId]?.phone ? 'auto' : 'none' }}
              >
                <Phone size={15} />
                Llamar
              </a>
              {!alert.isResolved && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Resolver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 760px) {
          .alert-actions {
            width: 100%;
            justify-content: stretch !important;
          }
          .alert-actions > button,
          .alert-actions > a {
            flex: 1 1 calc(50% - 8px);
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}

const alertActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '8px 12px',
  background: 'var(--b)',
  color: 'var(--t)',
  border: '1px solid var(--br)',
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};
