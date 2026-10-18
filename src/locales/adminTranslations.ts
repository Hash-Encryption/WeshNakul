export type AdminLocale = 'en' | 'ar';

export const ADMIN_LOCALE_KEY = 'wsh_admin_locale';

export function getStoredAdminLocale(): AdminLocale {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(ADMIN_LOCALE_KEY);
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function setStoredAdminLocale(locale: AdminLocale): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ADMIN_LOCALE_KEY, locale);
    }
  } catch (err) {
    console.error('Failed to persist admin locale', err);
  }
}

export interface AdminTranslations {
  // Common & Navigation
  portalTitle: string;
  portalSubtitle: string;
  phaseBadge: string;
  liveGateway: string;
  backToApp: string;
  logout: string;
  adminGateway: string;
  restrictedAccess: string;
  restrictedAccessDesc: string;
  verifyingAdmin: string;

  // Language Toggle
  langEnglish: string;
  langArabic: string;

  // Time Range Filters
  range24h: string;
  range7d: string;
  range30d: string;
  rangeAll: string;
  refreshTooltip: string;

  // Login Screen
  emailOrUsernameLabel: string;
  emailOrUsernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  accessDashboard: string;
  verifyingCredentials: string;
  errorEmptyPassword: string;
  errorDefaultLogin: string;

  // Error & Loading States
  errorTitle: string;
  retry: string;
  loadingTitle: string;
  loadingSubtitle: string;

  // KPI Cards
  kpiSessions: string;
  kpiUniqueVisitors: string;
  kpiRoomsCreated: string;
  kpiFailed: string;
  kpiSwipes: string;
  kpiRevotes: string;
  kpiNoRevotes: string;
  kpiWinningMatches: string;
  kpiMinigames: string;

  // Sub-KPIs
  kpiMapsClicks: string;
  kpiDeliveryClicks: string;
  kpiRoomsJoined: string;
  kpiRoomsJoinedFailed: string;
  kpiTechFailures: string;

  // Activity Timeline
  timelineTitle: string;
  timelineSubtitle: string;
  timelineEmpty: string;
  timelineSessions: string;
  timelineRooms: string;
  timelineSwipes: string;
  eventsCount: string;

  // Modes & Categories
  modesCategoriesTitle: string;
  modesCategoriesSubtitle: string;
  roomModeHeading: string;
  eatingModeHeading: string;
  foodCategoriesHeading: string;
  noDataRecorded: string;
  noCategoriesRecorded: string;

  // Room Modes
  modeFood: string;
  modeBreakfast: string;
  modeCafes: string;

  // Eating Modes
  eatDelivery: string;
  eatDineIn: string;
  eatAny: string;

  // Swipes & Winners
  swipesWinnersTitle: string;
  swipesWinnersSubtitle: string;
  votePolarityHeading: string;
  voteYes: string;
  voteNo: string;
  voteLater: string;
  noSwipesRecorded: string;
  topWinnersHeading: string;
  noWinnersResolved: string;
  winsCount: string;
  minigamesHeading: string;
  noMinigamesRecorded: string;
  minigameStarted: string;
  minigameCompleted: string;

  // Mini-Game Names
  gameCaptainRoulette: string;
  gameShuffleCards: string;
  gameEmojiClash: string;

  // Recent Events Audit Feed
  recentEventsTitle: string;
  recentEventsSubtitle: string;
  recentEventsEmpty: string;
  colTimeKsa: string;
  colEventType: string;
  colRoomCode: string;
  colCategory: string;
  colEatingMode: string;
  colRoomMode: string;
}

