import React, { useState, useEffect, useCallback } from 'react';
import type { OrderItem } from '../../types/database';
import { fetchOrderItems, addOrderItem, deleteOrderItem, subscribeToOrderItems } from '../../lib/supabase';
import { extractInitial } from '../../lib/tokenGenerator';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';

interface OrderScratchpadProps {
  roomId: string;
  currentParticipantId: string;
  currentParticipantName: string;
  isHost?: boolean;
  orders?: OrderItem[];
  onOrdersChange?: (orders: OrderItem[]) => void;
  className?: string;
}

export const OrderScratchpad: React.FC<OrderScratchpadProps> = ({
  roomId,
  currentParticipantId,
  currentParticipantName,
  isHost = false,
  orders: controlledOrders,
  onOrdersChange,
  className = '',
}) => {
  const { t } = useLocale();
  const { reportError } = useRoom();

  const [internalItems, setInternalItems] = useState<OrderItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = controlledOrders !== undefined ? controlledOrders : internalItems;

  const notifyChange = useCallback(
    (newItems: OrderItem[]) => {
      onOrdersChange?.(newItems);
    },
    [onOrdersChange]
  );

  const updateItems = useCallback(
    (updater: (prev: OrderItem[]) => OrderItem[]) => {
      if (controlledOrders !== undefined) {
        const next = updater(controlledOrders);
        notifyChange(next);
      } else {
        setInternalItems((prev) => {
          const next = updater(prev);
          notifyChange(next);
          return next;
        });
      }
    },
    [controlledOrders, notifyChange]
  );

  // Initial load and realtime subscription
  useEffect(() => {
    let isMounted = true;

    if (!roomId) return;

    fetchOrderItems(roomId).then((loaded) => {
      if (isMounted) {
        if (controlledOrders !== undefined) {
          notifyChange(loaded);
        } else {
          setInternalItems(loaded);
          notifyChange(loaded);
        }
      }
    }).catch(reportError);

    const unsubscribe = subscribeToOrderItems(
      roomId,
      (newItem) => {
        if (!isMounted) return;
        updateItems((prev) => (prev.some((it) => it.id === newItem.id) ? prev : [...prev, newItem]));
      },
      (deletedId) => {
        if (!isMounted) return;
        updateItems((prev) => prev.filter((it) => it.id !== deletedId));
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId, controlledOrders, notifyChange, updateItems, reportError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItem = itemName.trim();
    if (!cleanItem || isSubmitting || !roomId) return;

    setIsSubmitting(true);
    try {
      const added = await addOrderItem({
        roomId,
        participantId: currentParticipantId,
        participantName: currentParticipantName || 'مشارك',
        itemName: cleanItem,
        notes: notes.trim(),
      });

      if (added) {
        updateItems((prev) => (prev.some((it) => it.id === added.id) ? prev : [...prev, added]));
        setItemName('');
        setNotes('');
        setShowNotes(false);
      }
    } catch (error) {
      reportError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteOrderItem(itemId);
      updateItems((prev) => prev.filter((it) => it.id !== itemId));
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] p-4 sm:p-5 mb-4 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#241B18]/10 mb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#241B18] font-alexandria flex items-center gap-1.5">
            <span>{t('scratchpad.title')}</span>
            {items.length > 0 && (
              <span className="bg-[#FFD75A] text-[#241B18] text-xs font-black px-2 py-0.5 rounded-full border border-[#241B18]">
                {items.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-[#7A6E67] font-medium mt-0.5">
            {t('scratchpad.subtitle')}
          </p>
        </div>
      </div>

      {/* Item Card List */}
      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-0.5 mb-4">
        {items.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-[#FFF8F1] border-2 border-dashed border-[#241B18]/25 text-[#7A6E67] text-xs sm:text-sm font-bold font-alexandria">
            {t('scratchpad.emptyState')}
          </div>
        ) : (
          items.map((item) => {
            const isOwner = item.participantId === currentParticipantId;
            const canDelete = isOwner || isHost;
            const initial = extractInitial(item.participantName);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18]"
              >
                {/* Participant Info & Order */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Participant Avatar Initial Pill */}
                  <div className="w-8 h-8 rounded-xl bg-[#FFD75A] border-2 border-[#241B18] shadow-[0px_1px_0px_#241B18] flex items-center justify-center font-black text-xs font-alexandria text-[#241B18] shrink-0 mt-0.5">
                    {initial}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#7A6E67] font-alexandria truncate max-w-[120px]">
                        {item.participantName}
                      </span>
                      {isOwner && (
                        <span className="text-[9px] font-extrabold bg-[#55B96A]/20 text-[#2E7D32] px-1.5 py-0.2 rounded-md">
                          {t('lobby.youBadge') || 'أنت'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-[#241B18] font-alexandria leading-snug break-words">
                      {item.itemName}
                    </p>

                    {/* Optional Notes Pill */}
                    {item.notes && item.notes.trim() !== '' && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 bg-white border border-[#241B18]/20 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#7A6E67]">
                          <span>📝</span>
                          <span className="italic">{item.notes}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete order item"
                    className="w-8 h-8 rounded-xl bg-white hover:bg-[#FFF0EE] text-[#7A6E67] hover:text-[#F0443E] border-2 border-[#241B18] shadow-[0px_1.5px_0px_#241B18] active:translate-y-0.5 active:shadow-none flex items-center justify-center transition-colors shrink-0"
                  >
                    <span className="text-xs font-black">✕</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Order Entry Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t-2 border-[#241B18]/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={t('scratchpad.placeholderItem')}
            disabled={isSubmitting}
            className="flex-1 h-12 px-3.5 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18] text-[#241B18] placeholder:text-[#7A6E67]/70 font-alexandria text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FFD75A] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.04)]"
          />

          {/* Toggle Notes Button */}
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            aria-label="Toggle notes input"
            title="ملاحظات خاصة"
            className={`h-12 w-12 rounded-2xl border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none font-alexandria font-bold text-sm flex items-center justify-center transition-colors shrink-0 ${
              showNotes || notes.trim().length > 0
                ? 'bg-[#FFD75A] text-[#241B18]'
                : 'bg-white text-[#7A6E67] hover:text-[#241B18]'
            }`}
          >
            <span>📝</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!itemName.trim() || isSubmitting}
            className="h-12 px-4 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 font-alexandria font-black text-xs sm:text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all"
          >
            <span>{t('scratchpad.addButton')}</span>
          </button>
        </div>

        {/* Expandable Notes Input */}
        {showNotes && (
          <div className="pt-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('scratchpad.placeholderNotes')}
              disabled={isSubmitting}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FFF8F1] border-2 border-[#241B18] text-[#241B18] placeholder:text-[#7A6E67]/70 font-alexandria text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD75A]"
            />
          </div>
        )}
      </form>
    </div>
  );
};
