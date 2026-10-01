import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Minus,
  Navigation,
  Radio,
  Users,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Gauge,
  Compass,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  Database,
  ArrowUpRight,
} from 'lucide-react';

interface QueuedGpsPoint {
  lat: number;
  lng: number;
  speedKmH: number;
  timestamp: string;
}

export const DriverView: React.FC = () => {
  const {
    currentUser,
    myDriverBus,
    driverPassengerCount,
    updateDriverPassengerCount,
    setDriverPassengerCountDirect,
    isDriverGpsSharing,
    setIsDriverGpsSharing,
    showToast,
  } = useApp();

  const [capacityAlert, setCapacityAlert] = useState<string | null>(null);

  // RNF-04: Tolerancia a fallos de red celular y buffer FIFO de coordenadas GPS
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [offlineGpsQueue, setOfflineGpsQueue] = useState<QueuedGpsPoint[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const maxCapacity = myDriverBus.maxCapacity || 34;
  const occupancyPercentage = Math.min(100, Math.round((driverPassengerCount / maxCapacity) * 100));

  const occupancyCategory =
    driverPassengerCount / maxCapacity < 0.5
      ? { label: 'LIBRE', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', bar: 'bg-emerald-500' }
      : driverPassengerCount / maxCapacity < 0.9
      ? { label: 'MEDIA', color: 'text-amber-700 bg-amber-50 border-amber-300', bar: 'bg-amber-500' }
      : { label: 'LLENO', color: 'text-rose-700 bg-rose-50 border-rose-300', bar: 'bg-rose-500' };

  // RNF-04: Periodic coordinate enqueuing when offline
  useEffect(() => {
    if (!isSimulatedOffline || !isDriverGpsSharing) return;

    const interval = setInterval(() => {
      const newPoint: QueuedGpsPoint = {
        lat: Number((myDriverBus.lat + (Math.random() - 0.5) * 0.0002).toFixed(6)),
        lng: Number((myDriverBus.lng + (Math.random() - 0.5) * 0.0002).toFixed(6)),
        speedKmH: myDriverBus.speedKmH,
        timestamp: new Date().toLocaleTimeString('es-PE'),
      };

      setOfflineGpsQueue((prev) => [...prev, newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulatedOffline, isDriverGpsSharing, myDriverBus]);

  // Handle toggling network connectivity (Simulate entering tunnel / losing coverage)
  const handleToggleCoverage = () => {
    if (!isSimulatedOffline) {
      setIsSimulatedOffline(true);
      showToast('Pérdida de red celular: Encolando coordenadas GPS localmente (RNF-04)', 'warning');
    } else {
      // Reconnected! Flush queue via WebSocket simulation
      setIsSyncing(true);
      setTimeout(() => {
        const count = offlineGpsQueue.length;
        setOfflineGpsQueue([]);
        setIsSimulatedOffline(false);
        setIsSyncing(false);
        showToast(
          `Reconexión WebSocket exitosa: ${count} coordenadas encoladas transmitidas al servidor (RNF-04)`,
          'success'
        );
      }, 1000);
    }
  };

  const handleAdjustPassengers = (delta: number) => {
    const result = updateDriverPassengerCount(delta);
    if (!result.success) {
      setCapacityAlert(result.message);
      showToast(result.message, 'warning');
    } else {
      setCapacityAlert(null);
      showToast(result.message, 'info');
    }
  };

  const handleToggleGps = () => {
    const nextState = !isDriverGpsSharing;
    setIsDriverGpsSharing(nextState);
    if (nextState) {
      showToast('GPS Activado: Transmitiendo telemetría en tiempo real (< 2s, RNF-01)', 'success');
    } else {
      showToast('Alerta: Permiso o transmisión GPS pausada por el conductor', 'warning');
    }
  };

  const handleResetTrip = () => {
    setDriverPassengerCountDirect(0);
    setCapacityAlert(null);
    showToast('Contador de pasajeros reseteado a 0 (Fin de vuelta)', 'info');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      {/* Driver Status Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SRS RF-2.1 / RF-2.2
              </span>
              <span className="text-xs text-slate-400">Panel Operativo Móvil SIT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {currentUser.name || myDriverBus.driverName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Vehículo: <span className="text-white font-mono font-bold">{myDriverBus.plate}</span> · Ruta asignada:{' '}
              <span className="text-sky-400 font-bold">{myDriverBus.routeCode}</span> · {myDriverBus.model}
            </p>
          </div>

          {/* GPS Telemetry Switch */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                <Radio
                  className={`w-3.5 h-3.5 ${
                    isDriverGpsSharing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
                {isDriverGpsSharing ? 'GPS Conectado' : 'GPS Detenido'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isDriverGpsSharing ? 'Latencia < 2s (RNF-01)' : 'Sin emisión satelital'}
              </span>
            </div>

            <button
              onClick={handleToggleGps}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
                isDriverGpsSharing ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isDriverGpsSharing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live HUD telemetry badges */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Velocidad Actual</span>
            <span className="text-base font-bold text-white font-mono">
              {isDriverGpsSharing ? `${myDriverBus.speedKmH} km/h` : '0 km/h'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Coordenadas Lat/Lng</span>
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {myDriverBus.lat.toFixed(4)}, {myDriverBus.lng.toFixed(4)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Latencia de Red (RNF-01)</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              0.8 seg (&lt; 2.0s)
            </span>
          </div>
        </div>
      </div>

      {/* RNF-04: Network Fault Tolerance Card (Tolerancia a Fallos de Red) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isSimulatedOffline ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {isSimulatedOffline
                  ? 'Modo Sin Conexión · Encolado Local Activo'
                  : 'Enlace WebSocket en Tiempo Real'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                RNF-04
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isSimulatedOffline
                ? `Encoladas localmente: ${offlineGpsQueue.length} coordenadas en búfer FIFO de memoria.`
                : 'Conexión celular 4G/5G estable con el servidor central SIT.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleCoverage}
            disabled={isSyncing}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSimulatedOffline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            {isSimulatedOffline ? (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>Restablecer y Sincronizar ({offlineGpsQueue.length})</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Simular Pérdida de Señal (Túnel)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Passenger Counter (RF-2.2) */}
      <div className="bg-white rounded-3xl p-5 md:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Control de Pasajeros Abordados
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Toca para registrar altas y bajas de pasajeros. El nivel de ocupación se actualiza en tiempo real para todos los pasajeros.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-xl border ${occupancyCategory.color}`}>
              Ocupación: {occupancyCategory.label} ({occupancyPercentage}%)
            </span>
            <button
              onClick={handleResetTrip}
              title="Resetear contador a 0"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Capacity Warning Alert (SRS RF-2.2: Prueba de límite) */}
        {capacityAlert && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 animate-in shake">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Validación de Capacidad Vehicular:</span>
              <span>{capacityAlert}</span>
            </div>
          </div>
        )}

        {/* Big Counter Display */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 border border-slate-200/80 rounded-3xl mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Pasajeros en Unidad
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight font-mono">
              {driverPassengerCount}
            </span>
            <span className="text-xl md:text-2xl font-bold text-slate-400">
              / {maxCapacity}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-64 max-w-[80%] h-3.5 bg-slate-200 rounded-full overflow-hidden mt-4 shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${occupancyCategory.bar}`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>

          <span className="text-xs font-medium text-slate-500 mt-2">
            {maxCapacity - driverPassengerCount} asientos libres restantes
          </span>
        </div>

        {/* Big Touch Controls (Mobile friendly & ergonomically spaced) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
          <button
            onClick={() => handleAdjustPassengers(-1)}
            disabled={driverPassengerCount <= 0}
            className="py-5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 rounded-2xl font-bold text-lg md:text-xl flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Minus className="w-6 h-6 text-slate-600" />
            <span>- 1 Pasajero</span>
          </button>

          <button
            onClick={() => handleAdjustPassengers(1)}
            disabled={driverPassengerCount >= maxCapacity}
            className="py-5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg md:text-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>+ 1 Pasajero</span>
          </button>
        </div>

        {/* Quick Bulk Batch Buttons (+5, -5) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAdjustPassengers(-5)}
            disabled={driverPassengerCount <= 0}
            className="py-3 px-3 bg-slate-50 hover:bg-slate-100 active:scale-95 disabled:opacity-40 text-slate-600 rounded-xl font-semibold text-xs border border-slate-200 transition-all text-center"
          >
            Descenso Rápido (-5)
          </button>

          <button
            onClick={() => handleAdjustPassengers(5)}
            disabled={driverPassengerCount >= maxCapacity}
            className="py-3 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-95 disabled:opacity-40 text-emerald-700 rounded-xl font-semibold text-xs border border-emerald-200 transition-all text-center"
          >
            Subida en Paradero (+5)
          </button>
        </div>
      </div>
    </div>
  );
};
