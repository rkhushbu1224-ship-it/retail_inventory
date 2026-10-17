import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import { LoginPage } from './components/auth/LoginPage';
import { RetailMainView } from './components/retail/RetailMainView';

const Gate: React.FC = () => {
  const { user } = useAuth();
  return user ? <RetailMainView /> : <LoginPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </AuthProvider>
  );
}
