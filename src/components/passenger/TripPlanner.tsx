import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { POPULAR_LOCATIONS } from '../../data/mockData';
import { calculateTripFare, isWithinArequipaCoverage } from '../../utils/geoUtils';
import {
  MapPin,
  Calculator,
  Navigation,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Moon,
  Sun,
  GraduationCap,
  Coins,
  ChevronRight,
} from 'lucide-react';

interface TripPlannerProps {
  onStartMapPick?: (type: 'origin' | 'destination') => void;
  originCoords?: [number, number] | null;
  destinationCoords?: [number, number] | null;
  setOriginCoords?: (coords: [number, number] | null) => void;
  setDestinationCoords?: (coords: [number, number] | null) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  onStartMapPick,
  originCoords,
  destinationCoords,
  setOriginCoords,
  setDestinationCoords,
}) => {
  const { fareConfig, activeTripQuote, setActiveTripQuote, showToast } = useApp();

  const [originName, setOriginName] = useState<string>('Plaza de Armas de Arequipa');
  const [destinationName, setDestinationName] = useState<string>('Mall Aventura Porongoche');
  const [forceNightMode, setForceNightMode] = useState<boolean>(false);
  const [isStudentView, setIsStudentView] = useState<boolean>(false);

  // Quick preset selection
  const handleSelectPreset = (type: 'origin' | 'destination', loc: (typeof POPULAR_LOCATIONS)[0]) => {
    if (type === 'origin') {
      setOriginName(loc.name);
      if (setOriginCoords) setOriginCoords(loc.coords);
    } else {
      setDestinationName(loc.name);
      if (setDestinationCoords) setDestinationCoords(loc.coords);
    }
  };

  const handleCalculateFare = () => {
    // Fallback coords if not clicked on map yet
    const oCoords = originCoords || POPULAR_LOCATIONS.find((l) => l.name === originName)?.coords || [-16.3988, -71.5369];
    const dCoords = destinationCoords || POPULAR_LOCATIONS.find((l) => l.name === destinationName)?.coords || [-16.4162, -71.5165];

    // Check coverage (SRS RF-3.4 / RF-4.1)
    const oValid = isWithinArequipaCoverage(oCoords[0], oCoords[1]);
    const dValid = isWithinArequipaCoverage(dCoords[0], dCoords[1]);

    if (!oValid || !dValid) {
      showToast('Alerta: El origen o destino se encuentra fuera del área urbana de Arequipa.', 'error');
    }

    const quote = calculateTripFare(oCoords, dCoords, fareConfig, forceNightMode);
    quote.originName = originName;
    quote.destinationName = destinationName;

    setActiveTripQuote(quote);

    if (quote.isWithinArequipaCoverage) {
      showToast(`Tarifa calculada: S/ ${quote.totalFare.toFixed(2)} (${quote.distanceKm} km)`, 'success');
    }
  };

  const handleReset = () => {
    setActiveTripQuote(null);
    if (setOriginCoords) setOriginCoords(null);
    if (setDestinationCoords) setDestinationCoords(null);
    showToast('Planificador reiniciado', 'info');
  };

  return (
    <div className="flex flex-col h-full bg-white md:border-r border-slate-200 overflow-y-auto">
      {/* Title Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Calculadora de Tarifas
              </h2>
              <p className="text-xs text-slate-500">
                SRS RF-3.4 / RF-4.1 · Motor de Costo Justo
              </p>
            </div>
          </div>

          {activeTripQuote && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Origin Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white">
                A
              </span>
              Punto de Origen:
            </span>
            {onStartMapPick && (
              <button
                type="button"
                onClick={() => onStartMapPick('origin')}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline"
              >
                Elegir en Mapa
              </button>
            )}
          </label>

          <select
            value={originName}
            onChange={(e) => {
              setOriginName(e.target.value);
              const found = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
              if (found && setOriginCoords) setOriginCoords(found.coords);
            }}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={`orig-${loc.name}`} value={loc.name}>
                {loc.name} ({loc.district})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 flex items-center justify-center text-[9px] text-white">
                B
              </span>
              Punto de Destino:
            </span>
            {onStartMapPick && (
              <button
                type="button"
                onClick={() => onStartMapPick('destination')}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
              >
                Elegir en Mapa
              </button>
            )}
          </label>

          <select
            value={destinationName}
            onChange={(e) => {
              setDestinationName(e.target.value);
              const found = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
              if (found && setDestinationCoords) setDestinationCoords(found.coords);
            }}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={`dest-${loc.name}`} value={loc.name}>
                {loc.name} ({loc.district})
              </option>
            ))}
          </select>
        </div>

        {/* Simulation Options (Night mode surcharge, student fare) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setForceNightMode(!forceNightMode)}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              forceNightMode
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {forceNightMode ? (
              <Moon className="w-4 h-4 text-indigo-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{forceNightMode ? 'Horario Nocturno (+20%)' : 'Tarifa Diurna'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStudentView(!isStudentView)}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              isStudentView
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isStudentView ? 'Medio Pasaje (50%)' : 'Tarifa General'}</span>
          </button>
        </div>

        {/* Action Button: Cotizar Viaje */}
        <button
          type="button"
          onClick={handleCalculateFare}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Coins className="w-4 h-4" />
          <span>Calcular Tarifa Exacta (km)</span>
        </button>

        {/* Calculated Results Card */}
        {activeTripQuote && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            {/* Coverage Alert if outside perimeter */}
            {!activeTripQuote.isWithinArequipaCoverage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Fuera del Perímetro Arequipa:</span>
                  <p className="mt-0.5 text-rose-700 text-[11px]">
                    El origen o destino excede los 24 km del radio urbano regulado por el SIT de Arequipa.
                  </p>
                </div>
              </div>
            )}

            {/* Main Price Display */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Tarifa Estimada de Transporte</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  Fórmula Oficial
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-white tracking-tight">
                  S/{' '}
                  {isStudentView
                    ? activeTripQuote.studentFare.toFixed(2)
                    : activeTripQuote.totalFare.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">
                  {isStudentView ? '(Medio Pasaje)' : '(Tarifa Regular)'}
                </span>
              </div>

              {/* Trip stats breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Distancia</span>
                    <span className="font-bold">{activeTripQuote.distanceKm} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tiempo Estimado</span>
                    <span className="font-bold">~ {activeTripQuote.estimatedMinutes} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Breakdown Card (Transparency according to SRS) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Desglose de Parámetros Tarifarios
              </span>

              <div className="flex justify-between text-slate-600">
                <span>Tarifa Base SIT:</span>
                <span className="font-mono font-medium">S/ {fareConfig.baseFare.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Costo Distancia ({activeTripQuote.distanceKm} km × S/ {fareConfig.costPerKm.toFixed(2)}):</span>
                <span className="font-mono font-medium">S/ {activeTripQuote.distanceFare.toFixed(2)}</span>
              </div>

              {activeTripQuote.nightSurcharge > 0 && (
                <div className="flex justify-between text-indigo-700 font-medium">
                  <span>Recargo Nocturno ({fareConfig.nightSurchargePercent}%):</span>
                  <span className="font-mono">+S/ {activeTripQuote.nightSurcharge.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-xs">
                <span>Total a Cobrar:</span>
                <span className="text-emerald-700 font-mono text-sm">
                  S/ {isStudentView ? activeTripQuote.studentFare.toFixed(2) : activeTripQuote.totalFare.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Friendly recommendation banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <b>Sugerencia:</b> Puedes abordar la unidad de la ruta <b>Troncal C-1</b> en el paradero más cercano.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
