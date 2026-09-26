import React, { useState } from 'react';
import type { RestaurantItem } from '../../types/restaurant';
import type { OrderItem } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { Toast } from '../common/Toast';

export function formatWhatsAppOrder(
  restaurantName: string,
  orders: OrderItem[],
  roomCode: string
): string {
  const codeHeader = roomCode ? `رمز القروب: ${roomCode}\n` : '';
  const header = `🍔 *طلب القروب من ${restaurantName}*\n${codeHeader}━━━━━━━━━━━━━━\n`;

  if (!orders || orders.length === 0) {
    return `${header}⚠️ لم يسجل أحد طلبه بعد في القروب.\n━━━━━━━━━━━━━━\n📲 تم الترتيب عبر تطبيق "وش نطلب؟"`;
  }

  const itemsList = orders
    .map((item, idx) => {
      const notes = item.notes?.trim() ? `\n   📝 _(${item.notes.trim()})_` : '';
      return `${idx + 1}. *${item.participantName}*: ${item.itemName}${notes}`;
    })
    .join('\n');

  return `${header}${itemsList}\n━━━━━━━━━━━━━━\n📲 تم الترتيب عبر تطبيق "وش نطلب؟"`;
}

function extractBrandName(rawName: string): string {
  if (!rawName) return '';
  const parts = rawName.split(/\s*[-–—|]\s*|\s*\(/);
  return parts[0].trim();
}

function copyToClipboardSafe(text: string): void {
  if (!text) return;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      execFallbackCopy(text);
    });
  } else {
    execFallbackCopy(text);
  }
}

function execFallbackCopy(text: string): void {
  if (typeof document === 'undefined') return;
  try {
    const fallbackArea = document.createElement('textarea');
    fallbackArea.value = text;
    fallbackArea.style.position = 'fixed';
    fallbackArea.style.opacity = '0';
    document.body.appendChild(fallbackArea);
    fallbackArea.focus();
    fallbackArea.select();
    document.execCommand('copy');
    document.body.removeChild(fallbackArea);
  } catch {
    // ignore fallback error
  }
}

interface DeliveryLauncherProps {
  restaurant: RestaurantItem;
  orders: OrderItem[];
  roomCode: string;
  className?: string;
}

export const DeliveryLauncher: React.FC<DeliveryLauncherProps> = ({
  restaurant,
  orders,
  roomCode,
  className = '',
}) => {
  const { locale, t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fallbackSearchName = (locale === 'ar' ? restaurant.nameAr : restaurant.nameEn) || restaurant.name || '';
  const googleMapsUrl =
    restaurant.selectedBranch?.googleMapsUrl ||
    restaurant.links?.googleMaps ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackSearchName)}`;

  const rawBrandName = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;
  const brandName = extractBrandName(rawBrandName || restaurant.name || restaurant.nameAr || restaurant.nameEn || '');

  const handleDeliveryClick = () => {
    copyToClipboardSafe(brandName);
    setToastMessage(t('match.restaurant_name_copied'));
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleKeetaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    handleDeliveryClick();

    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

    if (isIOS || isAndroid) {
      e.preventDefault();
      const fallbackUrl = isIOS
        ? 'https://apps.apple.com/sa/app/keeta-food-delivery/id1662451643'
        : 'https://play.google.com/store/apps/details?id=com.sankuai.sailor.afooddelivery';

      const startTime = Date.now();
      let fallbackTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (!document.hidden && Date.now() - startTime < 2500) {
          window.location.href = fallbackUrl;
        }
      }, 1500);

      const clearTimer = () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      };

      window.addEventListener('pagehide', clearTimer, { once: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearTimer();
        }
      }, { once: true });

      window.location.href = 'Sailorc://keeta.com';
    }
    // On desktop, default anchor target="_blank" navigates to https://www.keeta.com/
  };

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppOrder(brandName || fallbackSearchName, orders, roomCode);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    // 1. Launch WhatsApp immediately on user gesture to prevent popup blocking
    window.open(waUrl, '_blank');

    // 2. Perform clipboard write in the background
    copyToClipboardSafe(text);

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col gap-2.5 mb-3 ${className}`}>
      {/* Primary CTA: Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-14 px-4 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] hover:brightness-105 active:translate-y-1 active:shadow-[0px_1px_0px_#241B18] transition-all flex items-center justify-center gap-2.5 font-alexandria font-black text-base sm:text-lg select-none group"
      >
        <svg
          className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5z" />
        </svg>
        <span>{t('match.open_in_maps')}</span>
      </a>

      {/* Secondary Section Header: Delivery Apps */}
      <div className="flex items-center gap-2 px-1 pt-1">
        <div className="flex-1 h-px bg-[#241B18]/15" />
        <span className="text-[11px] font-black text-[#7A6E67] font-alexandria uppercase tracking-wider">
          {t('match.delivery_apps')} 🛵
        </span>
        <div className="flex-1 h-px bg-[#241B18]/15" />
      </div>

      {/* Delivery Platforms: 3-column Grid (HungerStation, Ninja, Keeta) */}
      <div className="grid grid-cols-3 gap-2">
        {/* HungerStation */}
        <a
          href="https://hungerstation.go.link/?adj_t=18ca96f0_23cp1gxh"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDeliveryClick}
          className="h-12 px-2 rounded-2xl bg-[#EA1D2C] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-[0px_1px_0px_#241B18] hover:brightness-105 transition-all flex items-center justify-center gap-1 font-alexandria font-black text-xs sm:text-sm select-none"
        >
          <span>{locale === 'ar' ? 'هنقرستيشن' : 'HungerStation'}</span>
        </a>

        {/* Ninja */}
        <a
          href="https://ananinja.com/app"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDeliveryClick}
          className="h-12 px-2 rounded-2xl bg-[#101828] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-[0px_1px_0px_#241B18] hover:brightness-110 transition-all flex items-center justify-center gap-1 font-alexandria font-black text-xs sm:text-sm select-none"
        >
          <span>{locale === 'ar' ? 'نينجا' : 'Ninja'}</span>
        </a>

        {/* Keeta */}
        <a
          href="https://www.keeta.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleKeetaClick}
          className="h-12 px-2 rounded-2xl bg-[#FFD600] text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-[0px_1px_0px_#241B18] hover:brightness-105 transition-all flex items-center justify-center gap-1 font-alexandria font-black text-xs sm:text-sm select-none"
        >
          <span>{locale === 'ar' ? 'كيتا' : 'Keeta'}</span>
        </a>
      </div>

      {/* WhatsApp Copy Action Button */}
      <button
        type="button"
        onClick={handleCopyWhatsApp}
        className={`w-full h-12 px-4 rounded-2xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-0.5 active:shadow-[0px_1px_0px_#241B18] transition-all font-alexandria font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 select-none ${
          copied
            ? 'bg-[#55B96A] text-white'
            : 'bg-[#25D366] text-white hover:brightness-105'
        }`}
      >
        {copied ? (
          <>
            <span className="text-base">✅</span>
            <span>{t('scratchpad.whatsappCopied')}</span>
          </>
        ) : (
          <>
            <span className="text-base">📋</span>
            <span>
              {locale === 'ar'
                ? `نسخ طلبات القروب للواتساب (${orders.length})`
                : `Copy Squad Order to WhatsApp (${orders.length})`}
            </span>
          </>
        )}
      </button>

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
