import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { TactileButton } from '../common/TactileButton';
import { Toast } from '../common/Toast';
import { SparkleRays, DoodleSquiggle } from '../common/DecorativeSparkles';

interface RoomLobbyScreenProps {
  onStartPicking?: () => void;
  onLeaveRoom: () => void;
}

export const RoomLobbyScreen: React.FC<RoomLobbyScreenProps> = ({
  onStartPicking,
  onLeaveRoom,
}) => {
  const { currentRoom, currentParticipant, participants, isHost } = useRoom();
  const { t } = useLocale();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  if (!currentRoom) return null;

  // Build the full invite URL based on the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://washn6tab.com';
  const inviteUrl = `${origin}/r/${currentRoom.code}`;
  const displayUrl = `washn6tab.com/r/${currentRoom.code}`;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
      });
    } catch {
      // safe fallback
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast(t('toast.linkCopied'));
      triggerConfetti();
    } catch (e) {
      console.error('Failed to copy link', e);
      showToast(t('toast.linkCopied'));
    }
  };

  const handleShareWhatsApp = () => {
    const rawMessage = t('whatsapp.shareMessage', { url: inviteUrl });
    const encodedMessage = encodeURIComponent(rawMessage);

    const whatsappNativeUrl = `whatsapp://send?text=${encodedMessage}`;
    const whatsappWebUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    // Attempt native WhatsApp URI first, fallback to web API
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappNativeUrl;
      setTimeout(() => {
        window.open(whatsappWebUrl, '_blank');
      }, 1000);
    } else {
      window.open(whatsappWebUrl, '_blank');
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6">
      <Toast message={toastMessage} />

      <div>
        {/* Header */}
        <Header
          showBack={false}
          showMenu={true}
          onMenuClick={() => setShowMenuModal(true)}
          participantCount={participants.length}
          showCount={true}
        />

        {/* Heading and Subtitle */}
        <div className="text-center mt-2 mb-5 px-2 relative">
          <DoodleSquiggle className="absolute -top-1 start-4 transform -rotate-12" color="#F0443E" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight flex items-center justify-center gap-2">
            <span>{t('lobby.heading')}</span>
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {t('lobby.subtitle')}
          </p>
        </div>

        {/* Main Invite & Code Card */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm max-w-sm mx-auto mb-4">
          {/* Room Code Header */}
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-brand-gray/80 uppercase tracking-wider block mb-1">
              {t('lobby.roomCodeLabel')}
            </span>

            {/* Big Code Pill with Sparkles */}
            <div className="relative inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-brand-cream border-2 border-brand-border/80 my-1">
              <SparkleRays className="absolute -top-2 -start-3 transform -rotate-12 scale-90" color="#FFD75A" />
              <SparkleRays className="absolute -bottom-2 -end-3 transform rotate-45 scale-90" color="#FFD75A" />
              <span className="font-alexandria font-extrabold text-4xl text-brand-red tracking-widest select-all">
                {currentRoom.code}
              </span>
            </div>
          </div>

          {/* Invite Link Row */}
          <div className="mt-4 mb-4">
            <span className="text-xs font-bold text-brand-gray/80 block mb-1.5 text-center">
              {t('lobby.inviteLinkLabel')}
            </span>
            <div
              onClick={handleCopyLink}
              className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-brand-cream/60 border border-brand-border cursor-pointer hover:bg-brand-cream transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden px-1">
                <span className="text-brand-gray text-base">🔗</span>
                <span className="text-xs font-mono font-semibold text-brand-ink truncate">
                  {displayUrl}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-brand-redSoft border border-brand-red/20 flex items-center justify-center text-xs flex-shrink-0">
                🍕
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy Link & WhatsApp */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleCopyLink}
              type="button"
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-white border-2 border-brand-border text-brand-ink text-xs sm:text-sm font-bold shadow-tactile-white active:translate-y-1 active:shadow-none transition-all hover:bg-brand-cream/40"
            >
              <span className="text-base">📋</span>
              <span>{t('lobby.copyLink')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-brand-whatsapp text-white text-xs sm:text-sm font-bold shadow-tactile-whatsapp active:translate-y-1 active:shadow-none transition-all hover:brightness-105"
            >
              <span className="text-base">💬</span>
              <span>{t('lobby.shareWhatsApp')}</span>
            </button>
          </div>
        </div>

        {/* Capacity Information Banner */}
        <div className="max-w-sm mx-auto mb-4 px-3 py-2.5 rounded-2xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-brand-red text-base">👥</span>
            <div>
              <span className="font-bold text-brand-red block">
                {t('lobby.maxMembersBadge')}
              </span>
              <span className="text-brand-ink/70 text-[11px]">
                {t('lobby.maxMembersDesc')}
              </span>
            </div>
          </div>
          <span className="font-bold text-brand-ink bg-white/70 px-2 py-1 rounded-full border border-brand-yellow/40">
            {participants.length}/10
          </span>
        </div>

        {/* Realtime Joined Participants Grid / Row */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-brand-ink">
              {t('guest.participantsCount')} ({participants.length})
            </span>
            <div className="flex items-center gap-1 text-[11px] text-brand-green font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span>Realtime</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 py-1">
            {participants.map((p) => {
              const isMe = p.session_token === currentParticipant?.session_token;

              return (
                <div key={p.id} className="flex flex-col items-center text-center group">
                  <ProceduralAvatar
                    nickname={p.nickname}
                    shape={p.player_shape}
                    color={p.player_color}
                    size="md"
                    showCrown={p.is_host}
                  />
                  <span className="text-xs font-bold text-brand-ink mt-1 truncate max-w-[60px] block">
                    {p.nickname}
                  </span>
                  {isMe && (
                    <span className="text-[10px] font-semibold text-brand-red bg-brand-redSoft px-1.5 py-0.2 rounded-full">
                      {t('lobby.youBadge')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {participants.length === 1 && (
            <p className="text-center text-xs text-brand-gray mt-2 pt-2 border-t border-brand-border/40">
              {t('lobby.waitingOthers')}
            </p>
          )}
        </div>
      </div>

      {/* Host CTA Action */}
      <div className="max-w-sm w-full mx-auto mt-5 pt-1 text-center">
        {isHost ? (
          <div className="relative inline-block w-full">
            <SparkleRays className="absolute -top-3 end-6 transform rotate-12 scale-75" color="#FFD75A" />
            <TactileButton
              onClick={onStartPicking || triggerConfetti}
              variant="primary"
              fullWidth
              size="lg"
            >
              {t('lobby.startPicking')}
            </TactileButton>
            {/* Cute hand-drawn underline accent */}
            <div className="w-32 h-1 bg-brand-red rounded-full mx-auto mt-1.5 opacity-60" />
          </div>
        ) : (
          <div className="py-3 px-4 rounded-2xl bg-white/70 border border-brand-border text-xs font-bold text-brand-gray">
            ⏳ {t('lobby.waitingOthers')}
          </div>
        )}
      </div>

      {/* Menu / Options Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-brand-border text-center">
            <h4 className="text-lg font-bold text-brand-ink mb-4 font-alexandria">
              {t('common.appName')}
            </h4>
            <div className="flex flex-col gap-2.5">
              <TactileButton
                onClick={() => {
                  setShowMenuModal(false);
                  handleCopyLink();
                }}
                variant="secondary"
                size="sm"
                fullWidth
              >
                {t('lobby.copyLink')}
              </TactileButton>
              <TactileButton
                onClick={() => {
                  setShowMenuModal(false);
                  onLeaveRoom();
                }}
                variant="ghost"
                size="sm"
                fullWidth
                className="text-brand-red hover:bg-brand-redSoft"
              >
                {t('roomFull.goHome')}
              </TactileButton>
              <button
                onClick={() => setShowMenuModal(false)}
                className="py-2 text-xs font-semibold text-brand-gray"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
