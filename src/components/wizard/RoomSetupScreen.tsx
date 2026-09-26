import React, { useReducer, useState } from 'react';
import {
  Buildings,
  CaretDown,
  CheckCircle,
  MapPin,
  NavigationArrow,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import type { EatingMode } from '../../types/database';
import { SAUDI_CITIES } from '../../lib/cities';
import { getHostCoordinates } from '../../lib/useGeolocation';
import {
  getRoomLocationInput,
  initialRoomSetupLocation,
  roomSetupLocationReducer,
} from '../../lib/roomSetupLocation';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';

interface RoomSetupScreenProps {
  eatingMode: EatingMode;
  onBack: () => void;
  onCreateRoom: (params: {
    nickname: string;
    city: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
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
  const [nicknameError, setNicknameError] = useState(false);
  const [location, dispatchLocation] = useReducer(
    roomSetupLocationReducer,
    initialRoomSetupLocation,
  );

  const currentCity = SAUDI_CITIES.find((city) => city.id === location.cityId) || SAUDI_CITIES[0];
  const cityName = locale === 'ar' ? currentCity.nameAr : currentCity.nameEn;
  const gpsActive = location.status === 'success';

  const handleLocateMe = async () => {
    dispatchLocation({ type: 'locate' });
    try {
      dispatchLocation({ type: 'located', coordinates: await getHostCoordinates() });
    } catch {
      dispatchLocation({ type: 'locationFailed' });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) {
      setNicknameError(true);
      return;
    }

    setNicknameError(false);
    await onCreateRoom({
      nickname: nickname.trim(),
      city: currentCity.id,
      ...getRoomLocationInput(location),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex min-h-[92dvh] w-full flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <Header onBack={onBack} participantCount={1} showCount />

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mb-2 mt-1 px-2 text-center">
          <h2 className="mb-1 font-alexandria text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
            {t('setup.heading')}
          </h2>
          <p className="text-xs sm:text-sm font-medium leading-normal text-brand-gray">
            {t('setup.subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="rounded-2xl bg-white p-3 shadow-tactile-card">
            <div className="mb-1.5 flex items-center gap-2">
              <UserCircle aria-hidden size={20} weight="fill" className="shrink-0 text-brand-red" />
              <label htmlFor="nickname-input" className="text-xs sm:text-sm font-bold text-brand-ink">
                {t('setup.nicknameLabel')}
              </label>
            </div>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setNicknameError(false);
              }}
              aria-invalid={nicknameError}
              aria-describedby={nicknameError ? 'nickname-error' : undefined}
              placeholder={t('setup.nicknamePlaceholder')}
              maxLength={25}
              autoComplete="nickname"
              className="min-h-11 w-full rounded-xl bg-brand-cream/50 px-3.5 py-2.5 text-sm sm:text-base font-semibold text-brand-ink outline-none ring-1 ring-inset ring-brand-border transition focus:bg-white focus:ring-2 focus:ring-brand-red placeholder:text-brand-gray"
            />
            {nicknameError && (
              <p id="nickname-error" role="alert" className="mt-1.5 px-1 text-xs font-semibold text-brand-red">
                {t('setup.nicknameRequired')}
              </p>
            )}
          </div>

          {gpsActive ? (
            <div className="rounded-2xl bg-emerald-50 p-3 shadow-tactile-card ring-1 ring-inset ring-emerald-300">
              <div className="flex items-start gap-2.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <MapPin aria-hidden size={22} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-alexandria text-sm sm:text-base font-extrabold text-emerald-950">
                    <span>{t('setup.locationDetected')}</span>
                    <CheckCircle aria-hidden size={18} weight="fill" />
                  </div>
                  <p className="mt-0.5 text-xs font-medium leading-4 text-emerald-800">
                    {t('setup.locationDetectedHelper')}
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatchLocation({ type: 'clearLocation' })}
                    className="mt-1.5 min-h-9 rounded-xl px-2 text-xs font-bold text-brand-red underline decoration-brand-red/30 underline-offset-4 transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                  >
                    {t('setup.chooseAreaInstead')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={location.status === 'locating'}
                aria-describedby={location.status === 'error' ? 'location-error' : 'location-helper'}
                className="flex min-h-[62px] w-full items-center gap-3 rounded-2xl bg-brand-redSoft/70 p-3 text-start shadow-tactile-card ring-1 ring-inset ring-brand-red/30 transition hover:bg-brand-redSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white shadow-sm">
                  {location.status === 'locating' ? (
                    <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <NavigationArrow aria-hidden size={22} weight="fill" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-alexandria text-sm sm:text-base font-extrabold text-brand-ink">
                    {location.status === 'locating'
                      ? t('setup.detectingLocation')
                      : location.status === 'error'
                        ? t('setup.retryLocation')
                        : t('setup.useCurrentLocation')}
                  </span>
                  <span id="location-helper" className="mt-0.5 block text-xs font-medium leading-4 text-brand-gray">
                    {t('setup.locationSupport')}
                  </span>
                </span>
              </button>
              {location.status === 'error' && (
                <p id="location-error" role="alert" className="mt-1.5 px-2 text-xs font-semibold leading-4 text-brand-red">
                  {t('setup.locationError')}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 px-1 text-xs font-bold text-brand-gray" aria-hidden>
            <span className="h-px flex-1 bg-brand-border" />
            <span>{t('setup.manualDivider')}</span>
            <span className="h-px flex-1 bg-brand-border" />
          </div>

          <div className="rounded-2xl bg-white px-3.5 py-2 shadow-tactile-card">
            <div className="flex min-h-10 items-center gap-2.5">
              <MapPin aria-hidden size={20} weight="fill" className="shrink-0 text-brand-red" />
              <label htmlFor="city-select" className="text-xs sm:text-sm font-bold text-brand-ink">
                {t('setup.cityLabel')}
              </label>
              <div className="relative ms-auto min-w-0">
                <select
                  id="city-select"
                  value={location.cityId}
                  onChange={(event) => dispatchLocation({ type: 'selectCity', cityId: event.target.value })}
                  className="min-h-10 w-full appearance-none rounded-xl bg-transparent py-1.5 pe-7 ps-2 text-end text-xs sm:text-sm font-extrabold text-brand-ink outline-none transition focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  {SAUDI_CITIES.map((city) => (
                    <option key={city.id} value={city.id}>
                      {locale === 'ar' ? city.nameAr : city.nameEn}
                    </option>
                  ))}
                </select>
                <CaretDown aria-hidden size={15} weight="bold" className="pointer-events-none absolute end-1.5 top-1/2 -translate-y-1/2 text-brand-ink" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-3 shadow-tactile-card transition-colors ${gpsActive ? 'bg-stone-50' : 'bg-white'}`}>
            <div className="mb-1.5 flex items-center gap-2">
              <Buildings aria-hidden size={20} weight="fill" className={gpsActive ? 'text-brand-gray' : 'text-brand-red'} />
              <label htmlFor="district-select" className="text-xs sm:text-sm font-bold text-brand-ink">
                {t('setup.areaLabel')}
              </label>
            </div>
            <div className="relative">
              <select
                id="district-select"
                value={location.district}
                onChange={(event) => dispatchLocation({ type: 'selectDistrict', district: event.target.value })}
                className="min-h-11 w-full appearance-none rounded-xl bg-brand-cream/50 px-3.5 py-2.5 pe-10 text-sm sm:text-base font-semibold text-brand-ink outline-none ring-1 ring-inset ring-brand-border transition focus:bg-white focus:ring-2 focus:ring-brand-red"
              >
                <option value="">{t('setup.anyArea', { city: cityName })}</option>
                {currentCity.districts.map((district) => (
                  <option key={district.id ?? district.nameEn} value={district.id ?? district.nameEn}>
                    {locale === 'ar' ? district.nameAr : district.nameEn}
                  </option>
                ))}
              </select>
              <CaretDown aria-hidden size={16} weight="bold" className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-brand-ink" />
            </div>
            {gpsActive && (
              <p className="mt-1.5 text-xs font-medium leading-4 text-brand-gray">
                {t('setup.districtGpsHelper')}
              </p>
            )}
          </div>

          <div className="flex min-h-9 items-center justify-center gap-2 rounded-full bg-brand-yellow/15 px-3 py-1 text-center text-xs font-bold text-brand-ink/80 ring-1 ring-inset ring-brand-yellow/40">
            <Sparkle aria-hidden size={15} weight="fill" className="text-brand-yellowPressed" />
            <span>{t('setup.canChangeLater')}</span>
          </div>
        </div>

        <div className="mt-4 pt-1">
          <TactileButton
            type="submit"
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
    </form>
  );
};
