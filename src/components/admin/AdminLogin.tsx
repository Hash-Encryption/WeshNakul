import React, { useState } from 'react';
import { ShieldCheck, LockKey, Envelope, ArrowLeft, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { adminLogin } from '../../services/adminService';
import type { AdminUser } from '../../types/admin';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('الرجاء إدخال كلمة المرور / Please enter a password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await adminLogin(password, email);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col justify-center items-center p-4 selection:bg-brand-redSoft">
      <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 text-sm font-medium text-brand-gray hover:text-brand-ink transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>العودة للتطبيق / Back to App</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-redSoft text-brand-red text-xs font-semibold">
            <ShieldCheck size={14} weight="bold" />
            <span>Admin Gateway</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFF0EE] text-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#F2E8DF] shadow-sm">
            <LockKey size={32} weight="duotone" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink tracking-tight font-alexandria">
            لوحة تحليلات وش ناكل
          </h1>
          <p className="text-sm text-brand-gray mt-1">
            WeshNakul Secure Admin Analytics & Operations Console
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <WarningCircle size={20} className="shrink-0 mt-0.5" weight="fill" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
              البريد الإلكتروني أو اسم المستخدم / Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@weshnakul.com"
                disabled={isSubmitting}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-brand-border bg-white text-brand-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red text-sm transition-all"
              />
              <Envelope size={18} className="absolute left-3.5 top-3.5 text-brand-gray" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-ink uppercase tracking-wider mb-2">
              كلمة المرور الإدارية / Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-brand-border bg-white text-brand-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red text-sm transition-all"
              />
              <LockKey size={18} className="absolute left-3.5 top-3.5 text-brand-gray" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-red hover:bg-brand-redPressed text-white font-semibold text-sm shadow-tactile-red transition-all duration-150 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>جاري التحقق من الصلاحيات...</span>
              </>
            ) : (
              <span>تسجيل الدخول الإداري / Access Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border text-center text-xs text-brand-gray space-y-1">
          <p className="font-medium text-stone-600">Strictly Restricted Access</p>
          <p>Protected by server-side authorization and edge boundary rate-limiting.</p>
        </div>
      </div>
    </div>
  );
};
