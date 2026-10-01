import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  TransitRoute,
  BusTelemetry,
  FareConfig,
  AuditLogItem,
  TripQuote,
} from '../types';
import {
  MOCK_ROUTES,
  INITIAL_BUSES,
  INITIAL_FARE_CONFIG,
  INITIAL_AUDIT_LOGS,
  DEFAULT_USERS,
} from '../data/mockData';
import { getOccupancyLevel } from '../utils/geoUtils';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  routes: TransitRoute[];
  selectedRoute: TransitRoute | null;
  setSelectedRoute: (route: TransitRoute | null) => void;
  buses: BusTelemetry[];
  selectedBus: BusTelemetry | null;
  setSelectedBus: (bus: BusTelemetry | null) => void;
  fareConfig: FareConfig;
  updateFareConfig: (newConfig: Partial<FareConfig>, notes?: string) => boolean;
  auditLogs: AuditLogItem[];
  registeredUsers: UserProfile[];
  registerDriverAndVehicle: (driverData: {
    dni: string;
    name: string;
    license: string;
    vehiclePlate: string;
    vehicleModel: string;
    maxCapacity: number;
    email: string;
  }) => { success: boolean; message: string };
  toggleDriverStatus: (driverId: string) => void;
  driverPassengerCount: number;
  updateDriverPassengerCount: (delta: number) => { success: boolean; message: string };
  setDriverPassengerCountDirect: (count: number) => { success: boolean; message: string };
  isDriverGpsSharing: boolean;
  setIsDriverGpsSharing: (sharing: boolean) => void;
  activeTripQuote: TripQuote | null;
  setActiveTripQuote: (quote: TripQuote | null) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register-driver';
  setAuthModalMode: (mode: 'login' | 'register-driver') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  loginAsRole: (role: UserRole, customName?: string) => void;
  loginAs: (user: UserProfile) => void;
  logout: () => void;
  myDriverBus: BusTelemetry;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]); // Starts as Pasajero
  const [currentRole, setCurrentRoleState] = useState<UserRole>('pasajero');
  const [activeTab, setActiveTab] = useState<string>('map');

  const [routes] = useState<TransitRoute[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);

  const [buses, setBuses] = useState<BusTelemetry[]>(INITIAL_BUSES);
  const [selectedBus, setSelectedBus] = useState<BusTelemetry | null>(null);

  const [fareConfig, setFareConfig] = useState<FareConfig>(INITIAL_FARE_CONFIG);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Driver onboard state (bound to bus-01 V8Z-954 Frank Davis Mamani)
  const [driverPassengerCount, setDriverPassengerCount] = useState<number>(12);
  const [isDriverGpsSharing, setIsDriverGpsSharing] = useState<boolean>(true);

  // Trip planner state
  const [activeTripQuote, setActiveTripQuote] = useState<TripQuote | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register-driver'>('login');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    // Find matching profile or assign role
    const matched = registeredUsers.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser({
        id: `user-${role}`,
        name: role === 'conductor' ? 'Conductor SIT' : role === 'admin' ? 'Administrador SIT' : 'Usuario Pasajero',
        email: `${role}@enruta.pe`,
        role,
      });
    }

    // Adjust active tab default based on role
    if (role === 'pasajero') setActiveTab('map');
    else if (role === 'conductor') setActiveTab('hud');
    else if (role === 'admin') setActiveTab('tariffs');

    showToast(`Cambiado a Modo ${role.toUpperCase()}`, 'info');
  };

  const loginAsRole = (role: UserRole, customName?: string) => {
    setIsAuthenticated(true);
    setCurrentRoleState(role);
    const matched = registeredUsers.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(customName ? { ...matched, name: customName } : matched);
    } else {
      setCurrentUser({
        id: `user-${role}-${Date.now()}`,
        name: customName || (role === 'conductor' ? 'Conductor SIT' : role === 'admin' ? 'Administrador SIT' : 'Usuario Pasajero'),
        email: `${role}@enruta.pe`,
        role,
      });
    }

    if (role === 'pasajero') {
      setActiveTab('map');
      showToast('Bienvenido a ENRUTA como Pasajero. Mapa de Arequipa cargado.', 'success');
    } else if (role === 'conductor') {
      setActiveTab('hud');
      showToast('Sesión de Conductor iniciada · Unidad V8Z-954 activa.', 'success');
    } else if (role === 'admin') {
      setActiveTab('tariffs');
      showToast('Sesión Administrativa SIT Arequipa iniciada.', 'success');
    }
  };

  const loginAs = (user: UserProfile) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentRoleState(user.role);
    if (user.role === 'pasajero') setActiveTab('map');
    else if (user.role === 'conductor') setActiveTab('hud');
    else if (user.role === 'admin') setActiveTab('tariffs');
    setIsAuthModalOpen(false);
    showToast(`Sesión iniciada: ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Sesión finalizada. Regresando al portal de acceso.', 'info');
  };

  // RF-1.1: Register Conductor y Vehículo
  const registerDriverAndVehicle = (driverData: {
    dni: string;
    name: string;
    license: string;
    vehiclePlate: string;
    vehicleModel: string;
    maxCapacity: number;
    email: string;
  }): { success: boolean; message: string } => {
    // 1. Validar sintaxis
    const cleanDni = driverData.dni.trim();
    const cleanPlate = driverData.vehiclePlate.trim().toUpperCase();

    if (!/^\d{8}$/.test(cleanDni)) {
      return { success: false, message: 'El DNI debe contener exactamente 8 dígitos numéricos.' };
    }
    if (!/^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(cleanPlate)) {
      return { success: false, message: 'La placa vehicular debe tener formato válido (Ej. V8Z-954).' };
    }
    if (!driverData.name.trim() || !driverData.license.trim()) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
    }
    if (driverData.maxCapacity <= 5 || driverData.maxCapacity > 100) {
      return { success: false, message: 'La capacidad de pasajeros debe ser entre 6 y 100.' };
    }

    // 2. Verificar duplicidad de DNI o Placa en base de datos
    const dniExists = registeredUsers.some((u) => u.dni === cleanDni);
    if (dniExists) {
      return { success: false, message: `Error: Ya existe un conductor registrado con el DNI ${cleanDni}.` };
    }
    const plateExists = buses.some((b) => b.plate === cleanPlate);
    if (plateExists) {
      return { success: false, message: `Error: Ya existe un vehículo registrado con la placa ${cleanPlate}.` };
    }

    // 3. Registrar conductor y vehículo con estado "Activo"
    const newUserId = `usr-${Date.now()}`;
    const newBusId = `bus-${Date.now()}`;

    const newProfile: UserProfile = {
      id: newUserId,
      name: driverData.name.trim(),
      email: driverData.email || `${cleanDni}@enruta.pe`,
      role: 'conductor',
      dni: cleanDni,
      token: `jwt_${Math.random().toString(36).substring(2)}`,
      driverDetails: {
        license: driverData.license.trim().toUpperCase(),
        vehiclePlate: cleanPlate,
        vehicleModel: driverData.vehicleModel.trim() || 'Minibús Urbano',
        maxCapacity: driverData.maxCapacity,
        status: 'Activo',
      },
    };

    const newBus: BusTelemetry = {
      id: newBusId,
      plate: cleanPlate,
      driverName: driverData.name.trim(),
      driverDni: cleanDni,
      routeId: 'route-c1',
      routeCode: 'C-1',
      lat: -16.3988,
      lng: -71.5369,
      speedKmH: 0,
      headingDeg: 0,
      currentPassengers: 0,
      maxCapacity: driverData.maxCapacity,
      occupancy: 'libre',
      lastUpdated: 'Recién registrado',
      isOnline: true,
      model: driverData.vehicleModel.trim() || 'Minibús Urbano',
    };

    setRegisteredUsers((prev) => [...prev, newProfile]);
    setBuses((prev) => [...prev, newBus]);

    // Append to audit log
    const auditItem: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-PE'),
      adminName: currentUser.name || 'Sistema ENRUTA',
      action: 'Registro Conductor/Vehículo',
      target: `${cleanPlate} (${driverData.name})`,
      oldValue: 'Inexistente',
      newValue: 'Activo',
      notes: `DNI ${cleanDni} · Licencia ${driverData.license}`,
    };
    setAuditLogs((prev) => [auditItem, ...prev]);

    return { success: true, message: `Conductor ${driverData.name} y vehículo ${cleanPlate} registrados con éxito.` };
  };

  const toggleDriverStatus = (driverId: string) => {
    setRegisteredUsers((prev) =>
      prev.map((user) => {
        if (user.id === driverId && user.driverDetails) {
          const nextStatus = user.driverDetails.status === 'Activo' ? 'Inactivo' : 'Activo';
          return {
            ...user,
            driverDetails: {
              ...user.driverDetails,
              status: nextStatus,
            },
          };
        }
        return user;
      })
    );
  };

  // RF-2.2: Gestionar Número de Pasajeros por el Conductor
  const myDriverBus = buses.find((b) => b.id === 'bus-01') || buses[0];

  const updateDriverPassengerCount = (delta: number) => {
    const newCount = driverPassengerCount + delta;
    if (newCount < 0) {
      return { success: false, message: 'La cantidad de pasajeros no puede ser menor a cero.' };
    }
    if (newCount > myDriverBus.maxCapacity) {
      return {
        success: false,
        message: `¡Alerta de exceso! La capacidad máxima declarada es de ${myDriverBus.maxCapacity} pasajeros.`,
      };
    }

    setDriverPassengerCount(newCount);
    // Update bus state and occupancy in real time
    const newOccupancy = getOccupancyLevel(newCount, myDriverBus.maxCapacity);
    setBuses((prev) =>
      prev.map((b) =>
        b.id === myDriverBus.id
          ? {
              ...b,
              currentPassengers: newCount,
              occupancy: newOccupancy,
              lastUpdated: 'Hace un instante',
            }
          : b
      )
    );

    return { success: true, message: `Ocupación actualizada: ${newCount}/${myDriverBus.maxCapacity} (${newOccupancy.toUpperCase()})` };
  };

  const setDriverPassengerCountDirect = (count: number) => {
    if (count < 0) {
      return { success: false, message: 'El contador no puede ser negativo.' };
    }
    if (count > myDriverBus.maxCapacity) {
      return {
        success: false,
        message: `¡Capacidad excedida! Límite: ${myDriverBus.maxCapacity} pasajeros.`,
      };
    }
    setDriverPassengerCount(count);
    const newOccupancy = getOccupancyLevel(count, myDriverBus.maxCapacity);
    setBuses((prev) =>
      prev.map((b) =>
        b.id === myDriverBus.id
          ? {
              ...b,
              currentPassengers: count,
              occupancy: newOccupancy,
              lastUpdated: 'Hace un instante',
            }
          : b
      )
    );
    return { success: true, message: `Ocupación fijada en ${count} pasajeros.` };
  };

  // RF-4.2: Configurar Tarifas y Tramos (Administrador)
  const updateFareConfig = (newVals: Partial<FareConfig>, notes?: string): boolean => {
    // Validate positive numbers
    if (newVals.baseFare !== undefined && newVals.baseFare <= 0) {
      showToast('La Tarifa Base debe ser un valor positivo (> 0).', 'error');
      return false;
    }
    if (newVals.costPerKm !== undefined && newVals.costPerKm < 0) {
      showToast('El costo por kilómetro no puede ser negativo.', 'error');
      return false;
    }

    const previousConfig = { ...fareConfig };
    const updated = {
      ...fareConfig,
      ...newVals,
      lastUpdated: new Date().toLocaleDateString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      updatedBy: currentUser.name || 'Administrador',
    };

    setFareConfig(updated);

    // Register in audit log
    const changedKeys = Object.keys(newVals) as (keyof FareConfig)[];
    changedKeys.forEach((key) => {
      const oldVal = previousConfig[key];
      const newVal = newVals[key];
      if (oldVal !== newVal) {
        const auditItem: AuditLogItem = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleString('es-PE'),
          adminName: currentUser.name || 'Admin SIT',
          action: 'Actualización Parámetros Tarifarios',
          target: String(key),
          oldValue: String(oldVal),
          newValue: String(newVal),
          notes: notes || 'Modificación manual desde panel de administración',
        };
        setAuditLogs((prev) => [auditItem, ...prev]);
      }
    });

    showToast('Tarifa parametrizada correctamente', 'success');
    return true;
  };

  // RNF-01: Latency < 2s simulation of GPS position streaming for active buses
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (!bus.isOnline) return bus;

          // Tiny realistic jitter along the road
          const latJitter = (Math.random() - 0.5) * 0.0003;
          const lngJitter = (Math.random() - 0.5) * 0.0003;
          const speedVariation = Math.max(8, Math.min(55, bus.speedKmH + Math.round((Math.random() - 0.5) * 6)));

          return {
            ...bus,
            lat: Number((bus.lat + latJitter).toFixed(6)),
            lng: Number((bus.lng + lngJitter).toFixed(6)),
            speedKmH: speedVariation,
            lastUpdated: 'Hace 1 seg',
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        currentRole,
        setCurrentRole,
        loginAsRole,
        activeTab,
        setActiveTab,
        routes,
        selectedRoute,
        setSelectedRoute,
        buses,
        selectedBus,
        setSelectedBus,
        fareConfig,
        updateFareConfig,
        auditLogs,
        registeredUsers,
        registerDriverAndVehicle,
        toggleDriverStatus,
        driverPassengerCount,
        updateDriverPassengerCount,
        setDriverPassengerCountDirect,
        isDriverGpsSharing,
        setIsDriverGpsSharing,
        activeTripQuote,
        setActiveTripQuote,
        toasts,
        showToast,
        removeToast,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        loginAs,
        logout,
        myDriverBus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
