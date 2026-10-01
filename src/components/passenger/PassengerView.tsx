import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArequipaMap } from '../map/ArequipaMap';
import { TripPlanner } from './TripPlanner';
import { RoutesCatalog } from './RoutesCatalog';
import { BusDetailModal } from './BusDetailModal';
import {
  Map as MapIcon,
  Calculator,
  Route as RouteIcon,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

export const PassengerView: React.FC = () => {
  const { activeTab, setActiveTab, selectedBus, setSelectedBus, showToast, buses } = useApp();

  // Coordinates picked from map or presets
  const [originCoords, setOriginCoords] = useState<[number, number] | null>([-16.3988, -71.5369]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>([-16.4162, -71.5165]);
  const [mapPickType, setMapPickType] = useState<'origin' | 'destination' | null>(null);

  // Floating panel visibility on mobile & desktop
  const [isPanelMinimized, setIsPanelMinimized] = useState<boolean>(false);

  const handleStartMapPick = (type: 'origin' | 'destination') => {
    setMapPickType(type);
    setIsPanelMinimized(true);
    showToast(
      `Toca cualquier calle o punto en el mapa para marcar ${
        type === 'origin' ? 'Origen (A)' : 'Destino (B)'
      }`,
      'info'
    );
  };

  const handlePointSelectFromMap = (lat: number, lng: number, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginCoords([lat, lng]);
      showToast(`Punto de origen (A) ubicado en: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
    } else {
      setDestinationCoords([lat, lng]);
      showToast(`Punto de destino (B) ubicado en: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
    }
    setMapPickType(null);
    setIsPanelMinimized(false); // Reopen panel so user sees the updated fare
  };

  const isToolActive = activeTab === 'plan' || activeTab === 'routes';

  return (
    <div className="relative w-full h-[calc(100dvh-60px)] sm:h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-slate-100">
      {/* Top Floating View Switcher Bar (SRS UI-01: Quick view access) */}
      <div className="absolute top-3 left-3 z-30 max-w-[calc(100%-80px)] sm:max-w-none">
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('map');
              setIsPanelMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Mapa en Vivo</span>
            <span className="sm:hidden">Mapa</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 rounded-full text-[10px] font-mono">
              {buses.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('plan');
              setIsPanelMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'plan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calcular Tarifa</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('routes');
              setIsPanelMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'routes'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Rutas y Paraderos</span>
            <span className="sm:hidden">Rutas</span>
          </button>
        </div>
      </div>

      {/* Hero Map Layer - ALWAYS MOUNTED AND VISIBLE */}
      <div className="absolute inset-0 w-full h-full z-10">
        <ArequipaMap
          interactivePointSelection={mapPickType !== null}
          onPointSelect={handlePointSelectFromMap}
          selectionType={mapPickType}
          originCoords={originCoords}
          destinationCoords={destinationCoords}
        />
      </div>

      {/* Floating Side Panel for Desktop / Bottom Sheet for Mobile (When tools active) */}
      {isToolActive && (
        <div
          className={`absolute z-20 transition-all duration-300 ease-out ${
            isPanelMinimized
              ? 'bottom-20 left-4 right-4 md:right-auto md:bottom-6 md:left-4 md:w-80'
              : 'bottom-16 sm:bottom-0 left-0 right-0 md:top-16 md:bottom-4 md:left-4 md:right-auto md:w-[440px] max-h-[70vh] md:max-h-none'
          }`}
        >
          {isPanelMinimized ? (
            /* Minimized Bar: Lets user see the map while easily re-opening the calculator */
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">
                  {activeTab === 'plan' ? 'Calculadora Activa' : 'Catálogo de Rutas'}
                </span>
              </div>
              <button
                onClick={() => setIsPanelMinimized(false)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                <span>Abrir Panel</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Expanded Tool Panel */
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col h-full overflow-hidden">
              {/* Top Handle / Minimize Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {activeTab === 'plan' ? 'Tarifador por Distancia' : 'Catálogo SIT'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsPanelMinimized(true)}
                    title="Minimizar panel para ver el mapa completo"
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-semibold flex items-center gap-1 px-2"
                  >
                    <span>Ver mapa</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tool Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'plan' ? (
                  <TripPlanner
                    onStartMapPick={handleStartMapPick}
                    originCoords={originCoords}
                    destinationCoords={destinationCoords}
                    setOriginCoords={setOriginCoords}
                    setDestinationCoords={setDestinationCoords}
                  />
                ) : (
                  <RoutesCatalog />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Bus Modal */}
      {selectedBus && (
        <BusDetailModal
          bus={selectedBus}
          onClose={() => setSelectedBus(null)}
        />
      )}
    </div>
  );
};
