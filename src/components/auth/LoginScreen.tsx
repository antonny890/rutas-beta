import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EnrutaLogo } from '../common/EnrutaLogo';
import {
  Users,
  Bus,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginAsRole, loginAs, registeredUsers, showToast } = useApp();

  // Selected role toggle: 'pasajero' | 'conductor'
  const [selectedRole, setSelectedRole] = useState<'pasajero' | 'conductor'>('pasajero');

  // Input states
  const [emailOrDni, setEmailOrDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin login modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@enruta.pe');
  const [adminPassword, setAdminPassword] = useState('');

  // Handle Google Login for selected role
  const handleGoogleLogin = () => {
    if (selectedRole === 'pasajero') {
      const passengerUser = registeredUsers.find((u) => u.role === 'pasajero') || {
        id: 'usr-google-pass',
        name: 'Usuario Google Pasajero',
        email: 'pasajero@gmail.com',
        role: 'pasajero' as const,
      };
      loginAs(passengerUser);
      showToast('Autenticado con Google exitosamente como Pasajero', 'success');
    } else {
      const driverUser = registeredUsers.find((u) => u.role === 'conductor') || {
        id: 'usr-google-driver',
        name: 'Frank Davis Mamani (Conductor)',
        email: 'conductor@gmail.com',
        role: 'conductor' as const,
      };
      loginAs(driverUser);
      showToast('Autenticado con Google exitosamente como Conductor SIT', 'success');
    }
  };

  // Handle Email / DNI Login
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'pasajero') {
      const name = emailOrDni.trim() ? emailOrDni.split('@')[0] : 'Pasajero Arequipa';
      loginAsRole('pasajero', name);
    } else {
      // Find matching driver by DNI or email, or default to main driver
      const foundDriver = registeredUsers.find(
        (u) => u.role === 'conductor' && (u.dni === emailOrDni || u.email === emailOrDni)
      );

      if (foundDriver) {
        loginAs(foundDriver);
      } else {
        loginAsRole('conductor');
      }
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = registeredUsers.find((u) => u.role === 'admin') || {
      id: 'admin-01',
      name: 'Victor Alfonzo Cornejo',
      email: adminEmail,
      role: 'admin' as const,
    };
    loginAs(adminUser);
    setIsAdminModalOpen(false);
    showToast('Bienvenido a la Consola Administrativa SIT', 'success');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-200 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Bar with Admin quick button */}
      <div className="w-full max-w-md flex justify-end pt-2">
        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          <span>Acceso Administrador SIT</span>
        </button>
      </div>

      {/* Main Unified Login Card (One Single Card) */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div
            className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
              selectedRole === 'pasajero' ? 'bg-emerald-500/15' : 'bg-sky-500/15'
            }`}
          />

          {/* Logo Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-block">
              <EnrutaLogo size="lg" showTagline={true} variant="full" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedRole === 'pasajero'
                ? 'Monitorea rutas en vivo y calcula tu costo justo'
                : 'Controla tu aforo a bordo y comparte telemetría GPS'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-300 rounded-2xl font-bold text-xs text-slate-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                Continuar con Google como{' '}
                <b className="capitalize">{selectedRole}</b>
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              O con credenciales
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-3.5">
            {/* Input 1: Correo o DNI */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedRole === 'pasajero' ? 'Correo o Nombre:' : 'DNI de Conductor o Correo:'}
              </label>
              <div className="relative">
                {selectedRole === 'pasajero' ? (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                ) : (
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                )}
                <input
                  type={selectedRole === 'pasajero' ? 'text' : 'text'}
                  placeholder={
                    selectedRole === 'pasajero'
                      ? 'ej. valeria@gmail.com o tu nombre'
                      : 'ej. 72918452 (DNI registrado)'
                  }
                  value={emailOrDni}
                  onChange={(e) => setEmailOrDni(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Driver Assigned Bus Info */}
            {selectedRole === 'conductor' && (
              <div className="p-2.5 bg-sky-50 border border-sky-200/80 rounded-xl text-xs flex items-center justify-between text-sky-900">
                <span className="text-[11px] font-medium text-slate-600">Unidad vinculada:</span>
                <span className="font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 text-[11px]">
                  Placa V8Z-954 · Troncal C-1
                </span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 font-bold text-xs text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
                selectedRole === 'pasajero'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
              }`}
            >
              <span>
                {selectedRole === 'pasajero'
                  ? 'Ingresar como Pasajero'
                  : 'Ingresar a Cabina del Conductor'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick guest bypass for passenger */}
          {selectedRole === 'pasajero' && (
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={() => loginAsRole('pasajero', 'Pasajero Invitado')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                Entrar directo como invitado (Ver Mapa y Tarifas)
              </button>
            </div>
          )}

          {/* LAS 2 OPCIONES ABAJITO: PASAJERO | CONDUCTOR (As requested in feedback image) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tipo de Acceso
            </span>

            {/* Segmented 2-option selector button group */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedRole('pasajero')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedRole === 'pasajero'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pasajero</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('conductor')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedRole === 'conductor'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Conductor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center pb-2 text-[11px] text-slate-400">
        Sistema ENRUTA · Universidad Continental · Arequipa, Perú
      </div>

      {/* Admin Login Modal (RF-4.2 / UI-02) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Acceso Administrativo SIT
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Parametrización y Padrón
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Usuario Administrador:
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contraseña de Seguridad:
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                Permite configurar tarifas por km, auditar la flota vehicular y registrar conductores autorizados.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Acceder al Panel de Control SIT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
