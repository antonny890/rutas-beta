import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_USERS } from '../../data/mockData';
import { EnrutaLogo } from '../common/EnrutaLogo';
import {
  X,
  Lock,
  User,
  Shield,
  CreditCard,
  Car,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginAs,
    registerDriverAndVehicle,
    showToast,
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Driver form state (RF-1.1)
  const [regDni, setRegDni] = useState('');
  const [regName, setRegName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regModel, setRegModel] = useState('');
  const [regCapacity, setRegCapacity] = useState<number>(32);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast('Por favor ingrese su correo o usuario.', 'error');
      return;
    }
    // Simulate JWT authentication
    const userRole = loginEmail.includes('admin')
      ? 'admin'
      : loginEmail.includes('conductor')
      ? 'conductor'
      : 'pasajero';

    loginAs({
      id: `usr-${Date.now()}`,
      name: loginEmail.split('@')[0],
      email: loginEmail,
      role: userRole,
      token: `jwt_token_${Date.now()}`,
    });
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const result = registerDriverAndVehicle({
      dni: regDni,
      name: regName,
      license: regLicense,
      vehiclePlate: regPlate,
      vehicleModel: regModel,
      maxCapacity: Number(regCapacity),
      email: `${regDni}@enruta.pe`,
    });

    if (!result.success) {
      setRegError(result.message);
      showToast(result.message, 'error');
    } else {
      showToast(result.message, 'success');
      // Reset form
      setRegDni('');
      setRegName('');
      setRegLicense('');
      setRegPlate('');
      setRegModel('');
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Top Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <EnrutaLogo size="sm" showTagline={false} />
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setRegError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              authModalMode === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión (RF-1.2)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register-driver');
              setRegError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              authModalMode === 'register-driver'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Registrar Conductor (RF-1.1)
          </button>
        </div>

        {/* Tab 1: Iniciar Sesión */}
        {authModalMode === 'login' ? (
          <div className="p-6 space-y-4">
            {/* Quick Demo Preset Accounts */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Acceso Rápido por Rol (Demostración de SRS):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => loginAs(usr)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
                  >
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      {usr.role}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {usr.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-bold">
                O ingresa credenciales
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico o Usuario:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="ej. pasajero@enruta.pe"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors mt-2"
              >
                Autenticar y Generar Token JWT
              </button>
            </form>
          </div>
        ) : (
          /* Tab 2: Registrar Conductor y Vehículo (RF-1.1) */
          <form onSubmit={handleRegisterDriver} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{regError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  DNI (8 dígitos): *
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="74859612"
                  value={regDni}
                  onChange={(e) => setRegDni(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Licencia de Conducir: *
                </label>
                <input
                  type="text"
                  placeholder="Q-74859612"
                  value={regLicense}
                  onChange={(e) => setRegLicense(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo del Conductor: *
              </label>
              <input
                type="text"
                placeholder="Ej. Jorge Ramírez Condori"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Placa del Vehículo: *
                </label>
                <input
                  type="text"
                  maxLength={7}
                  placeholder="V8Z-954"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sky-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capacidad Máxima: *
                </label>
                <input
                  type="number"
                  min={10}
                  max={90}
                  value={regCapacity}
                  onChange={(e) => setRegCapacity(parseInt(e.target.value) || 30)}
                  className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modelo / Fabricante:
              </label>
              <input
                type="text"
                placeholder="Ej. Hyundai County Urbano 2024"
                value={regModel}
                onChange={(e) => setRegModel(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              * El sistema validará la no duplicidad del DNI y Placa y habilitará la cuenta con estado "Activo" (SRS RF-1.1).
            </p>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors mt-2"
            >
              Registrar en Sistema SIT ENRUTA
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
