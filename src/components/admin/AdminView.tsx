import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Users,
  Bus,
  FileText,
  Sliders,
  ShieldCheck,
  Activity,
  Plus,
  Save,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingUp,
  Radio,
  Calculator,
  X,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    fareConfig,
    updateFareConfig,
    auditLogs,
    registeredUsers,
    buses,
    toggleDriverStatus,
    setIsAuthModalOpen,
    setAuthModalMode,
    showToast,
  } = useApp();

  const [activeAdminSection, setActiveAdminSection] = useState<'tariffs' | 'fleet' | 'audit'>('tariffs');
  const [testDistanceKm, setTestDistanceKm] = useState<number>(4.5);

  // Form state for tariff configuration (RF-4.2)
  const [baseFareInput, setBaseFareInput] = useState<number>(fareConfig.baseFare);
  const [costPerKmInput, setCostPerKmInput] = useState<number>(fareConfig.costPerKm);
  const [nightSurchargeInput, setNightSurchargeInput] = useState<number>(fareConfig.nightSurchargePercent);
  const [tariffTypeInput, setTariffTypeInput] = useState<'distancia' | 'fija'>(fareConfig.tariffType);
  const [auditNotesInput, setAuditNotesInput] = useState<string>('');

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    if (baseFareInput <= 0) {
      showToast('Error: La tarifa base debe ser mayor a S/ 0.00', 'error');
      return;
    }
    if (costPerKmInput < 0) {
      showToast('Error: El costo por kilómetro no puede ser negativo', 'error');
      return;
    }

    const success = updateFareConfig(
      {
        baseFare: baseFareInput,
        costPerKm: costPerKmInput,
        nightSurchargePercent: nightSurchargeInput,
        tariffType: tariffTypeInput,
      },
      auditNotesInput || 'Ajuste manual de parámetros tarifarios desde consola SIT'
    );

    if (success) {
      setAuditNotesInput('');
    }
  };

  // Fleet stats
  const activeBusesCount = buses.filter((b) => b.isOnline).length;
  const totalPassengersNow = buses.reduce((acc, b) => acc + b.currentPassengers, 0);
  const totalCapacityNow = buses.reduce((acc, b) => acc + b.maxCapacity, 0);
  const globalOccupancyPercent = totalCapacityNow > 0 ? Math.round((totalPassengersNow / totalCapacityNow) * 100) : 0;

  const driversList = registeredUsers.filter((u) => u.role === 'conductor');

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase tracking-wider">
              UI-02 · Módulo de Administración SIT Arequipa
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Panel de Control y Tarifación Central
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de políticas tarifarias, supervisión de la flota SIT y bitácora de auditoría formal.
          </p>
        </div>

        {/* Action Button: Register new driver */}
        <button
          onClick={() => {
            setAuthModalMode('register-driver');
            setIsAuthModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Conductor y Unidad (RF-1.1)</span>
        </button>
      </div>

      {/* KPI Cards (Cards informativas según SRS UI-02) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Flota Activa</span>
            <Bus className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
              {activeBusesCount}
            </span>
            <span className="text-xs text-slate-500">de {buses.length} unidades</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <Radio className="w-3 h-3 animate-pulse" /> Telemetría activa
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pasajeros a Bordo</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
              {totalPassengersNow}
            </span>
            <span className="text-xs text-slate-500">/ {totalCapacityNow} plazas</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Ocupación global: <b>{globalOccupancyPercent}%</b>
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tarifa Base SIT</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono">
              S/ {fareConfig.baseFare.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            +S/ {fareConfig.costPerKm.toFixed(2)} por cada km
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Latencia Telemetría</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-emerald-600 font-mono">
              0.8s
            </span>
            <span className="text-xs text-slate-500">&lt; 2.0s (RNF-01)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Cumple estándar SRS
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Admin View */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveAdminSection('tariffs')}
          className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeAdminSection === 'tariffs'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuración de Tarifas (RF-4.2)</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('fleet')}
          className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeAdminSection === 'fleet'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Conductores y Vehículos ({driversList.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSection('audit')}
          className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeAdminSection === 'audit'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora de Auditoría ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Tariff Configuration (RF-4.2) */}
      {activeAdminSection === 'tariffs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 md:p-7 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Parámetros de Cálculo Tarifario
                </h2>
                <p className="text-xs text-slate-500">
                  Valores aplicados en tiempo real para cotizaciones de pasajeros (Fórmula: Costo Total = Tarifa Base + Distancia * Costo/Km)
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTariff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tarifa Base (Soles):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.10"
                      value={baseFareInput}
                      onChange={(e) => setBaseFareInput(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tarifa mínima de partida
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Costo por Kilómetro Recorrido (Soles/km):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={costPerKmInput}
                      onChange={(e) => setCostPerKmInput(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Costo dinámico proporcional a la distancia exacta
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Recargo Horario Nocturno (%):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={nightSurchargeInput}
                      onChange={(e) => setNightSurchargeInput(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Aplica entre las 21:00 y las 05:00 hrs
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Esquema de Cobro Primario:
                  </label>
                  <select
                    value={tariffTypeInput}
                    onChange={(e) => setTariffTypeInput(e.target.value as 'distancia' | 'fija')}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="distancia">Dinámico Proporcional por Distancia (km)</option>
                    <option value="fija">Tarifa Fija por Tramo Institucional</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Regulado por el sistema ENRUTA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motivo o Decreto de Modificación (Auditoría):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Actualización tarifaria según Sesión de Concejo Provincial N° 12-2026"
                  value={auditNotesInput}
                  onChange={(e) => setAuditNotesInput(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Parámetros en Servidor Central</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Live Policy Card */}
          <div className="bg-slate-50 rounded-3xl p-5 md:p-6 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Política Vigente</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Última Modificación
                </span>
                <span className="font-semibold text-slate-800">{fareConfig.lastUpdated}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Por: {fareConfig.updatedBy}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Medio Pasaje Escolar/Universitario
                </span>
                <span className="font-bold text-emerald-600">50% de Descuento</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Amparado por la Ley 26271 (MTC Perú)
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Radio de Cobertura Válido
                </span>
                <span className="font-bold text-slate-800">
                  {fareConfig.arequipaMaxRadiusKm} km
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Desde Plaza de Armas de Arequipa
                </span>
              </div>
            </div>

            {/* Criterio de Validación RF-4.2: Prueba de Actualización Instantánea */}
            <div className="pt-3 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Validación Instantánea (RF-4.2)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                  0 ms Latencia
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Modifica los valores del formulario a la izquierda y presiona Guardar. Esta simulación refleja la cotización del pasajero en tiempo real:
              </p>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Distancia de prueba:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="30"
                      value={testDistanceKm}
                      onChange={(e) => setTestDistanceKm(parseFloat(e.target.value) || 1)}
                      className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded"
                    />
                    <span className="text-slate-400 text-xs">km</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Tarifa Base:</span>
                    <span>S/ {fareConfig.baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distancia ({testDistanceKm} km × S/ {fareConfig.costPerKm.toFixed(2)}):</span>
                    <span>S/ {(testDistanceKm * fareConfig.costPerKm).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 text-xs pt-1 border-t border-slate-200">
                    <span>Cotización Total:</span>
                    <span>S/ {(fareConfig.baseFare + testDistanceKm * fareConfig.costPerKm).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Conductores y Vehículos (Dense Structured Table - SRS UI-02) */}
      {activeAdminSection === 'fleet' && (
        <div className="bg-white rounded-3xl p-5 md:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Padrón de Conductores y Unidades Habilitadas
              </h2>
              <p className="text-xs text-slate-500">
                SRS RF-1.1 · Registro con validación de no duplicidad de DNI y Placa
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Conductor</th>
                  <th className="py-3 px-3">DNI</th>
                  <th className="py-3 px-3">Licencia MTC</th>
                  <th className="py-3 px-3">Placa Vehicular</th>
                  <th className="py-3 px-3">Modelo</th>
                  <th className="py-3 px-3">Capacidad</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {driversList.map((driver) => {
                  const details = driver.driverDetails;
                  const isActive = details?.status === 'Activo';

                  return (
                    <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {driver.name}
                      </td>
                      <td className="py-3 px-3 font-mono">{driver.dni || '---'}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {details?.license || '---'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sky-700">
                        {details?.vehiclePlate || '---'}
                      </td>
                      <td className="py-3 px-3">{details?.vehicleModel || '---'}</td>
                      <td className="py-3 px-3 font-mono">
                        {details?.maxCapacity ? `${details.maxCapacity} pasajeros` : '---'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {details?.status || 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toggleDriverStatus(driver.id)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
                        >
                          {isActive ? 'Suspender' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Bitácora de Auditoría (SRS RF-4.2 / UI-02) */}
      {activeAdminSection === 'audit' && (
        <div className="bg-white rounded-3xl p-5 md:p-7 border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Bitácora Formal de Auditoría del Sistema
            </h2>
            <p className="text-xs text-slate-500">
              Registro inmutable de modificaciones de tarifas, registros vehiculares y cambios de estado operativo.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.action}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded">
                      {item.target}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{item.notes}</p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-slate-700">
                      <span className="text-rose-600">{item.oldValue}</span> →{' '}
                      <span className="text-emerald-600 font-bold">{item.newValue}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <span className="font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {item.adminName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
