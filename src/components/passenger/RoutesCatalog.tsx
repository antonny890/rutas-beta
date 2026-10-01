import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransitRoute, BusStop } from '../../types';
import {
  Route as RouteIcon,
  Clock,
  Navigation,
  MapPin,
  ChevronRight,
  Filter,
  CheckCircle2,
  Bus,
} from 'lucide-react';

export const RoutesCatalog: React.FC = () => {
  const { routes, selectedRoute, setSelectedRoute, setActiveTab, showToast, buses } = useApp();
  const [filterCategory, setFilterCategory] = useState<'Todos' | 'Troncal' | 'Alimentadora'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = routes.filter((route) => {
    const matchesCategory = filterCategory === 'Todos' || route.category === filterCategory;
    const matchesSearch =
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.stops.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectRoute = (route: TransitRoute) => {
    setSelectedRoute(route);
    showToast(`Visualizando trazado de ${route.code} en mapa`, 'info');
  };

  return (
    <div className="flex flex-col h-full bg-white md:border-r border-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Catálogo de Rutas Oficiales
            </h2>
            <p className="text-xs text-slate-500">
              SIT Arequipa · SRS RF-3.2 Rutas y Paraderos
            </p>
          </div>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Buscar por ruta o paradero (ej. Zamácola, C-1)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2.5"
        />

        {/* Category Filter Buttons (Allowed functional interactive filter controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          {(['Todos', 'Troncal', 'Alimentadora'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                filterCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Routes List */}
      <div className="p-4 space-y-3">
        {filteredRoutes.map((route) => {
          const isSelected = selectedRoute?.id === route.id;
          const activeUnitsOnRoute = buses.filter((b) => b.routeId === route.id);

          return (
            <div
              key={route.id}
              onClick={() => handleSelectRoute(route)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/40 shadow-sm ring-1 ring-sky-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Route code & category */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {route.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-sky-600" />
                    <b>{activeUnitsOnRoute.length}</b> buses
                  </span>
                </div>
              </div>

              {/* Route Name */}
              <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">
                {route.name}
              </h3>

              {/* Metrics metadata (Clean unboxed inline metadata according to frontend constitution) */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-slate-400" />
                  {route.lengthKm} km
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  cada {route.frequencyMinutes}
                </span>
                <span aria-hidden="true">·</span>
                <span>Tarifa ref: S/ {route.fixedFare.toFixed(2)}</span>
              </div>

              {/* Stops list preview if selected */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-sky-100/80 space-y-2 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block">
                    Secuencia de Paraderos Autorizados ({route.stops.length}):
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {route.stops.map((stop: BusStop) => (
                      <div
                        key={stop.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-100 text-xs text-slate-700"
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: route.color }}
                        >
                          {stop.order}
                        </span>
                        <span className="font-medium flex-1 truncate">{stop.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {stop.district}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('map');
                    }}
                    className="w-full mt-2 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ver Trazado Completo en el Mapa</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
