import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logDeckError } from '../../lib/observability';
import { getActiveRoomCode, clearRoomSession } from '../../lib/session';

interface ApplicationErrorBoundaryProps {
  children: ReactNode;
}

interface ApplicationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ApplicationErrorBoundary extends Component<
  ApplicationErrorBoundaryProps,
  ApplicationErrorBoundaryState
> {
  constructor(props: ApplicationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ApplicationErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const roomCode = getActiveRoomCode() || undefined;
    logDeckError({
      eventPhase: 'card_render',
      roomId: roomCode,
      error,
      message: `ApplicationErrorBoundary caught unhandled render exception: ${error.message}`,
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
    this.setState({ errorInfo });
  }

  handleTryAgain = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleRecoverRoom = (): void => {
    const activeCode = getActiveRoomCode();
    if (activeCode) {
      window.location.href = `/r/${activeCode}`;
    } else {
      window.location.reload();
    }
  };

  handleStartFresh = (): void => {
    try {
      const activeCode = getActiveRoomCode();
      clearRoomSession(activeCode || undefined);
    } catch {
      // Storage access safety
    }
    window.location.href = '/';
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : true;
      const roomCode = getActiveRoomCode();

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[#F7EFE6] flex items-center justify-center p-4 selection:bg-[#FFF0EE] font-alexandria"
        >
          <div className="w-full max-w-sm rounded-[28px] border-3 border-[#241B18] bg-white p-6 sm:p-7 text-center shadow-[0_8px_0_#241B18] flex flex-col items-center gap-4">
            {/* Branded Recovery Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18] text-3xl shadow-[0_3px_0_#241B18]">
              <span>🛠️</span>
            </div>

            {/* Branded Headlines */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#241B18] tracking-tight">
                {isRTL ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#7A6E67] leading-relaxed">
                {isRTL
                  ? 'حفظنا غرفتكم، يلا نرجعك لها.'
                  : "We saved your room. Let's get you back in."}
              </p>
            </div>

            {/* Room Recovery Badge if active room exists */}
            {roomCode && (
              <div className="inline-flex items-center gap-2 bg-[#FFF8F1] border-2 border-[#241B18] rounded-xl px-3 py-1.5 text-xs font-black text-[#241B18] shadow-[0_2px_0_#241B18]">
                <span>🚪</span>
                <span>
                  {isRTL ? `الغرفة الحالية: ${roomCode}` : `Active Room: ${roomCode}`}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              {/* Primary: Try Again */}
              <button
                type="button"
                onClick={this.handleTryAgain}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0_4px_0_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-black text-sm cursor-pointer"
              >
                {isRTL ? 'إعادة المحاولة 🔄' : 'Try Again 🔄'}
              </button>

              {/* Secondary: Recover Room */}
              {roomCode && (
                <button
                  type="button"
                  onClick={this.handleRecoverRoom}
                  className="w-full py-3 px-4 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0_3px_0_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-black text-sm cursor-pointer"
                >
                  {isRTL ? 'استعادة الغرفة 🚀' : 'Recover Room 🚀'}
                </button>
              )}

              {/* Explicit Tertiary: Start Fresh (Never silent, explicit choice) */}
              <button
                type="button"
                onClick={this.handleStartFresh}
                className="w-full py-2 px-3 text-xs font-bold text-[#7A6E67] hover:text-[#241B18] underline transition-colors cursor-pointer mt-1"
              >
                {isRTL ? 'البدء من جديد (إنهاء الجلسة)' : 'Start Fresh (Clear Session)'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface DeckErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onChooseAnotherCategory?: () => void;
  isHost?: boolean;
}

interface DeckErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DeckErrorBoundary extends Component<DeckErrorBoundaryProps, DeckErrorBoundaryState> {
  constructor(props: DeckErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): DeckErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logDeckError({
      eventPhase: 'card_render',
      error,
      message: `DeckErrorBoundary caught localized card/deck exception: ${error.message}`,
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : true;

      return (
        <div
          role="alert"
          className="m-auto w-full max-w-sm rounded-3xl border-2 border-[#241B18] bg-white p-6 text-center font-alexandria shadow-[0_4px_0_#241B18] my-4"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF8F1] border border-[#241B18]/15 text-2xl shadow-[0_2px_0_#241B18]">
            <span>🍽️</span>
          </div>

          <h3 className="text-base font-black text-[#241B18] mb-1 leading-snug">
            {isRTL ? 'تعذر عرض خيارات المطاعم' : 'Failed to display restaurant cards'}
          </h3>

          <p className="text-xs font-semibold text-[#7A6E67] mb-5 leading-relaxed">
            {isRTL
              ? 'حدث خطأ مؤقت أثناء تحميل البطاقات. غرفتكم وتصويتكم محفوظة بأمان.'
              : 'A temporary error occurred while rendering cards. Your room and votes are safely preserved.'}
          </p>

          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] active:translate-y-0.5 active:shadow-none font-black text-xs cursor-pointer"
            >
              {isRTL ? 'تحديث بطاقات المطاعم 🔄' : 'Refresh Restaurant Picks 🔄'}
            </button>

            {this.props.isHost && this.props.onChooseAnotherCategory && (
              <button
                type="button"
                onClick={this.props.onChooseAnotherCategory}
                className="w-full py-2.5 px-3 rounded-2xl bg-white text-[#241B18] border-2 border-[#241B18] shadow-[0_2px_0_#241B18] active:translate-y-0.5 active:shadow-none font-bold text-xs cursor-pointer"
              >
                {isRTL ? 'اختيار تصنيف آخر 📋' : 'Choose Another Category 📋'}
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
