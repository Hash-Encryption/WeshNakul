import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';
import { TactileButton } from '../common/TactileButton';

interface EnterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const EnterCodeModal: React.FC<EnterCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const { t } = useLocale();
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
      setLocalError(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 4 || /[^A-Z]/.test(cleanCode)) {
      setLocalError(cleanCode.length === 0 ? t('enterCodeModal.subtitle') : t('enterCodeModal.lettersOnly'));
      return;
    }
    setLocalError(null);
    await onSubmit(cleanCode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-brand-border"
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-brand-redSoft rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 text-brand-red">
                🔑
              </div>
              <h3 className="text-xl font-extrabold text-brand-ink mb-1">
                {t('enterCodeModal.title')}
              </h3>
              <p className="text-xs text-brand-gray">
                {t('enterCodeModal.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={code}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const hasInvalid = /[^A-Za-z]/.test(raw);
                    const clean = raw.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
                    setCode(clean);

                    if (hasInvalid) {
                      setLocalError(t('enterCodeModal.lettersOnly'));
                      return;
                    }

                    setLocalError(null);
                    if (/^[A-Za-z]{4}$/.test(raw) && !isLoading) {
                      void onSubmit(clean);
                    }
                  }}
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t('enterCodeModal.placeholder')}
                  autoFocus
                  className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 px-4 rounded-2xl border-2 border-brand-border bg-brand-cream/50 focus:border-brand-red focus:bg-white focus:outline-none transition-all uppercase placeholder:text-brand-gray/40 text-brand-ink"
                />
                {(localError || error) && (
                  <p className="text-xs text-brand-red font-semibold mt-2 text-center">
                    {localError || error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <TactileButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  isLoading={isLoading}
                  disabled={code.trim().length !== 4 || Boolean(localError)}
                >
                  {t('enterCodeModal.submit')}
                </TactileButton>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 text-xs font-bold text-brand-gray hover:text-brand-ink transition-colors"
                >
                  {t('enterCodeModal.cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
