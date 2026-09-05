import React, { useState } from 'react';
import type { RestaurantItem } from '../../types/restaurant';
import type { OrderItem } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';

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

  const restaurantName = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;
  const encodedName = encodeURIComponent(restaurant.nameAr || restaurant.nameEn);

  const rawLinks = (restaurant.links || {}) as unknown as Record<string, string | undefined>;

  const hungerstationUrl =
    rawLinks.hungerstation ||
    rawLinks.hungerstationSearch ||
    `https://hungerstation.com/sa-ar/search?q=${encodedName}`;

  const jahezUrl =
    rawLinks.jahez ||
    rawLinks.jahezSearch ||
    `https://jahez.net/search?q=${encodedName}`;

  const keetaUrl =
    rawLinks.keeta ||
    rawLinks.keetaSearch ||
    `https://keeta.com/search?q=${encodedName}`;

  const googleMapsUrl =
    rawLinks.googleMaps ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${restaurant.nameAr || ''} ${restaurant.nameEn || ''}`.trim()
    )}`;

  const handleCopyWhatsApp = async () => {
    const text = formatWhatsAppOrder(restaurantName, orders, roomCode);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col gap-3 mb-4 ${className}`}>
      {/* Delivery Launch Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-[#241B18] font-alexandria uppercase tracking-wider">
          {t('scratchpad.openIn')} 🛵
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#7A6E67] hover:text-[#241B18] transition-colors underline decoration-dotted underline-offset-4"
        >
          <span>{t('scratchpad.directions')}</span>
        </a>
      </div>

      {/* Delivery Platform Cards Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* HungerStation */}
        <a
          href={hungerstationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-2.5 rounded-2xl bg-[#EA1D2C] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 transition-all flex items-center justify-center gap-1.5 font-alexandria font-black text-xs select-none"
        >
          <span>هنقرستيشن</span>
        </a>

        {/* Jahez */}
        <a
          href={jahezUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-2.5 rounded-2xl bg-[#A82226] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 transition-all flex items-center justify-center gap-1.5 font-alexandria font-black text-xs select-none"
        >
          <span>جاهز</span>
        </a>

        {/* Keeta */}
        <a
          href={keetaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-2.5 rounded-2xl bg-[#FFD600] text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 transition-all flex items-center justify-center gap-1.5 font-alexandria font-black text-xs select-none"
        >
          <span>كيتا</span>
        </a>
      </div>

      {/* WhatsApp Copy Action Button */}
      <button
        type="button"
        onClick={handleCopyWhatsApp}
        className={`w-full h-12 px-4 rounded-2xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-0.5 active:shadow-none transition-all font-alexandria font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 select-none ${
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
    </div>
  );
};
