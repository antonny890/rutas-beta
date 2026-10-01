import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Map,
  Calculator,
  Route,
  Gauge,
  Users,
  Compass,
  Sliders,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentRole, activeTab, setActiveTab } = useApp();

  if (currentRole === 'admin') return null; // Admin uses sidebar / dense navigation

  const passengerTabs = [
    { id: 'map', label: 'Mapa en Vivo', icon: <Map className="w-5 h-5" /> },
    { id: 'plan', label: 'Calcular Tarifa', icon: <Calculator className="w-5 h-5" /> },
    { id: 'routes', label: 'Rutas SIT', icon: <Route className="w-5 h-5" /> },
  ];

  const driverTabs = [
    { id: 'hud', label: 'Cabina / HUD', icon: <Gauge className="w-5 h-5" /> },
    { id: 'map', label: 'Mapa de Flota', icon: <Compass className="w-5 h-5" /> },
  ];

  const currentTabs = currentRole === 'conductor' ? driverTabs : passengerTabs;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {currentTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
