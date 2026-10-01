import React from 'react';
import { useApp } from '../../context/AppContext';
import { EnrutaLogo } from './EnrutaLogo';
import {
  Users,
  Bus,
  Shield,
  LogOut,
  Radio,
  ArrowLeftRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    logout,
    myDriverBus,
  } = useApp();

  const roleConfigs = {
    pasajero: {
      label: 'Modo Pasajero',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <Users className="w-3.5 h-3.5 text-emerald-600" />,
      subtext: 'Arequipa Urbana',
    },
    conductor: {
      label: 'Cabina del Conductor',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <Bus className="w-3.5 h-3.5 text-sky-600" />,
      subtext: `Unidad ${myDriverBus.plate} (${myDriverBus.routeCode})`,
    },
    admin: {
      label: 'Consola Administrativa',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <Shield className="w-3.5 h-3.5 text-slate-700" />,
      subtext: 'Supervisión SIT',
    },
  }[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <EnrutaLogo size="md" showTagline={true} />
        </div>

        {/* Current Active Role Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${roleConfigs.badgeClass}`}
          >
            {roleConfigs.icon}
            <div className="flex flex-col text-left leading-none">
              <span>{roleConfigs.label}</span>
              <span className="text-[10px] opacity-75 font-normal">
                {roleConfigs.subtext}
              </span>
            </div>
          </div>

          {/* Telemetry live status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>SIT Conectado</span>
          </div>
        </div>

        {/* User Profile and Logout Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col text-right leading-none">
            <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {currentUser.role}
            </span>
          </div>

          {/* Logout / Switch Role Button */}
          <button
            onClick={logout}
            title="Cerrar sesión y cambiar de perfil"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl font-bold text-xs transition-all border border-slate-200"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cambiar Rol</span>
            <LogOut className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
