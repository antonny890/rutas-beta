import React from 'react';
import { BusTelemetry } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Gauge,
  Clock,
  MapPin,
  X,
  ShieldCheck,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface BusDetailModalProps {
  bus: BusTelemetry;
  onClose: () => void;
}

export const BusDetailModal: React.FC<BusDetailModalProps> = ({ bus, onClose }) => {
  const { routes, setSelectedRoute, setActiveTab } = useApp();
  const matchedRoute = routes.find((r) => r.id === bus.routeId);

  const occupancyConfig = {
    libre: {
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: 'bg-emerald-500',
      label: 'LIBRE (<50%)',
      description: 'Asientos desocupados disponibles para viajar cómodo.',
    },
    medio: {
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
      label: 'OCUPACIÓN MEDIA (50% - 89%)',
      description: 'Pocos asientos libres. Unidad con espacio moderado.',
    },
    lleno: {
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      label: 'LLENO (>=90%)',
      description: 'Unidad a tope de capacidad. Se sugiere esperar la siguiente unidad.',
    },
  }[bus.occupancy];

  const occupancyPercent = Math.min(
    100,
    Math.round((bus.currentPassengers / bus.maxCapacity) * 100)
  );

  const handleInspectRoute = () => {
    if (matchedRoute) {
      setSelectedRoute(matchedRoute);
      setActiveTab('routes');
      onClose();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-20 md:right-6 md:w-96 z-40 animate-in slide-in-from-bottom duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-t-3xl md:rounded-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
        {/* Header Handle for Mobile */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3 md:hidden" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
              style={{ backgroundColor: matchedRoute?.color || '#0284C7' }}
            >
              {bus.routeCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{bus.plate}</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                  GPS VIVO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{bus.model}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SRS RF-3.3: Nivel de Ocupación Ficha */}
        <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nivel de Ocupación
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${occupancyConfig.badgeClass}`}
            >
              {occupancyConfig.label}
            </span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 ${occupancyConfig.barColor}`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {bus.currentPassengers} pasajeros a bordo
            </span>
            <span className="text-slate-500">Capacidad: {bus.maxCapacity}</span>
          </div>

          <p className="text-[11px] text-slate-600 mt-2 font-normal leading-relaxed">
            {occupancyConfig.description}
          </p>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Velocidad</span>
              <span className="font-bold text-slate-800 text-sm">{bus.speedKmH} km/h</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Telemetría</span>
              <span className="font-bold text-slate-800 text-xs">{bus.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Driver Details */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl mb-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 block">Conductor Habilitado</span>
                <span className="font-semibold text-slate-800">{bus.driverName}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              DNI: {bus.driverDni}
            </span>
          </div>
        </div>

        {/* Route Details and Action Button */}
        {matchedRoute && (
          <div className="space-y-2">
            <button
              onClick={handleInspectRoute}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver Itinerario y Paraderos de Ruta {matchedRoute.code}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
