'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Activity, HeartPulse, Clock, Pill, Send, Phone, Calendar, AlertCircle, MessageSquare, Footprints, Moon, Wind } from 'lucide-react';
import { patients, type Patient } from '../../services/api';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeFilter = '24h' | '7d' | '30d' | 'all';
type StatType = 'steps' | 'oxygen' | 'sleep';

export default function PatientDetails({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Historical Stats State
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');

  // Simulated Real-Time Data
  const [heartData, setHeartData] = useState<{ time: string, bpm: number }[]>([]);
  const [currentBpm, setCurrentBpm] = useState(72);

  useEffect(() => {
    loadPatient();
    
    // Initialize dummy chart data for live heart
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 1000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
      bpm: 60 + Math.random() * 30
    }));
    setHeartData(initialData);

    // Simulated real-time interval
    const interval = setInterval(() => {
      const newBpm = Math.floor(65 + Math.random() * 25);
      setCurrentBpm(newBpm);
      setHeartData(prev => {
        const next = [...prev.slice(1), { 
          time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }), 
          bpm: newBpm 
        }];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await patients.getAll();
      const found = data.find(p => p.id?.toString() === patientId);
      if (found) setPatient(found);
    } catch (err) {
      console.error('Error loading patient', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    alert(`Mensaje enviado a ${patient?.fullName}: ${message}`);
    setMessage('');
  };

  // Generate historical data based on filters
  const historicalData = useMemo(() => {
    const data = [];
    const now = new Date();
    let points = 7;
    
    if (timeFilter === '24h') points = 24;
    else if (timeFilter === '30d') points = 30;
    else if (timeFilter === 'all') points = 14; // Confinement is usually 14 days

    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(now);
      if (timeFilter === '24h') {
        d.setHours(d.getHours() - i);
      } else {
        d.setDate(d.getDate() - i);
      }
      
      let label = '';
      if (timeFilter === '24h') label = `${d.getHours()}h`;
      else if (timeFilter === '7d' || timeFilter === 'all') label = d.toLocaleDateString('es-ES', { weekday: 'short' });
      else label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

      data.push({ 
        label, 
        steps: Math.floor(Math.random() * 5000) + 2000,
        oxygen: Math.floor(Math.random() * 6) + 94, // 94-100%
        sleep: Number((Math.random() * 3 + 5).toFixed(1)) // 5-8 hours
      });
    }
    return data;
  }, [timeFilter]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
        Cargando expediente...
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--t-s)', fontSize: 14 }}>
        Paciente no encontrado.
        <br />
        <button 
          onClick={() => window.location.href = '/pacientes'}
          style={{ marginTop: 16, background: 'var(--p)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 24, cursor: 'pointer' }}
        >
          Volver a pacientes
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.35s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={() => window.location.href = '/pacientes'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: '50%', background: 'var(--sf)',
            border: '1px solid var(--br)', color: 'var(--t-s)', cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--b)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--sf)'}
        >
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
              {patient.isActive ? 'En Confinamiento' : 'Inactivo'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t-s)', marginTop: 4, display: 'flex', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> F. Nacimiento: {new Date(patient.birthDate).toLocaleDateString()}</span>
            {patient.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {patient.phone}</span>}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        
        {/* Left Column (Info, Map, Confinement) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Confinement Tracker */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Clock size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Estado de Confinamiento</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--t-s)' }}>Día 4 de 14</span>
                <span style={{ fontWeight: 600, color: 'var(--t)' }}>10 días restantes</span>
              </div>
              <div style={{ height: 8, background: 'var(--br)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: 'var(--p)', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          {/* Location / Map Simulator */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MapPin size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Ubicación Asignada</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--t-s)', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
               <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
               {patient.address || 'Ubicación no especificada'}
            </p>
            {/* Map Placeholder */}
            <div style={{ 
              height: 180, borderRadius: 12, overflow: 'hidden', position: 'relative',
              background: 'linear-gradient(45deg, var(--sf) 25%, var(--br) 25%, var(--br) 50%, var(--sf) 50%, var(--sf) 75%, var(--br) 75%, var(--br) 100%)',
              backgroundSize: '20px 20px',
              border: '1px solid var(--br)'
            }}>
               <div style={{
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.9)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
               }}>
                 <MapPin size={20} style={{ color: 'var(--p)' }} />
               </div>
               {/* Ping animation effect */}
               <div style={{
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 width: 60, height: 60, borderRadius: '50%', background: 'var(--p)', opacity: 0.2,
                 animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
               }}>
                 <style>{`
                   @keyframes ping {
                     75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                   }
                 `}</style>
               </div>
            </div>
          </div>

          {/* Treatments */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Pill size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Tratamiento Activo</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Paracetamol 500mg', desc: '1 comprimido cada 8 horas', adherence: '100%' },
                { name: 'Inhalador Salbutamol', desc: '2 inhalaciones cada 12 horas', adherence: '85%' }
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i === 0 ? '1px solid var(--br)' : 'none', paddingBottom: i === 0 ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--t-s)' }}>{t.desc}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--p)', background: 'var(--b)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--br)' }}>
                    {t.adherence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MessageSquare size={18} style={{ color: 'var(--p)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Comunicación Directa</h3>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 13, color: 'var(--t-s)', textAlign: 'center', marginBottom: 8 }}>
                Envía un mensaje o alerta directamente al dispositivo del paciente.
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribir mensaje..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--br)',
                    background: 'var(--b)', color: 'var(--t)', fontSize: 13, outline: 'none'
                  }}
                />
                <button type="submit" disabled={!message.trim()} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
                  borderRadius: 12, border: 'none', background: message.trim() ? 'var(--p)' : 'var(--br)',
                  color: message.trim() ? '#fff' : 'var(--t-s)', cursor: message.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column (Cardiac, Stats) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Cardiac Monitor */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Activity size={18} style={{ color: '#EF4444' }} />
                 <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Monitor Cardíaco en vivo</h3>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--b)', padding: '6px 12px', borderRadius: 99, border: '1px solid var(--br)' }}>
                 <HeartPulse size={16} style={{ color: '#EF4444', animation: 'pulse 1s infinite' }} />
                 <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>{currentBpm}</span>
                 <span style={{ fontSize: 12, color: 'var(--t-s)' }}>BPM</span>
                 <style>{`
                   @keyframes pulse {
                     0%, 100% { transform: scale(1); }
                     50% { transform: scale(1.15); }
                   }
                 `}</style>
               </div>
             </div>
             
             <div style={{ height: 200, width: '100%', marginLeft: -20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--t-s)' }} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                      itemStyle={{ color: 'var(--t)', fontSize: 13 }}
                      labelStyle={{ color: 'var(--t-s)', fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="bpm" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Expanded Historical Stats */}
          <div style={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 20, padding: 24 }}>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', margin: 0 }}>Historial de Salud</h3>

               {/* Timeframe Filter Dropdown/Select */}
               <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  style={{
                    padding: '8px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                    background: 'var(--b)', color: 'var(--t)', border: '1px solid var(--br)',
                    outline: 'none', cursor: 'pointer'
                  }}
               >
                 <option value="24h">Últimas 24 horas</option>
                 <option value="7d">Últimos 7 días</option>
                 <option value="30d">Últimos 30 días</option>
                 <option value="all">Confinamiento completo</option>
               </select>
             </div>

             {/* Chart Rendering Grid */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               
               {/* Steps */}
               <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Footprints size={14} style={{ color: 'var(--p)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Pasos Diarios</span>
                 </div>
                 <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }}
                          itemStyle={{ color: 'var(--t)', fontSize: 12 }}
                          labelStyle={{ color: 'var(--t-s)', fontSize: 11 }}
                          formatter={(val: number) => [`${val} pasos`, 'Pasos Diarios']}
                        />
                        <Bar dataKey="steps" fill="var(--p)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               {/* Oxygen */}
               <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Wind size={14} style={{ color: '#06b6d4' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Oxígeno (SpO2)</span>
                 </div>
                 <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }}
                          itemStyle={{ color: 'var(--t)', fontSize: 12 }}
                          labelStyle={{ color: 'var(--t-s)', fontSize: 11 }}
                          formatter={(val: number) => [`${val} %`, 'SpO2']}
                        />
                        <Area type="monotone" dataKey="oxygen" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               {/* Sleep */}
               <div style={{ background: 'var(--b)', borderRadius: 16, padding: '16px 16px 8px 16px', border: '1px solid var(--br)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Moon size={14} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>Horas de Sueño</span>
                 </div>
                 <div style={{ height: 110, width: '100%', marginLeft: -24 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <YAxis domain={[0, 12]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--t-s)' }} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--sf)', border: '1px solid var(--br)', borderRadius: 8 }}
                          itemStyle={{ color: 'var(--t)', fontSize: 12 }}
                          labelStyle={{ color: 'var(--t-s)', fontSize: 11 }}
                          formatter={(val: number) => [`${val} horas`, 'Sueño']}
                        />
                        <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
