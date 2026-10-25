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

  // Phase 3 Tabs & Filters
  tabOverview: string;
  tabDeepAnalytics: string;
  tabAlgorithmHealth: string;
  tabCatalogHistory: string;
  filterAllCategories: string;
  filterAllDistricts: string;
  filterAllEatingModes: string;
  filterAllRoomModes: string;
  filterApply: string;
  filterReset: string;
  exportCsv: string;
  exporting: string;
  exportTruncatedWarning: string;

  // Phase 3 Deep Analytics KPIs
  kpiApprovalRate: string;
  kpiApprovalFormula: string;
  kpiExposureToYes: string;
  kpiExposureFormula: string;
  kpiCardImpressions: string;
  kpiCandidatesGenerated: string;
  kpiMatches: string;
  kpiTechnicalFailures: string;
  kpiExplicitExits: string;

  // Phase 3 Algorithm Health & Diagnostics
  algoTitle: string;
  algoSubtitle: string;
  hhiIndex: string;
  hhiHealthy: string;
  hhiModerate: string;
  hhiHigh: string;
  topBrandShare: string;
  distinctBrands: string;
  brandPerformance: string;
  brandTableDesc: string;
  colRestaurant: string;
  colCandidates: string;
  colImpressions: string;
  colYesNoLater: string;
  colApprovalRate: string;
  colExposureRate: string;
  colWins: string;
  colWinRate: string;
  winsPerImpressionTitle: string;
  winsPerImpressionShort: string;
  winsPerImpressionHelp: string;
  colConfidence: string;
  badgeLowConfidence: string;
  badgeSufficientSample: string;
  noBrandsFound: string;

  // Phase 3 Resolution Methods
  resolutionBreakdown: string;
  resolutionBreakdownDesc: string;

  // Phase 3 Catalog History
  catalogHistoryTitle: string;
  catalogHistorySubtitle: string;
  colEffectiveAt: string;
  colEntityType: string;
  colAction: string;
  colChangedBy: string;
  colSummary: string;
  noHistoryFound: string;

  // Phase 3 Pagination
  pageShowing: string;
  pagePrev: string;
  pageNext: string;

  // Phase 4 Catalog Controls
  tabCatalogControls: string;
  catalogControlsTitle: string;
  catalogControlsSubtitle: string;
  btnNewDraft: string;
  btnBulkEdit: string;
  btnExportCatalogCsv: string;
  tabBrandsBranches: string;
  tabDrafts: string;
  tabEmergencyReminders: string;
  searchCatalogPlaceholder: string;
  filterAllStatuses: string;
  filterStatusOpen: string;
  filterStatusTemporarilyClosed: string;
  filterStatusPermanentlyClosed: string;
  filterStatusUnknown: string;
  colBrand: string;
  colBranchesCount: string;
  colPrimaryCategory: string;
  colOperatingStatus: string;
  colResearchUse: string;
  colReadinessStatus: string;
  colActions: string;
  btnEditBrand: string;
  btnViewBranches: string;
  btnAddBranch: string;
  btnEmergencyHide: string;
  btnEmergencyUnavailable: string;
  btnRestore: string;
  colBranchName: string;
  colDistrict: string;
  colAddress: string;
  colBranchStatus: string;
  colMapsUrl: string;
  colReadiness: string;
  badgeEligible: string;
  badgeBlocked: string;
  badgeReady: string;
  badgeNotReady: string;
  badgeStaleConflict: string;
  badgeDraft: string;
  badgeValidated: string;
  badgePublished: string;
  badgeCancelled: string;
  modalEditBrandTitle: string;
  modalEditBranchTitle: string;
  modalDraftPreviewTitle: string;
  labelBrandNameEn: string;
  labelBrandNameAr: string;
  labelCategories: string;
  labelDiningMode: string;
  labelPriceTier: string;
  labelEditorialRole: string;
  labelResearchUse: string;
  labelBranchNameEn: string;
  labelBranchNameAr: string;
  labelDistrict: string;
  labelAddressEn: string;
  labelAddressAr: string;
  labelLatitude: string;
  labelLongitude: string;
  labelGoogleMapsUrl: string;
  labelBranchStatus: string;
  labelDineIn: string;
  labelTakeaway: string;
  label24Hours: string;
  labelLateNight: string;
  previewSummary: string;
  previewAffectedEntities: string;
  previewDiffTitle: string;
  previewBefore: string;
  previewAfter: string;
  previewValidationErrors: string;
  previewValidationWarnings: string;
  previewReadinessImpact: string;
  labelReasonOptional: string;
  labelReasonRequired: string;
  placeholderReason: string;
  btnSaveDraft: string;
  btnValidateDraft: string;
  btnPublishNow: string;
  btnDiscardDraft: string;
  btnReconcileDraft: string;
  confirmPublishPrompt: string;
  publishingInProgress: string;
  publishSuccessMessage: string;
  publishFailedMessage: string;
  emergencyModalTitle: string;
  emergencyActionType: string;
  emergencyHideBrandDesc: string;
  emergencyHideBranchDesc: string;
  emergencyUnavailableDesc: string;
  emergencyReviewDeadline: string;
  deadline24h: string;
  deadline48h: string;
  deadline7d: string;
  deadline30d: string;
  emergencyReminderNotice: string;
  btnApplyEmergency: string;
  btnRestoreEntity: string;
  emergencyActiveBadge: string;
  btnRollbackToSnapshot: string;
  rollbackModalTitle: string;
  rollbackWarningNotice: string;

  // Phase 5 Algorithm Controls
  tabAlgorithmControls: string;
  algoControlsTitle: string;
  algoControlsSubtitle: string;
  secRankingPriorities: string;
  secGeographicRelevance: string;
  secRepetitionDiversity: string;
  secOverrides: string;
  secDraftPreview: string;
  secVersionHistory: string;
  badgeActiveVersion: string;
  badgeDraftModified: string;
  badgeDraftSaved: string;
  badgeDraftInSync: string;
  btnSaveAlgoDraft: string;
  btnDiscardAlgoDraft: string;
  btnPublishAlgoConfig: string;
  btnValidateConfig: string;
  btnRunPreview: string;
  labelCurrentPublished: string;
  labelDraftValue: string;
  labelAllowedRange: string;
  labelPracticalEffect: string;
  labelScopeGlobal: string;
  labelScopeOverride: string;
  labelScopeInherited: string;
  btnAddOverride: string;
  btnRemoveOverride: string;
  selectScopePlaceholder: string;
  previewScenarioTitle: string;
  previewColPublishedDeck: string;
  previewColProposedDeck: string;
  previewNoChangesNotice: string;
  previewChangesDetectedNotice: string;
  previewAddedCards: string;
  previewRemovedCards: string;
  previewRankMoved: string;
  previewScoreDelta: string;
  colVersionNum: string;
  colPublishedAt: string;
  colPublishedBy: string;
  colChangeSummary: string;
  colRollbackOf: string;
  colStatus: string;
  badgeActive: string;
  badgeHistoric: string;
  btnRollbackToVersion: string;
  rollbackConfirmTitle: string;
  rollbackConfirmPrompt: string;
  btnConfirmRollback: string;
  publishConfirmTitle: string;
  publishConfirmPrompt: string;
  inputReasonPlaceholder: string;
  validationPassed: string;
  validationFailed: string;
  resetToDefault: string;
  resetToPublished: string;
  // Feedback Inbox (Phase 6)
  tabFeedbackInbox: string;
  feedbackTitle: string;
  feedbackSubtitle: string;
  filterAllTypes: string;
  filterTypeBug: string;
  filterTypeComment: string;
  filterTypeBrand: string;
  statusNew: string;
  statusUnderReview: string;
  statusResolved: string;
  statusRejected: string;
  colType: string;
  colMessage: string;
  colAuthorOrBrand: string;
  colDate: string;
  btnViewDetails: string;
  detailTitle: string;
  detailTypeLabel: string;
  detailStatusLabel: string;
  detailDateLabel: string;
  detailOriginalText: string;
  detailDiagnosticsTitle: string;
  detailDiagnosticsRoute: string;
  detailDiagnosticsError: string;
  detailBrandTitle: string;
  detailBrandName: string;
  detailBrandLocation: string;
  detailBrandDistrict: string;
  detailBrandOwnerStatus: string;
  detailBrandOwnerYes: string;
  detailBrandOwnerNo: string;
  detailBrandPhone: string;
  detailBrandPhoneNotice: string;
  detailAuditTitle: string;
  detailAuditEmpty: string;
  detailStatusChangePrompt: string;
  detailStatusUpdating: string;
  detailStatusUpdatedSuccess: string;
  detailTranslationNotice: string;
  emptyFeedbackTitle: string;
  emptyFeedbackDesc: string;
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

    // Phase 3 Tabs & Filters
    tabOverview: 'Overview',
    tabDeepAnalytics: 'Deep Analytics',
    tabAlgorithmHealth: 'Algorithm Health',
    tabCatalogHistory: 'Catalog History',
    filterAllCategories: 'All Categories',
    filterAllDistricts: 'All Districts',
    filterAllEatingModes: 'All Eating Modes',
    filterAllRoomModes: 'All Room Modes',
    filterApply: 'Apply Filters',
    filterReset: 'Reset',
    exportCsv: 'Export CSV (Max 5,000)',
    exporting: 'Exporting...',
    exportTruncatedWarning: 'Export was truncated to 5,000 rows. Narrow your filters for complete slices.',

    // Phase 3 Deep Analytics KPIs
    kpiApprovalRate: 'Approval Rate',
    kpiApprovalFormula: 'YES / (YES + NO + LATER)',
    kpiExposureToYes: 'Exposure-to-YES',
    kpiExposureFormula: 'YES / Card Impressions',
    kpiCardImpressions: 'Card Impressions',
    kpiCandidatesGenerated: 'Candidates Generated',
    kpiMatches: 'Matches Resolved',
    kpiTechnicalFailures: 'Technical Failures',
    kpiExplicitExits: 'Explicit Exits',

    // Phase 3 Algorithm Health & Diagnostics
    algoTitle: 'Algorithm Health & Exposure Concentration',
    algoSubtitle: 'Diagnostics for candidate exposure diversity, brand exposure distribution, and low sample flags.',
    hhiIndex: 'HHI Concentration Index',
    hhiHealthy: 'Healthy Diversity (< 1500)',
    hhiModerate: 'Moderate Concentration (1500 - 2500)',
    hhiHigh: 'High Concentration (> 2500)',
    topBrandShare: 'Top Brand Impression Share',
    distinctBrands: 'Distinct Brands Displayed',
    brandPerformance: 'Brand Performance & Low-Confidence Flags',
    brandTableDesc: 'Brands with fewer than 20 qualifying impressions are explicitly flagged as low-confidence.',
    colRestaurant: 'Restaurant / Brand',
    colCandidates: 'Candidates',
    colImpressions: 'Impressions',
    colYesNoLater: 'YES / NO / LATER',
    colApprovalRate: 'Approval Rate',
    colExposureRate: 'Exposure-to-YES',
    colWins: 'Wins',
    colWinRate: 'Wins per 100 card impressions',
    winsPerImpressionTitle: 'Wins per 100 card impressions',
    winsPerImpressionShort: 'per 100 impressions',
    winsPerImpressionHelp:
      'Descriptive ratio only. Not a win rate per eligible decision round. Card impressions may repeat across participants and re-queued cards.',
    colConfidence: 'Sample Status',
    badgeLowConfidence: 'Low Confidence (< 20)',
    badgeSufficientSample: 'Sufficient Sample',
    noBrandsFound: 'No brand impressions match current filters',

    // Phase 3 Resolution Methods
    resolutionBreakdown: 'Winner Resolution Methods',
    resolutionBreakdownDesc: 'Distribution of matches across consensus, host pick, and tie-breaker mini-games.',

    // Phase 3 Catalog History
    catalogHistoryTitle: 'Forward-Only Catalog Change History',
    catalogHistorySubtitle: 'Auditable trail of catalog and algorithm updates starting from the Phase 3 baseline.',
    colEffectiveAt: 'Effective Date (UTC)',
    colEntityType: 'Entity Type',
    colAction: 'Action',
    colChangedBy: 'Changed By',
    colSummary: 'Change Summary',
    noHistoryFound: 'No catalog changes recorded since baseline',

    // Phase 3 Pagination
    pageShowing: 'Showing {from} - {to} of {total}',
    pagePrev: 'Previous',
    pageNext: 'Next',

    // Phase 4 Catalog Controls
    tabCatalogControls: 'Catalog Controls',
    catalogControlsTitle: 'Catalog Controls & Change Sets',
    catalogControlsSubtitle: 'Secure draft, validation, preview, and atomic publication workflow for Jeddah brands and branches.',
    btnNewDraft: 'New Draft',
    btnBulkEdit: 'Bulk Edit',
    btnExportCatalogCsv: 'Export Catalog CSV',
    tabBrandsBranches: 'Brands & Branches',
    tabDrafts: 'Draft Change Sets',
    tabEmergencyReminders: 'Emergency Reminders',
    searchCatalogPlaceholder: 'Search brands, branches, or IDs...',
    filterAllStatuses: 'All Statuses',
    filterStatusOpen: 'Open',
    filterStatusTemporarilyClosed: 'Temporarily Closed',
    filterStatusPermanentlyClosed: 'Permanently Closed',
    filterStatusUnknown: 'Unknown',
    colBrand: 'Brand / Restaurant',
    colBranchesCount: 'Branches',
    colPrimaryCategory: 'Category',
    colOperatingStatus: 'Operating Status',
    colResearchUse: 'Research Use',
    colReadinessStatus: 'Readiness',
    colActions: 'Actions',
    btnEditBrand: 'Edit Brand',
    btnViewBranches: 'View Branches',
    btnAddBranch: 'Add Branch',
    btnEmergencyHide: 'Hide from Recommendations',
    btnEmergencyUnavailable: 'Mark Unavailable',
    btnRestore: 'Restore to Recommendations',
    colBranchName: 'Branch Name',
    colDistrict: 'District',
    colAddress: 'Address',
    colBranchStatus: 'Branch Status',
    colMapsUrl: 'Maps Link',
    colReadiness: 'Readiness',
    badgeEligible: 'Eligible',
    badgeBlocked: 'Blocked',
    badgeReady: 'Ready',
    badgeNotReady: 'Not Ready',
    badgeStaleConflict: 'Stale Conflict',
    badgeDraft: 'Draft',
    badgeValidated: 'Validated',
    badgePublished: 'Published',
    badgeCancelled: 'Cancelled',
    modalEditBrandTitle: 'Edit Brand Details',
    modalEditBranchTitle: 'Edit Branch Details',
    modalDraftPreviewTitle: 'Review Draft Change Set & Publish',
    labelBrandNameEn: 'Brand Name (English)',
    labelBrandNameAr: 'Brand Name (Arabic)',
    labelCategories: 'Categories (comma-separated)',
    labelDiningMode: 'Dining Mode',
    labelPriceTier: 'Price Tier',
    labelEditorialRole: 'Editorial Role',
    labelResearchUse: 'Research Use & Eligibility',
    labelBranchNameEn: 'Branch Name (English)',
    labelBranchNameAr: 'Branch Name (Arabic)',
    labelDistrict: 'Jeddah District (Canonical)',
    labelAddressEn: 'Physical Address (English)',
    labelAddressAr: 'Physical Address (Arabic)',
    labelLatitude: 'Latitude (21.0 to 22.0)',
    labelLongitude: 'Longitude (39.0 to 39.5)',
    labelGoogleMapsUrl: 'Google Maps URL (https://)',
    labelBranchStatus: 'Branch Operating Status',
    labelDineIn: 'Dine-In Available',
    labelTakeaway: 'Takeaway Available',
    label24Hours: 'Open 24 Hours',
    labelLateNight: 'Late Night Service',
    previewSummary: 'Change Set Summary',
    previewAffectedEntities: 'Affected Entities',
    previewDiffTitle: 'Field Value Changes (Before vs After)',
    previewBefore: 'Existing Value',
    previewAfter: 'Proposed Value',
    previewValidationErrors: 'Validation Errors (Publication Blocked)',
    previewValidationWarnings: 'Validation Warnings & Readiness Impact',
    previewReadinessImpact: 'Recommendation Eligibility Impact',
    labelReasonOptional: 'Reason for Publication (Optional for routine edits)',
    labelReasonRequired: 'Reason (Strictly required for emergency, rollback, or restore)',
    placeholderReason: 'Explain why this change is being made...',
    btnSaveDraft: 'Save as Isolated Draft',
    btnValidateDraft: 'Validate Draft on Server',
    btnPublishNow: 'Authorize & Publish Atomically',
    btnDiscardDraft: 'Discard Draft',
    btnReconcileDraft: 'Reload & Reconcile Stale Draft',
    confirmPublishPrompt: 'Are you sure you want to publish these changes live? This operation is atomic and forward-audited.',
    publishingInProgress: 'Publishing atomically...',
    publishSuccessMessage: 'Change set published successfully and verified in audit history.',
    publishFailedMessage: 'Publication failed. No live catalog records were modified.',
    emergencyModalTitle: 'Emergency Catalog Control',
    emergencyActionType: 'Action Type',
    emergencyHideBrandDesc: 'Immediately excludes all branches of this brand from recommendation decks.',
    emergencyHideBranchDesc: 'Immediately excludes this specific branch from recommendation decks.',
    emergencyUnavailableDesc: 'Temporarily marks this branch closed or out of service.',
    emergencyReviewDeadline: 'Review Deadline Reminder',
    deadline24h: '24 Hours',
    deadline48h: '48 Hours',
    deadline7d: '7 Days',
    deadline30d: '30 Days',
    emergencyReminderNotice: 'Notice: Passing the review deadline sends a reminder but never restores records automatically. An administrator must explicitly authorize restoration.',
    btnApplyEmergency: 'Apply Emergency Control',
    btnRestoreEntity: 'Restore Entity',
    emergencyActiveBadge: 'Active Emergency Control',
    btnRollbackToSnapshot: 'Forward Rollback to Snapshot',
    rollbackModalTitle: 'Forward Rollback Confirmation',
    rollbackWarningNotice: 'Rollback creates a new forward audit entry restoring the prior state. It will not erase historical records.',

    // Phase 5 Algorithm Controls
    tabAlgorithmControls: 'Algorithm Controls',
    algoControlsTitle: 'Recommendation Algorithm Controls',
    algoControlsSubtitle: 'Fine-tune ranking priorities, geographic relevance, and diversity with draft preview and rollback',
    secRankingPriorities: 'Ranking Priorities',
    secGeographicRelevance: 'Geographic Relevance',
    secRepetitionDiversity: 'Repetition & Diversity',
    secOverrides: 'Mode & Category Overrides',
    secDraftPreview: 'Draft Validation & Preview',
    secVersionHistory: 'Published Configuration & History',
    badgeActiveVersion: 'Active Version',
    badgeDraftModified: 'Unsaved Draft Changes',
    badgeDraftSaved: 'Draft Saved',
    badgeDraftInSync: 'Draft in Sync with Published',
    btnSaveAlgoDraft: 'Save Draft',
    btnDiscardAlgoDraft: 'Discard Draft',
    btnPublishAlgoConfig: 'Publish Configuration',
    btnValidateConfig: 'Validate Settings',
    btnRunPreview: 'Run Live Preview',
    labelCurrentPublished: 'Published',
    labelDraftValue: 'Draft',
    labelAllowedRange: 'Range',
    labelPracticalEffect: 'Practical Effect',
    labelScopeGlobal: 'Global Default',
    labelScopeOverride: 'Override',
    labelScopeInherited: 'Inherited',
    btnAddOverride: 'Add Override',
    btnRemoveOverride: 'Remove Override',
    selectScopePlaceholder: 'Select Mode or Category...',
    previewScenarioTitle: 'Evaluation Scenario',
    previewColPublishedDeck: 'Current Published Deck',
    previewColProposedDeck: 'Proposed Draft Deck',
    previewNoChangesNotice: 'Both configurations yield identical candidate decks for this scenario.',
    previewChangesDetectedNotice: 'Differences detected between published and proposed settings.',
    previewAddedCards: 'New in Proposed',
    previewRemovedCards: 'Dropped from Deck',
    previewRankMoved: 'Position Changed',
    previewScoreDelta: 'Score Delta',
    colVersionNum: 'Version',
    colPublishedAt: 'Published At',
    colPublishedBy: 'Publisher',
    colChangeSummary: 'Summary',
    colRollbackOf: 'Restored From',
    colStatus: 'Status',
    badgeActive: 'Active',
    badgeHistoric: 'Historic',
    btnRollbackToVersion: 'Rollback',
    rollbackConfirmTitle: 'Confirm Algorithm Rollback',
    rollbackConfirmPrompt: 'Are you sure you want to restore settings from version v{targetVersion}? This will create a new immutable published version atomically.',
    btnConfirmRollback: 'Restore & Activate',
    publishConfirmTitle: 'Publish Algorithm Configuration',
    publishConfirmPrompt: 'Publishing will immediately update live recommendation ranking for all customer rooms. Enter an optional reason or summary for the audit log:',
    inputReasonPlaceholder: 'e.g., Increased geographic proximity weight for faster delivery',
    validationPassed: 'All settings valid and within safety bounds',
    validationFailed: 'Configuration contains validation errors',
    resetToDefault: 'Default',
    resetToPublished: 'Published',
    // Feedback Inbox (Phase 6)
    tabFeedbackInbox: 'Feedback Inbox',
    feedbackTitle: 'Feedback & Operations Inbox',
    feedbackSubtitle: 'Review incoming bug reports, comments, and brand suggestions from test users.',
    filterAllTypes: 'All Types',
    filterTypeBug: 'Bugs',
    filterTypeComment: 'Comments',
    filterTypeBrand: 'Brand Suggestions',
    statusNew: 'New',
    statusUnderReview: 'Under review',
    statusResolved: 'Resolved',
    statusRejected: 'Rejected',
    colType: 'Type',
    colMessage: 'Message / Details',
    colAuthorOrBrand: 'Sender / Brand',
    colDate: 'Submitted (Saudi Time)',
    btnViewDetails: 'View Details',
    detailTitle: 'Submission Details',
    detailTypeLabel: 'Feedback Type',
    detailStatusLabel: 'Current Status',
    detailDateLabel: 'Submission Date',
    detailOriginalText: 'Original Message',
    detailDiagnosticsTitle: 'Safe Diagnostic Context',
    detailDiagnosticsRoute: 'Sanitized Route',
    detailDiagnosticsError: 'Recent Safe Error Event',
    detailBrandTitle: 'Brand Proposal Information',
    detailBrandName: 'Suggested Brand',
    detailBrandLocation: 'Branch / Location',
    detailBrandDistrict: 'District',
    detailBrandOwnerStatus: 'Owner / Representative',
    detailBrandOwnerYes: 'Yes (Authorized Representative)',
    detailBrandOwnerNo: 'No (Regular Customer)',
    detailBrandPhone: 'Contact Phone Number',
    detailBrandPhoneNotice: 'Restricted contact data. Visible only to authorized administrators for follow-up.',
    detailAuditTitle: 'Status Change History',
    detailAuditEmpty: 'No status changes recorded yet.',
    detailStatusChangePrompt: 'Update Status:',
    detailStatusUpdating: 'Updating status...',
    detailStatusUpdatedSuccess: 'Status updated successfully.',
    detailTranslationNotice: 'Translation unavailable in this release. Displaying original submitted text.',
    emptyFeedbackTitle: 'No feedback submissions found',
    emptyFeedbackDesc: 'No feedback matches the selected filters.',
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

    // Phase 3 Tabs & Filters
    tabOverview: 'نظرة عامة',
    tabDeepAnalytics: 'تحليلات تفصيلية',
    tabAlgorithmHealth: 'صحة الخوارزمية',
    tabCatalogHistory: 'سجل التغييرات',
    filterAllCategories: 'جميع التصنيفات',
    filterAllDistricts: 'جميع الأحياء',
    filterAllEatingModes: 'جميع طرق الأكل',
    filterAllRoomModes: 'جميع أنماط الغرف',
    filterApply: 'تطبيق الفلاتر',
    filterReset: 'إعادة ضبط',
    exportCsv: 'تصدير CSV (حد أقصى 5,000)',
    exporting: 'جاري التصدير...',
    exportTruncatedWarning: 'تم تقليص التصدير إلى 5,000 سجل للحفاظ على استقرار الخادم. حدد فترة أو فلاتر أضيق للمزيد.',

    // Phase 3 Deep Analytics KPIs
    kpiApprovalRate: 'معدل الموافقة',
    kpiApprovalFormula: 'نعم / (نعم + لا + لاحقاً)',
    kpiExposureToYes: 'التعرض إلى نعم',
    kpiExposureFormula: 'نعم / ظهور البطاقات',
    kpiCardImpressions: 'مرات ظهور البطاقات',
    kpiCandidatesGenerated: 'المرشحون المولدون',
    kpiMatches: 'المطابقات المحسومة',
    kpiTechnicalFailures: 'الأخطاء التقنية',
    kpiExplicitExits: 'الخروج الصريح',

    // Phase 3 Algorithm Health & Diagnostics
    algoTitle: 'صحة الخوارزمية وتركيز التعرض',
    algoSubtitle: 'تشخيص تنوع ترشيح المطاعم، توزيع الظهور، وعلامات انخفاض العينة.',
    hhiIndex: 'مؤشر هيرفندال-هيرشمان (HHI)',
    hhiHealthy: 'تنوع صحي (< 1500)',
    hhiModerate: 'تركيز معتدل (1500 - 2500)',
    hhiHigh: 'تركيز مرتفع (> 2500)',
    topBrandShare: 'حصة المطعم الأعلى ظهوراً',
    distinctBrands: 'عدد المطاعم الفريدة المعروضة',
    brandPerformance: 'أداء المطاعم ومؤشرات انخفاض العينة',
    brandTableDesc: 'المطاعم التي يقل ظهورها عن 20 مرة توصف صراحة بأنها منخفضة الثقة الإحصائية.',
    colRestaurant: 'المطعم / العلامة',
    colCandidates: 'الترشيحات',
    colImpressions: 'الظهور',
    colYesNoLater: 'نعم / لا / لاحقاً',
    colApprovalRate: 'نسبة الموافقة',
    colExposureRate: 'التعرض إلى نعم',
    colWins: 'الفوز',
    colWinRate: 'عدد مرات الفوز لكل 100 ظهور للبطاقة',
    winsPerImpressionTitle: 'عدد مرات الفوز لكل 100 ظهور للبطاقة',
    winsPerImpressionShort: 'لكل 100 ظهور',
    winsPerImpressionHelp:
      'مؤشر وصفي فقط، وليس نسبة الفوز لكل جولة قرار مؤهلة. قد يتكرر احتساب ظهور البطاقة بين المشاركين وعند إعادة البطاقة إلى المجموعة.',
    colConfidence: 'حالة العينة',
    badgeLowConfidence: 'عينة منخفضة (< 20)',
    badgeSufficientSample: 'عينة كافية',
    noBrandsFound: 'لا توجد مطاعم مطابقة للفلاتر المختارة',

    // Phase 3 Resolution Methods
    resolutionBreakdown: 'طرق حسم الفائز',
    resolutionBreakdownDesc: 'توزيع حسم المطابقات بين الإجماع، اختيار المضيف، والألعاب المصغرة.',

    // Phase 3 Catalog History
    catalogHistoryTitle: 'سجل تدقيق وتغييرات الكتالوج',
    catalogHistorySubtitle: 'مسار تدقيق موثوق لتغييرات الكتالوج والخوارزمية بدءاً من الأساس المعتمد للمرحلة الثالثة.',
    colEffectiveAt: 'تاريخ السريان (UTC)',
    colEntityType: 'نوع الكيان',
    colAction: 'الإجراء',
    colChangedBy: 'بواسطة',
    colSummary: 'ملخص التغيير',
    noHistoryFound: 'لا توجد تغييرات مسجلة منذ الأساس',

    // Phase 3 Pagination
    pageShowing: 'عرض {from} - {to} من {total}',
    pagePrev: 'السابق',
    pageNext: 'التالي',

    // Phase 4 Catalog Controls
    tabCatalogControls: 'إدارة الكتالوج',
    catalogControlsTitle: 'إدارة الكتالوج ومجموعات التغيير',
    catalogControlsSubtitle: 'مسار عمل آمن لإنشاء المسودات، الفحص، المعاينة، والنشر المتكامل للعلامات والفروع بجدة.',
    btnNewDraft: 'مسودة جديدة',
    btnBulkEdit: 'تعديل جماعي',
    btnExportCatalogCsv: 'تصدير كتالوج CSV',
    tabBrandsBranches: 'العلامات والفروع',
    tabDrafts: 'مسودات التغيير',
    tabEmergencyReminders: 'تنبيهات الطوارئ',
    searchCatalogPlaceholder: 'ابحث باسم المطعم، الفرع، أو المعرف...',
    filterAllStatuses: 'كافة الحالات',
    filterStatusOpen: 'مفتوح',
    filterStatusTemporarilyClosed: 'مغلق مؤقتاً',
    filterStatusPermanentlyClosed: 'مغلق نهائياً',
    filterStatusUnknown: 'غير محدد',
    colBrand: 'المطعم / العلامة',
    colBranchesCount: 'الفروع',
    colPrimaryCategory: 'التصنيف',
    colOperatingStatus: 'حالة التشغيل',
    colResearchUse: 'استخدام البحث',
    colReadinessStatus: 'الجاهزية',
    colActions: 'الإجراءات',
    btnEditBrand: 'تعديل العلامة',
    btnViewBranches: 'عرض الفروع',
    btnAddBranch: 'إضافة فرع',
    btnEmergencyHide: 'إخفاء من الترشيحات',
    btnEmergencyUnavailable: 'تعيين كغير متاح',
    btnRestore: 'استعادة للترشيحات',
    colBranchName: 'اسم الفرع',
    colDistrict: 'الحي',
    colAddress: 'العنوان',
    colBranchStatus: 'حالة الفرع',
    colMapsUrl: 'رابط الخريطة',
    colReadiness: 'الجاهزية',
    badgeEligible: 'مؤهل',
    badgeBlocked: 'محجوب',
    badgeReady: 'جاهز',
    badgeNotReady: 'غير مكتمل',
    badgeStaleConflict: 'تعارض مسودة قديمة',
    badgeDraft: 'مسودة',
    badgeValidated: 'تم الفحص',
    badgePublished: 'منشور',
    badgeCancelled: 'ملغي',
    modalEditBrandTitle: 'تعديل بيانات العلامة',
    modalEditBranchTitle: 'تعديل بيانات الفرع',
    modalDraftPreviewTitle: 'معاينة مسودة التغيير والنشر',
    labelBrandNameEn: 'اسم العلامة (إنجليزي)',
    labelBrandNameAr: 'اسم العلامة (عربي)',
    labelCategories: 'التصنيفات (مفصولة بفواصل)',
    labelDiningMode: 'طريقة تناول الطعام',
    labelPriceTier: 'فئة السعر',
    labelEditorialRole: 'الدور التحريري',
    labelResearchUse: 'استخدام البحث والأهلية',
    labelBranchNameEn: 'اسم الفرع (إنجليزي)',
    labelBranchNameAr: 'اسم الفرع (عربي)',
    labelDistrict: 'حي جدة (المعتمد)',
    labelAddressEn: 'العنوان الفعلي (إنجليزي)',
    labelAddressAr: 'العنوان الفعلي (عربي)',
    labelLatitude: 'خط العرض (21.0 إلى 22.0)',
    labelLongitude: 'خط الطول (39.0 إلى 39.5)',
    labelGoogleMapsUrl: 'رابط خرائط جوجل (https://)',
    labelBranchStatus: 'حالة تشغيل الفرع',
    labelDineIn: 'جلسات داخلية متاحة',
    labelTakeaway: 'الطلب الخارجي متاح',
    label24Hours: 'مفتوح 24 ساعة',
    labelLateNight: 'خدمة ليلية متأخرة',
    previewSummary: 'ملخص التغييرات',
    previewAffectedEntities: 'الكيانات المتأثرة',
    previewDiffTitle: 'مقارنة القيم (الحالي مقابل المقترح)',
    previewBefore: 'القيمة الحالية',
    previewAfter: 'القيمة المقترحة',
    previewValidationErrors: 'أخطاء الفحص (يمنع النشر)',
    previewValidationWarnings: 'تنبيهات الفحص وأثر الجاهزية',
    previewReadinessImpact: 'أثر الأهلية للترشيح',
    labelReasonOptional: 'سبب التعديل (اختياري للتعديلات العادية)',
    labelReasonRequired: 'السبب (إلزامي لعمليات الطوارئ، التراجع، والاستعادة)',
    placeholderReason: 'وضح سبب تطبيق هذا الإجراء...',
    btnSaveDraft: 'حفظ كمسودة معزولة',
    btnValidateDraft: 'فحص المسودة على الخادم',
    btnPublishNow: 'اعتماد ونشر التغييرات',
    btnDiscardDraft: 'حذف المسودة',
    btnReconcileDraft: 'إعادة تحميل ومزامنة المسودة',
    confirmPublishPrompt: 'هل أنت متأكد من رغبتك في نشر هذه التغييرات حياً؟ العملية ذرية ومسجلة في التدقيق.',
    publishingInProgress: 'جاري النشر بشكل ذري...',
    publishSuccessMessage: 'تم نشر التغييرات بنجاح وتوثيقها في سجل التدقيق.',
    publishFailedMessage: 'فشلت عملية النشر. لم يتم تعديل أي سجل في الكتالوج الحي.',
    emergencyModalTitle: 'إجراءات طوارئ الكتالوج',
    emergencyActionType: 'نوع الإجراء',
    emergencyHideBrandDesc: 'يستبعد كافة فروع هذه العلامة فوراً من بطاقات الترشيح.',
    emergencyHideBranchDesc: 'يستبعد هذا الفرع تحديداً فوراً من بطاقات الترشيح.',
    emergencyUnavailableDesc: 'يعين هذا الفرع كمغلق أو خارج الخدمة مؤقتاً.',
    emergencyReviewDeadline: 'تذكير موعد المراجعة',
    deadline24h: '24 ساعة',
    deadline48h: '48 ساعة',
    deadline7d: '7 أيام',
    deadline30d: '30 يوماً',
    emergencyReminderNotice: 'تنبيه: انقضاء موعد المراجعة يرسل تنبيهاً ولا يستعيد السجلات تلقائياً أبداً. الاستعادة تتطلب تدخلاً صريحاً من المشرف.',
    btnApplyEmergency: 'تطبيق إجراء الطوارئ',
    btnRestoreEntity: 'استعادة الكيان للترشيح',
    emergencyActiveBadge: 'إجراء طوارئ نشط',
    btnRollbackToSnapshot: 'تراجع للأمام إلى اللقطة',
    rollbackModalTitle: 'تأكيد التراجع الأمامي',
    rollbackWarningNotice: 'التراجع ينشئ حدث تدقيق أمامي جديد يستعيد الحالة السابقة ولا يمسح السجلات التاريخية.',

    // Phase 5 Algorithm Controls
    tabAlgorithmControls: 'إعدادات الخوارزمية',
    algoControlsTitle: 'لوحة التحكم بخوارزمية التوصيات',
    algoControlsSubtitle: 'ضبط أولويات الترتيب والقرب الجغرافي والتنوع مع معاينة المسودات وسجل الإصدارات',
    secRankingPriorities: 'أولويات الترتيب',
    secGeographicRelevance: 'الملاءمة والقرب الجغرافي',
    secRepetitionDiversity: 'تجنب التكرار وتنوع الخيارات',
    secOverrides: 'تخصيص الأوضاع والتصنيفات',
    secDraftPreview: 'التحقق ومعاينة المسودة',
    secVersionHistory: 'الإصدارات المنشورة وسجل التغييرات',
    badgeActiveVersion: 'الإصدار النشط',
    badgeDraftModified: 'مسودة معدلة غير محفوظة',
    badgeDraftSaved: 'المسودة محفوظة',
    badgeDraftInSync: 'المسودة متطابقة مع المنشور',
    btnSaveAlgoDraft: 'حفظ المسودة',
    btnDiscardAlgoDraft: 'تجاهل المسودة',
    btnPublishAlgoConfig: 'نشر الإعدادات',
    btnValidateConfig: 'التحقق من الإعدادات',
    btnRunPreview: 'تشغيل المعاينة',
    labelCurrentPublished: 'المنشور',
    labelDraftValue: 'المسودة',
    labelAllowedRange: 'النطاق المسموح',
    labelPracticalEffect: 'الأثر العملي',
    labelScopeGlobal: 'إعداد عام',
    labelScopeOverride: 'تخصيص',
    labelScopeInherited: 'موروث',
    btnAddOverride: 'إضافة تخصيص',
    btnRemoveOverride: 'إزالة التخصيص',
    selectScopePlaceholder: 'اختر وضعاً أو تصنيفاً...',
    previewScenarioTitle: 'سيناريو المعاينة',
    previewColPublishedDeck: 'القائمة المنشورة حالياً',
    previewColProposedDeck: 'القائمة المقترحة بالمسودة',
    previewNoChangesNotice: 'كلا الإعدادين أنتجا نفس بطاقات المطاعم لهذا السيناريو.',
    previewChangesDetectedNotice: 'تم رصد اختلافات بين الإعداد المنشور والمسودة المقترحة.',
    previewAddedCards: 'جديد في المقترح',
    previewRemovedCards: 'مستبعد من القائمة',
    previewRankMoved: 'تغير الترتيب',
    previewScoreDelta: 'فارق النقاط',
    colVersionNum: 'الإصدار',
    colPublishedAt: 'تاريخ النشر',
    colPublishedBy: 'الناشر',
    colChangeSummary: 'ملخص التغيير',
    colRollbackOf: 'مسترجع من',
    colStatus: 'الحالة',
    badgeActive: 'نشط',
    badgeHistoric: 'أرشيف',
    btnRollbackToVersion: 'استرجاع',
    rollbackConfirmTitle: 'تأكيد استرجاع إعدادات الخوارزمية',
    rollbackConfirmPrompt: 'هل أنت متأكد من استرجاع إعدادات الإصدار v{targetVersion}؟ سيتم إنشاء إصدار منشور جديد فورياً وبشكل آمن.',
    btnConfirmRollback: 'استرجاع وتفعيل',
    publishConfirmTitle: 'نشر إعدادات الخوارزمية',
    publishConfirmPrompt: 'النشر سيقوم فوراً بتطبيق الإعدادات الجديدة على جميع غرف العملاء. اكتب سبباً أو ملخصاً لسجل التدقيق (اختياري):',
    inputReasonPlaceholder: 'مثال: رفع وزن القرب الجغرافي لتسريع التوصيل',
    validationPassed: 'جميع الإعدادات صحيحة وضمن الحدود الآمنة',
    validationFailed: 'توجد أخطاء في قيم الإعدادات',
    resetToDefault: 'الافتراضي',
    resetToPublished: 'المنشور',
    // Feedback Inbox (Phase 6)
    tabFeedbackInbox: 'صندوق الملاحظات',
    feedbackTitle: 'صندوق الملاحظات والعمليات',
    feedbackSubtitle: 'مراجعة بلاغات المشاكل، والآراء، واقتراحات المطاعم من المستخدمين.',
    filterAllTypes: 'جميع الأنواع',
    filterTypeBug: 'المشاكل',
    filterTypeComment: 'الملاحظات',
    filterTypeBrand: 'اقتراحات المطاعم',
    statusNew: 'جديد',
    statusUnderReview: 'قيد المراجعة',
    statusResolved: 'تم الحل',
    statusRejected: 'مرفوض',
    colType: 'النوع',
    colMessage: 'الرسالة / التفاصيل',
    colAuthorOrBrand: 'المرسل / المطعم',
    colDate: 'تاريخ الإرسال (توقيت السعودية)',
    btnViewDetails: 'عرض التفاصيل',
    detailTitle: 'تفاصيل المشاركة',
    detailTypeLabel: 'نوع المشاركة',
    detailStatusLabel: 'الحالة الحالية',
    detailDateLabel: 'تاريخ الإرسال',
    detailOriginalText: 'النص الأصلي المرسل',
    detailDiagnosticsTitle: 'سياق التشخيص الآمن',
    detailDiagnosticsRoute: 'المسار المعقم',
    detailDiagnosticsError: 'آخر حدث خطأ آمن',
    detailBrandTitle: 'معلومات اقتراح المطعم',
    detailBrandName: 'المطعم المقترح',
    detailBrandLocation: 'الفرع / الموقع',
    detailBrandDistrict: 'الحي',
    detailBrandOwnerStatus: 'المالك / الممثل المعتمد',
    detailBrandOwnerYes: 'نعم (ممثل معتمد)',
    detailBrandOwnerNo: 'لا (مستخدم عادي)',
    detailBrandPhone: 'رقم الجوال للتواصل',
    detailBrandPhoneNotice: 'بيانات اتصال حساسة. تظهر فقط للمسؤولين المصرح لهم للمتابعة.',
    detailAuditTitle: 'سجل تغييرات الحالة',
    detailAuditEmpty: 'لا توجد تغييرات مسجلة على الحالة حتى الآن.',
    detailStatusChangePrompt: 'تحديث الحالة:',
    detailStatusUpdating: 'جاري تحديث الحالة...',
    detailStatusUpdatedSuccess: 'تم تحديث الحالة بنجاح.',
    detailTranslationNotice: 'الترجمة غير متوفرة في هذا الإصدار. يتم عرض النص الأصلي.',
    emptyFeedbackTitle: 'لا توجد ملاحظات',
    emptyFeedbackDesc: 'لا توجد ملاحظات تطابق معايير التصفية المحددة.',
  },
};
