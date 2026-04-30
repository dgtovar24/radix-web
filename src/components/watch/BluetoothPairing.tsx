import { useState } from 'react';
import { Bluetooth, Search, CheckCircle, XCircle, Loader } from 'lucide-react';
import { smartwatches } from '../../services/api';

interface BluetoothDevice {
  name: string;
  gattServer?: any;
}

interface BluetoothPairingProps {
  patientId: number;
  patientName: string;
  onPaired?: (imei: string) => void;
  onCancel?: () => void;
}

type PairingState = 'idle' | 'searching' | 'found' | 'connecting' | 'registering' | 'connected' | 'error';

export default function BluetoothPairing({ patientId, patientName, onPaired, onCancel }: BluetoothPairingProps) {
  const [state, setState] = useState<PairingState>('idle');
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imei, setImei] = useState<string | null>(null);
  const [registeredId, setRegisteredId] = useState<number | null>(null);

  const searchDevice = async () => {
    setState('searching');
    setError(null);

    try {
      const btDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'RADIX' }],
        optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb', 'battery_service', 'device_information'],
      });

      if (!btDevice) {
        setState('idle');
        return;
      }

      setDevice({ name: btDevice.name || 'Unknown Device', gattServer: btDevice });
      setState('found');
    } catch (err: any) {
      if (err?.name === 'NotFoundError') {
        setState('idle');
      } else {
        setError(err?.message || 'Bluetooth error');
        setState('error');
      }
    }
  };

  const connectDevice = async () => {
    if (!device) return;

    setState('connecting');
    setError(null);

    try {
      const btDevice = device.gattServer;
      const server = await btDevice.gatt.connect();

      if (!server) throw new Error('Could not connect to GATT server');

      let discoveredImei = '';
      try {
        const deviceInfoService = await server.getPrimaryService('device_information');
        const chars = await deviceInfoService.getCharacteristics();
        for (const char of chars) {
          if (char.uuid.includes('2a25') || char.uuid.includes('2a26')) {
            const value = await char.readValue();
            discoveredImei = new TextDecoder().decode(value).trim();
            break;
          }
        }
      } catch {}

      if (!discoveredImei) {
        const addr = btDevice.id || btDevice.name || '';
        discoveredImei = 'BT-' + addr.replace(/[^a-zA-Z0-9]/g, '').slice(-12).toUpperCase();
      }

      setImei(discoveredImei);

      setState('registering');
      try {
        const macAddr = (btDevice.id || '').replace(/[^a-fA-F0-9:]/g, '').slice(0, 17) || '00:00:00:00:00:00';
        const result = await smartwatches.create({
          fkPatientId: patientId,
          imei: discoveredImei,
          macAddress: macAddr,
          model: btDevice.name || 'RadixWatch',
        });
        setRegisteredId(result.id);
        setState('connected');
      } catch (apiErr: any) {
        if (apiErr.message?.includes('already registered') || apiErr.message?.includes('IMEI')) {
          setState('connected');
        } else {
          setError('Dispositivo conectado pero error al registrar: ' + (apiErr.message || ''));
          setState('error');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Connection failed');
      setState('error');
    }
  };

  const handleConfirm = () => {
    if (imei) onPaired?.(imei);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--sf)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Bluetooth size={28} style={{ color: 'var(--p)' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t)', margin: '0 0 4px' }}>Vincular Smartwatch</h3>
        <p style={{ fontSize: 13, color: 'var(--t-s)', margin: 0 }}>
          Conecta el dispositivo del paciente <strong>{patientName}</strong>
        </p>
      </div>

      {state === 'idle' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <button
            onClick={searchDevice}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12, border: 'none',
              background: 'var(--p)', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Search size={16} /> Buscar Reloj
          </button>
          <p style={{ fontSize: 12, color: 'var(--t-s)', marginTop: 16 }}>
            Asegúrate de que el smartwatch RADIX esté encendido y cerca
          </p>
        </div>
      )}

      {state === 'searching' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0' }}>
          <Loader size={32} style={{ color: 'var(--p)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--t-s)' }}>Buscando dispositivos...</p>
          <button onClick={() => setState('idle')} style={{ background: 'none', border: 'none', color: 'var(--t-s)', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {state === 'found' && device && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--b)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sf)', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bluetooth size={20} style={{ color: 'var(--p)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', margin: 0 }}>{device.name}</p>
              <p style={{ fontSize: 12, color: 'var(--t-s)', margin: '2px 0 0' }}>Dispositivo encontrado</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setDevice(null); setState('idle'); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--br)', background: 'var(--sf)', color: 'var(--t)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={connectDevice} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--p)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Conectar</button>
          </div>
        </div>
      )}

      {state === 'connecting' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <Loader size={32} style={{ color: 'var(--p)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--t-s)' }}>Conectando al dispositivo...</p>
        </div>
      )}

      {state === 'registering' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <Loader size={32} style={{ color: 'var(--p)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, color: 'var(--t-s)' }}>Registrando dispositivo en el sistema...</p>
        </div>
      )}

      {state === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={24} style={{ color: '#10b981' }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: 0 }}>{registeredId ? 'Dispositivo Registrado' : 'Reloj Vinculado'}</p>
              <p style={{ fontSize: 12, color: '#047857', margin: '2px 0 0' }}>IMEI: {imei}{registeredId ? ` (ID: ${registeredId})` : ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--br)', background: 'var(--sf)', color: 'var(--t)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            <button onClick={handleConfirm} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <XCircle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#991b1b', margin: 0 }}>Error de conexión</p>
              <p style={{ fontSize: 12, color: '#b91c1c', margin: '4px 0 0' }}>{error}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--br)', background: 'var(--sf)', color: 'var(--t)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={searchDevice} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--p)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Reintentar</button>
          </div>
        </div>
      )}
    </div>
  );
}
