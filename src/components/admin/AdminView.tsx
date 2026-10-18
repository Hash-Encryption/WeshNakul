import React, { useState, useEffect } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { verifyAdminSession } from '../../services/adminService';
import { AdminLocaleProvider, useAdminLocale } from '../../context/AdminLocaleContext';
import type { AdminUser } from '../../types/admin';

interface AdminViewProps {
  onExit: () => void;
}

const AdminViewInner: React.FC<AdminViewProps> = ({ onExit }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const { t } = useAdminLocale();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const user = await verifyAdminSession();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex flex-col items-center justify-center p-4">
        <CircleNotch size={36} className="animate-spin text-brand-red mb-3" />
        <p className="text-sm font-semibold text-brand-ink font-alexandria">
          {t('verifyingAdmin')}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminLogin
        onSuccess={(user) => setCurrentUser(user)}
        onExit={onExit}
      />
    );
  }

  return (
    <AdminDashboard
      user={currentUser}
      onLogout={() => setCurrentUser(null)}
      onExit={onExit}
    />
  );
};

export const AdminView: React.FC<AdminViewProps> = (props) => {
  return (
    <AdminLocaleProvider>
      <AdminViewInner {...props} />
    </AdminLocaleProvider>
  );
};
