import { useState, useEffect } from 'react';
import { Bluetooth, Search, CheckCircle, XCircle, Loader } from 'lucide-react';

interface BluetoothDevice {
  name: string;
  id: string;
}

interface BluetoothPairingProps {
  patientId: number;
  patientName: string;
  onPaired?: (imei: string) => void;
  onCancel?: () => void;
}

type PairingState =
  | 'idle'
  | 'searching'
  | 'found'
  | 'connecting'
  | 'connected'
  | 'error';

export default function BluetoothPairing({ patientId, patientName, onPaired, onCancel }: BluetoothPairingProps) {
  const [state, setState] = useState<PairingState>('idle');
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imei, setImei] = useState<string | null>(null);

  const searchDevice = async () => {
    setState('searching');
    setError(null);

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'RADIX' }],
        optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb'],
      });

      if (!device) {
        setState('idle');
        return;
      }

      setDevice({ name: device.name || 'Unknown Device', id: device.id });
      setState('found');
    } catch (err) {
      if (err instanceof Error && err.name !== 'NotFoundError') {
        setError(err.message);
        setState('error');
      } else {
        setState('idle');
      }
    }
  };

  const connectDevice = async () => {
    if (!device) return;

    setState('connecting');
    setError(null);

    try {
      const server = await device.id.gatt?.connect();

      if (!server) {
        throw new Error('Could not connect to GATT server');
      }

      setState('connected');
      setImei('SIMULATED-IMEI-' + Math.random().toString(36).substring(7).toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setState('error');
    }
  };

  const handleConfirm = () => {
    if (imei) {
      onPaired?.(imei);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
          <Bluetooth className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text)]">Vincular Reloj</h3>
        <p className="text-[var(--text-secondary)] mt-1">
          Conecta el smartwatch del paciente <span className="font-semibold">{patientName}</span>
        </p>
      </div>

      {state === 'idle' && (
        <div className="text-center">
          <button
            onClick={searchDevice}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Search className="w-4 h-4" />
            Buscar Reloj
          </button>
        </div>
      )}

      {state === 'searching' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-[var(--text-secondary)]">Buscando dispositivos...</p>
          <button
            onClick={() => setState('idle')}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
        </div>
      )}

      {state === 'found' && device && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Bluetooth className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">{device.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Dispositivo encontrado</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setDevice(null);
                setState('idle');
              }}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--background)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={connectDevice}
              className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Conectar
            </button>
          </div>
        </div>
      )}

      {state === 'connecting' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-[var(--text-secondary)]">Conectando...</p>
        </div>
      )}

      {state === 'connected' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">¡Reloj Vinculado!</p>
                <p className="text-sm text-emerald-400/80">IMEI: {imei}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--background)] transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">Error de conexión</p>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--background)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={searchDevice}
              className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}