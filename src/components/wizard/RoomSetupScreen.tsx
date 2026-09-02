import React, { useState } from 'react';
import type { EatingMode } from '../../types/database';
import { SAUDI_CITIES } from '../../lib/cities';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays } from '../common/DecorativeSparkles';

interface RoomSetupScreenProps {
  eatingMode: EatingMode;
  onBack: () => void;
  onCreateRoom: (params: {
    nickname: string;
    city: string;
    neighborhood?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const RoomSetupScreen: React.FC<RoomSetupScreenProps> = ({
  onBack,
  onCreateRoom,
  isLoading = false,
}) => {
  const { locale, t } = useLocale();

  const [nickname, setNickname] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(SAUDI_CITIES[0].id);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentCity = SAUDI_CITIES.find((c) => c.id === selectedCityId) || SAUDI_CITIES[0];
  const cityName = locale === 'ar' ? currentCity.nameAr : currentCity.nameEn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError(t('guest.nicknameLabel'));
      return;
    }
    setError(null);
    await onCreateRoom({
      nickname: nickname.trim(),
      city: cityName,
      neighborhood: selectedDistrict.trim() || undefined,
    });
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6">
      <div>
        {/* Header */}
        <Header onBack={onBack} participantCount={1} showCount={true} />

        {/* Heading and Subtitle */}
        <div className="text-center mt-3 mb-6 px-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight">
            {t('setup.heading')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {t('setup.subtitle')}
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 max-w-sm mx-auto">
          {/* 1. Nickname Card */}
          <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-brand-red text-base">👤</span>
              <label htmlFor="nickname-input" className="text-sm font-bold text-brand-ink">
                {t('setup.nicknameLabel')}
              </label>
            </div>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError(null);
              }}
              placeholder={t('setup.nicknamePlaceholder')}
              maxLength={25}
              className="w-full py-3 px-4 rounded-2xl border border-brand-border/80 bg-brand-cream/40 focus:bg-white focus:border-brand-red focus:outline-none text-base font-semibold text-brand-ink placeholder:text-brand-gray/50 transition-all"
            />
            {error && (
              <p className="text-xs text-brand-red font-semibold mt-1.5 px-1">
                {error}
              </p>
            )}
          </div>

          {/* 2. City Card */}
          <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-brand-red text-base">📍</span>
              <label htmlFor="city-select" className="text-sm font-bold text-brand-ink">
                {t('setup.cityLabel')}
              </label>
            </div>
            <div className="relative">
              <select
                id="city-select"
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full py-3 px-4 rounded-2xl border border-brand-border/80 bg-brand-cream/40 focus:bg-white focus:border-brand-red focus:outline-none text-base font-semibold text-brand-ink appearance-none cursor-pointer transition-all"
              >
                {SAUDI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none text-brand-ink">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. District Card */}
          <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-brand-red text-base">🏢</span>
              <label htmlFor="district-select" className="text-sm font-bold text-brand-ink">
                {t('setup.areaLabel')}
              </label>
            </div>
            <div className="relative">
              <select
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl border border-brand-border/80 bg-brand-cream/40 focus:bg-white focus:border-brand-red focus:outline-none text-base font-semibold text-brand-ink appearance-none cursor-pointer transition-all"
              >
                <option value="">{t('setup.areaPlaceholder')}</option>
                {currentCity.districts.map((d, i) => {
                  const dName = locale === 'ar' ? d.nameAr : d.nameEn;
                  return (
                    <option key={i} value={dName}>
                      {dName}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none text-brand-ink">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Helper Pill */}
          <div className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-brand-yellow/15 border border-brand-yellow/30 text-xs font-bold text-brand-ink/80 text-center">
            <span>✨</span>
            <span>{t('setup.canChangeLater')}</span>
          </div>
        </form>
      </div>

      {/* Bottom Sticky Action */}
      <div className="relative max-w-sm w-full mx-auto mt-6 pt-2">
        <SparkleRays className="absolute top-0 start-1 transform rotate-45 scale-75" color="#FFD75A" />
        <SparkleRays className="absolute bottom-2 end-1 transform -rotate-45 scale-75" color="#FFD75A" />

        <TactileButton
          onClick={handleSubmit}
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={!nickname.trim()}
        >
          {t('setup.submit')}
        </TactileButton>
      </div>
    </div>
  );
};
