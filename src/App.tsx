/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { PassengerView } from './components/passenger/PassengerView';
import { DriverView } from './components/driver/DriverView';
import { AdminView } from './components/admin/AdminView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, currentRole, activeTab } = useApp();

  // If user hasn't logged in, show the 2-option selection portal (Pasajero / Conductor)
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
        <AuthModal />
      </>
    );
  }

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Universal Header with Logo and Active Role Status */}
      <Header />

      {/* Main Role-Specific Workspace - strict full height */}
      <main className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
        {currentRole === 'pasajero' && <PassengerView />}

        {currentRole === 'conductor' && (
          <div className="flex-1 w-full h-full overflow-y-auto">
            {activeTab === 'map' ? <PassengerView /> : <DriverView />}
          </div>
        )}

        {currentRole === 'admin' && (
          <div className="flex-1 w-full h-full overflow-y-auto">
            <AdminView />
          </div>
        )}
      </main>

      {/* Mobile Ergonomic Bottom Navigation (UI-01) */}
      <BottomNav />

      {/* Snackbars / Toast Notifications */}
      <ToastContainer />

      {/* Authentication and Driver Registration Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