export const ADMIN_TRANSLATIONS: Record<AdminLocale, AdminTranslations> = {
  en: {
    // Common & Navigation
    portalTitle: 'WeshNakul — Analytics Dashboard',
    portalSubtitle: 'Secure Operations & Analytics Console',
    phaseBadge: 'Phase 2 Read-Only',
    liveGateway: 'Live Edge Gateway',
    backToApp: 'Back to App',
    logout: 'Logout',
    adminGateway: 'Admin Gateway',
    restrictedAccess: 'Strictly Restricted Access',
    restrictedAccessDesc: 'Protected by server-side authorization and edge rate-limiting.',
    verifyingAdmin: 'Verifying administrator credentials...',

    // Language Toggle
    langEnglish: 'English',
    langArabic: 'العربية',

    // Time Range Filters
    range24h: '24 Hours',
    range7d: '7 Days',
    range30d: '30 Days',
    rangeAll: 'All Time',
    refreshTooltip: 'Refresh Analytics',

    // Login Screen
    emailOrUsernameLabel: 'Email or Username',
    emailOrUsernamePlaceholder: 'admin@weshnakul.com',
    passwordLabel: 'Admin Password',
    passwordPlaceholder: '••••••••••••',
    accessDashboard: 'Access Dashboard',
    verifyingCredentials: 'Verifying credentials...',
    errorEmptyPassword: 'Please enter your administrative password.',
    errorDefaultLogin: 'Login failed. Please check your credentials.',

    // Error & Loading States
    errorTitle: 'Error Loading Analytics',
    retry: 'Retry',
    loadingTitle: 'Analyzing event logs and calculating metrics...',
    loadingSubtitle: 'Aggregating authoritative analytics events',

    // KPI Cards
    kpiSessions: 'Sessions',
    kpiUniqueVisitors: 'Unique Visitors:',
    kpiRoomsCreated: 'Rooms Created',
    kpiFailed: 'Failed:',
    kpiSwipes: 'Swipes',
    kpiRevotes: 'Revotes: {count}',
    kpiNoRevotes: '0 Revotes',
    kpiWinningMatches: 'Winning Matches',
    kpiMinigames: 'Mini-Games:',

    // Sub-KPIs
    kpiMapsClicks: 'Maps Clicks',
    kpiDeliveryClicks: 'Delivery Clicks',
    kpiRoomsJoined: 'Rooms Joined',
    kpiRoomsJoinedFailed: '({count} failed)',
    kpiTechFailures: 'Technical Failures',

    // Activity Timeline
    timelineTitle: 'Activity Over Time',
    timelineSubtitle: 'Volume of sessions, rooms created, and swipes over the selected window',
    timelineEmpty: 'No activity records found in the selected time window',
    timelineSessions: 'Sessions',
    timelineRooms: 'Rooms',
    timelineSwipes: 'Swipes',
    eventsCount: '{count} events',

    // Modes & Categories
    modesCategoriesTitle: 'Modes & Categories',
    modesCategoriesSubtitle: 'Distribution of dining preferences and room setups',
    roomModeHeading: 'Room Mode',
    eatingModeHeading: 'Eating Mode',
    foodCategoriesHeading: 'Top Food Categories',
    noDataRecorded: 'No data recorded',
    noCategoriesRecorded: 'No categories recorded',

    // Room Modes
    modeFood: 'Lunch / Dinner',
    modeBreakfast: 'Breakfast',
    modeCafes: 'Cafes & Sweets',

    // Eating Modes
    eatDelivery: 'Delivery',
    eatDineIn: 'Dine-In',
    eatAny: 'Any Mode',

    // Swipes & Winners
    swipesWinnersTitle: 'Swipes & Winners',
    swipesWinnersSubtitle: 'Player voting distribution and winning restaurants',
    votePolarityHeading: 'Vote Polarity',
    voteYes: 'YES',
    voteNo: 'NO',
    voteLater: 'LATER',
    noSwipesRecorded: 'No swipes recorded',
    topWinnersHeading: 'Top Winning Restaurants',
    noWinnersResolved: 'No winners resolved in this window',
    winsCount: '{count} wins',
    minigamesHeading: 'Tie-Breaker Mini-Games',
    noMinigamesRecorded: 'No mini-games recorded',
    minigameStarted: 'Started: {count}',
    minigameCompleted: 'Completed: {count}',

    // Mini-Game Names
    gameCaptainRoulette: 'Captain Roulette',
    gameShuffleCards: 'Shuffle Cards',
    gameEmojiClash: 'Emoji Clash',

    // Recent Events Audit Feed
    recentEventsTitle: 'Recent Events Audit Feed',
    recentEventsSubtitle: 'Latest 50 events in the database with strict privacy and no sensitive data',
    recentEventsEmpty: 'No events found in this window',
    colTimeKsa: 'Time (KSA)',
    colEventType: 'Event Type',
    colRoomCode: 'Room Code',
    colCategory: 'Category',
    colEatingMode: 'Eating Mode',
    colRoomMode: 'Mode',
  },

  ar: {
    // Common & Navigation
    portalTitle: 'وش ناكل — لوحة التحليلات',
    portalSubtitle: 'لوحة التحكم والعمليات والتحليلات المؤمنة',
    phaseBadge: 'المرحلة 2 — قراءة فقط',
    liveGateway: 'بوابة الحافة المباشرة',
    backToApp: 'العودة للتطبيق',
    logout: 'خروج',
    adminGateway: 'بوابة المشرفين',
    restrictedAccess: 'منطقة وصول مقيدة ومحمية',
    restrictedAccessDesc: 'محمي بالتحقق البرمجي على الخادم ومعدل طلبات الحافة.',
    verifyingAdmin: 'جاري التحقق من هوية المشرف...',

    // Language Toggle
    langEnglish: 'English',
    langArabic: 'العربية',

    // Time Range Filters
    range24h: '24 ساعة',
    range7d: '7 أيام',
    range30d: '30 يوم',
    rangeAll: 'الكل',
    refreshTooltip: 'تحديث التحليلات',

    // Login Screen
    emailOrUsernameLabel: 'البريد الإلكتروني أو اسم المستخدم',
    emailOrUsernamePlaceholder: 'admin@weshnakul.com',
    passwordLabel: 'كلمة المرور الإدارية',
    passwordPlaceholder: '••••••••••••',
    accessDashboard: 'تسجيل الدخول الإداري',
    verifyingCredentials: 'جاري التحقق من الصلاحيات...',
    errorEmptyPassword: 'الرجاء إدخال كلمة المرور الإدارية.',
    errorDefaultLogin: 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.',

    // Error & Loading States
    errorTitle: 'خطأ في استرجاع التحليلات',
    retry: 'إعادة المحاولة',
    loadingTitle: 'جاري تحليل بيانات الفعاليات وقراءة السجلات...',
    loadingSubtitle: 'تجميع سجلات الفعاليات المعتمدة',

    // KPI Cards
    kpiSessions: 'الجلسات',
    kpiUniqueVisitors: 'الزوار الفريدين:',
    kpiRoomsCreated: 'الغرف المنشأة',
    kpiFailed: 'الفشل:',
    kpiSwipes: 'التمريرات',
    kpiRevotes: 'إعادة تصويت: {count}',
    kpiNoRevotes: '0 إعادة تصويت',
    kpiWinningMatches: 'المطابقات الفائزة',
    kpiMinigames: 'الألعاب المصغرة:',

    // Sub-KPIs
    kpiMapsClicks: 'نقرات الخرائط',
    kpiDeliveryClicks: 'نقرات التوصيل',
    kpiRoomsJoined: 'الانضمام للغرف',
    kpiRoomsJoinedFailed: '({count} فشل)',
    kpiTechFailures: 'الأخطاء التقنية',

    // Activity Timeline
    timelineTitle: 'نشاط الفعاليات عبر الزمن',
    timelineSubtitle: 'معدل الجلسات، إنشاء الغرف، والتمريرات حسب الفترة الزمنية المحددة',
    timelineEmpty: 'لا توجد سجلات كافية لرسم المخطط الزمني في هذه الفترة',
    timelineSessions: 'جلسات',
    timelineRooms: 'غرف',
    timelineSwipes: 'تمريرات',
    eventsCount: '{count} فعالية',

    // Modes & Categories
    modesCategoriesTitle: 'أنماط الغرف والتصنيفات',
    modesCategoriesSubtitle: 'توزيع اختيارات الأكل وأنماط الغرف',
    roomModeHeading: 'نمط الغرفة',
    eatingModeHeading: 'طريقة الأكل',
    foodCategoriesHeading: 'أعلى تصنيفات الطعام',
    noDataRecorded: 'لا توجد بيانات مسجلة',
    noCategoriesRecorded: 'لا توجد تصنيفات مسجلة',

    // Room Modes
    modeFood: 'وجبة غداء/عشاء',
    modeBreakfast: 'فطور',
    modeCafes: 'كافيهات وحلى',

    // Eating Modes
    eatDelivery: 'توصيل',
    eatDineIn: 'جلسة مطعم',
    eatAny: 'أي خيار',

    // Swipes & Winners
    swipesWinnersTitle: 'التمريرات والمطابقات',
    swipesWinnersSubtitle: 'اتجاه تصويت اللاعبين والمطاعم الفائزة',
    votePolarityHeading: 'توزيع قرارات التمرير',
    voteYes: 'نعم (YES)',
    voteNo: 'لا (NO)',
    voteLater: 'لاحقاً (LATER)',
    noSwipesRecorded: 'لا توجد تمريرات مسجلة',
    topWinnersHeading: 'المطاعم الفائزة',
    noWinnersResolved: 'لم يتم حسم أي فائز في هذه الفترة',
    winsCount: '{count} فوز',
    minigamesHeading: 'الألعاب المصغرة لحسم التعادل',
    noMinigamesRecorded: 'لم تبدأ أي لعبة مصغرة في هذه الفترة',
    minigameStarted: 'بدء: {count}',
    minigameCompleted: 'اكتمل: {count}',

    // Mini-Game Names
    gameCaptainRoulette: 'روليت الكابتن',
    gameShuffleCards: 'شقلب الورق',
    gameEmojiClash: 'معركة الإيموجي',

    // Recent Events Audit Feed
    recentEventsTitle: 'سجل الفعاليات الأخير',
    recentEventsSubtitle: 'آخر 50 فعالية مسجلة في قاعدة البيانات بصيغة مؤمنة وبدون بيانات حساسة',
    recentEventsEmpty: 'لا توجد أي فعاليات مسجلة خلال الفترة المختارة',
    colTimeKsa: 'الوقت (KSA)',
    colEventType: 'نوع الفعالية',
    colRoomCode: 'رمز الغرفة',
    colCategory: 'التصنيف',
    colEatingMode: 'طريقة الأكل',
    colRoomMode: 'النمط',
  },
};
