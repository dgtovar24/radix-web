'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Activity, HeartPulse, Clock, Pill, Send, Phone, Calendar, AlertCircle, MessageSquare, Footprints, Moon, Wind } from 'lucide-react';
import { patients, watch, healthMetrics, radiationLogs, messages, type Patient, type WatchMetrics, type HealthMetricsResponse, type RadiationLogResponse } from '../../services/api';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeFilter = '24h' | '7d' | '30d' | 'all';

export default function PatientDetails({ patientId }: { patientId: string }) {
  const pid = Number(patientId);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [currentBpm, setCurrentBpm] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentRadiation, setCurrentRadiation] = useState(0);
  const [latestWatch, setLatestWatch] = useState<WatchMetrics | null>(null);
  const [metricsList, setMetricsList] = useState<HealthMetricsResponse[]>([]);
  const [radList, setRadList] = useState<RadiationLogResponse[]>([]);
  const [heartData, setHeartData] = useState<{ time: string; bpm: number }[]>([]);

  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadAll();
    pollRef.current = setInterval(loadAll, 10000);
    return () => clearInterval(pollRef.current);
  }, [patientId, timeFilter]);

  const loadAll = async () => {
    try {
      const [p, wm, mets, rads] = await Promise.all([
        patients.getById(pid),
        watch.getLatest(pid).catch(() => null as WatchMetrics | null),
        healthMetrics.getByPatient(pid, timeFilter === '24h' ? 1 : timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 14),
        radiationLogs.getByPatient(pid, timeFilter === '24h' ? 1 : timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 14),
      ]);

      setPatient(p);
      if (wm) {
        setLatestWatch(wm);
        setCurrentBpm(wm.bpm || 0);
        setCurrentSteps(wm.steps || 0);
        setCurrentRadiation(wm.currentRadiation || 0);
        setHeartData(prev => {
          const next = [...prev.slice(-19), { time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), bpm: wm.bpm || 60 + Math.random() * 20 }];
          while (next.length < 20) next.unshift({ time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), bpm: 60 + Math.random() * 20 });
          return next;
        });
      }
      setMetricsList(mets || []);
      setRadList(rads || []);
    } catch (err) {
      console.error('Error loading patient data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await messages.send({ fkPatientId: pid, messageText: message });
      setMessageSent(true);
      setMessage('');
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  const chartData = metricsList.map(m => ({
    label: new Date(m.recordedAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
    steps: m.steps || 0,
    bpm: m.bpm || 0,
    distance: m.distance || 0,
    radiation: m.currentRadiation || 0,
  }));

  const radChartData = radList.map(r => ({
    label: new Date(r.timestamp).toLocaleDateString('es-ES', { weekday: 'short' }),
    radiation: r.radiationLevel,
  }));

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>Cargando expediente...</div>;
  }

  if (!patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
        Paciente no encontrado.<br />
        <button onClick={() => window.location.href = '/pacientes'} style={{ marginTop: 16, background: 'var(--p)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 24, cursor: 'pointer' }}>Volver a pacientes</button>
      </div>
    );
  }

  const isolStr = latestWatch ? `${Math.max(0, 14 - Math.floor((Date.now() - new Date(latestWatch.recordedAt).getTime()) / 86400000))} días` : 'Cargando...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.35s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => window.location.href = '/pacientes'} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'var(--sf)',
          border: '1px solid var(--br)', color: 'var(--t-s)', cursor: 'pointer',
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)', margin: 0 }}>{patient.fullName}</h1>
            <span style={{
              background: patient.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
              color: patient.isActive ? '#10B981' : 'var(--t-s)',
              padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: patient.isActive ? '#10B981' : 'var(--t-s)' }} />
              {patient.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t-s)', marginTop: 4, display: 'flex', gap: 16 }}>
            {patient.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {patient.phone}</span>}
            {patient.address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {patient.address}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Clock size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Estado</h3>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--t-s)', marginBottom: 8 }}>Código Familiar: <strong style={{ color: 'var(--t)' }}>{patient.familyAccessCode || 'N/A'}</strong></div>
              <div style={{ fontSize: 13, color: 'var(--t-s)' }}>Radiación actual: <strong style={{ color: 'var(--s)' }}>{currentRadiation.toFixed(2)} mSv</strong></div>
            </div>
          </div>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MapPin size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Ubicación</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--t-s)', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              {patient.address || 'No especificada'}
            </p>
            <div style={{ height: 180, borderRadius: 12, background: 'linear-gradient(45deg, var(--sf) 25%, var(--br) 25%, var(--br) 50%, var(--sf) 50%, var(--sf) 75%, var(--br) 75%, var(--br) 100%)', backgroundSize: '20px 20px', border: '1px solid var(--br)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} style={{ color: 'var(--p)' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Pill size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Tratamientos</h3>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t-s)' }}>Dosis monitorizada por el smartwatch del paciente</div>
          </div>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MessageSquare size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Mensaje al Paciente</h3>
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribir mensaje motivacional..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)', fontSize: 13, outline: 'none' }}
              />
              <button type="submit" disabled={!message.trim()} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
                borderRadius: 12, border: 'none', background: message.trim() ? 'var(--p)' : 'var(--br)',
                color: message.trim() ? '#fff' : 'var(--t-s)', cursor: message.trim() ? 'pointer' : 'not-allowed',
              }}>
                <Send size={16} />
              </button>
            </form>
            {messageSent && <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', fontWeight: 600 }}>Mensaje enviado</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity size={18} style={{ color: '#EF4444' }} />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Monitor Cardíaco</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--b)', padding: '6px 12px', borderRadius: 99, border: '1px solid var(--br)' }}>
                <HeartPulse size={16} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>{currentBpm}</span>
                <span style={{ fontSize: 12, color: 'var(--t-s)' }}>BPM</span>
              </div>
            </div>
            <div style={{ height: 200, width: '100%', marginLeft: -20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartData.length > 0 ? heartData : [{ time: '--:--:--', bpm: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                  <Tooltip contentStyle={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="bpm" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Historial de Salud</h3>
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)} style={{
                padding: '8px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, background: 'var(--b)', color: 'var(--t)', border: '1px solid var(--br)', outline: 'none', cursor: 'pointer'
              }}>
                <option value="24h">24 horas</option>
                <option value="7d">7 días</option>
                <option value="30d">30 días</option>
                <option value="all">Todo</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Footprints size={14} style={{ color: 'var(--p)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Pasos ({currentSteps} hoy)</span>
                </div>
                <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.length > 0 ? chartData : [{ label: 'Sin datos', steps: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <Tooltip contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }} />
                      <Bar dataKey="steps" fill="var(--p)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Wind size={14} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Radiación (mSv)</span>
                </div>
                <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={radChartData.length > 0 ? radChartData : [{ label: 'Sin datos', radiation: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <Tooltip contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }} />
                      <Area type="monotone" dataKey="radiation" stroke="var(--s)" fill="var(--s)" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Moon size={14} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Distancia (km)</span>
                </div>
                <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.length > 0 ? chartData : [{ label: 'Sin datos', distance: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                      <Tooltip contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }} />
                      <Bar dataKey="distance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
