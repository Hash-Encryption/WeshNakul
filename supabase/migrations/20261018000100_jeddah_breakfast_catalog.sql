-- Google-verified Jeddah Breakfast (فطور وبيض وشكشوكة) production catalog.
-- Source: tmp/staging_breakfast_v3.json (V3 Compliance Certified)
-- 12 approved brands, 18 verified physical branches (18 canonical, 0 outer-district caution branches).
-- 100% verified physical presence, addresses, canonical districts, coordinates, Place IDs, hours, and ratings.
-- Preserves existing Burger, Shawarma, Fried Chicken, Saudi Rice, Pizza, Grills, Fatayer, Sandwiches, Indian, Italian, Seafood, Street Folk, Sushi, Mexican, and Asian catalogs.
-- Delivery Platforms: HungerStation enabled only where directly verified in staging evidence; Jahez/Keeta remain unknown/unclaimed.
-- Optional Place ID: Branch upsert is keyed on deterministic branch UUID, preserving safety and idempotency even if Place ID is omitted.
-- Image Rights Firewall: Images cleared for research/staging preview; production relies on built-in SwipeCard Neo-brutalist fallback card.
-- Apply after 20261017000100_reclaim_participant_session.sql.
BEGIN;

CREATE TEMP TABLE _breakfast_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _breakfast_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Breakfast Production Catalog",
    "version": "V3 Compliance Audit Certified",
    "date": "2026-10-18",
    "brand_count": 12,
    "branch_count": 18,
    "canonical_branch_count": 18,
    "outer_caution_branch_count": 0
  },
  "brands": [
    {
      "brand_id": "ext_seventeen",
      "canonical_name": "Ext. Seventeen",
      "arabic_name": "إكست سيفينتين",
      "categories": [
        "breakfast",
        "bakery"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "bakery"
      ],
      "subcategories": [
        "bakery"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بانكيك القهوة الهش مع الكريمة المخفوقة",
      "signature_dish_en": "Fluffy Coffee Pancake with whipped cream",
      "vibe_tags_ar": [
        "برانش رايق",
        "قهوة مختصة",
        "جلسات عصرية",
        "فطور فنان"
      ],
      "vibe_tags_en": [
        "Artisan Brunch",
        "Specialty Coffee",
        "Modern Vibe",
        "Gourmet Breakfast"
      ],
      "reputation_tags": [
        "local_favorite",
        "trending"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "popular"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [],
      "delivery_platform_status": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://extseventeen.sa/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Fluffy Coffee Pancake with whipped cream",
          "name_ar": "بانكيك القهوة الهش مع الكريمة المخفوقة",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Truffle Scrambled Brioche",
          "name_ar": "بريوش بيض مخفوق بالترفل",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Shakshuka Poached Eggs",
          "name_ar": "بيض شكشوكة بوشيه",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "ext_seventeen",
          "branch_id": "branch_ext_seventeen_zahra",
          "branch_name_en": "Al Zahra Flagship",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5780093,
          "longitude": 39.1314252,
          "maps_business_name": "Ext. Seventeen",
          "google_place_id": "ChIJkfMA8JfbwxURSo1BEmy9FLg",
          "google_maps_url": "https://maps.google.com/?cid=13271701962386287946",
          "google_rating": 4.2,
          "google_review_count": 1477,
          "operating_status": "open",
          "hours": "Monday: 7:00 AM – 11:30 PM; Tuesday: 7:00 AM – 11:30 PM; Wednesday: 7:00 AM – 11:30 PM; Thursday: 7:00 AM – 11:30 PM; Friday: 7:00 AM – 11:30 PM; Saturday: 7:00 AM – 11:30 PM; Sunday: 7:00 AM – 11:30 PM",
          "phone": "053 217 7670",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "siblings_restaurant_cafe",
      "canonical_name": "Siblings Restaurant & Cafe",
      "arabic_name": "سبلنجز",
      "categories": [
        "breakfast"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "شكشوكة سبلنغز وبيض مخفوق مع خبز الساوردو",
      "signature_dish_en": "Signature Shakshuka & Scrambled Eggs with Sourdough Toast",
      "vibe_tags_ar": [
        "فطور صباحي",
        "جلسات واسعة",
        "أجواء عائلية",
        "مخبوزات طازجة"
      ],
      "vibe_tags_en": [
        "Morning Breakfast",
        "Spacious Seating",
        "Family Friendly",
        "Fresh Pastries"
      ],
      "reputation_tags": [
        "local_favorite",
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "group_friendly",
        "popular"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [],
      "delivery_platform_status": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://siblingsgroup.com/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Signature Shakshuka & Scrambled Eggs with Sourdough Toast",
          "name_ar": "شكشوكة سبلنغز وبيض مخفوق مع خبز الساوردو",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Ricotta Hotcakes",
          "name_ar": "بانكيك الريكوتا الساخن",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Croque Madame",
          "name_ar": "كروك مدام مع البيض",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "siblings_restaurant_cafe",
          "branch_id": "branch_siblings_rawdah",
          "branch_name_en": "Ar Rawdah Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "2603 Al Imam Malek, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5705514,
          "longitude": 39.1484895,
          "maps_business_name": "Siblings Restaurant & Cafe",
          "google_place_id": "ChIJZ4Ly5T3bwxURenXVGSPs_xM",
          "google_maps_url": "https://maps.google.com/?cid=14552431637772629370",
          "google_rating": 4.3,
          "google_review_count": 3303,
          "operating_status": "open",
          "hours": "Monday: 7:00 AM – 11:00 PM; Tuesday: 7:00 AM – 11:00 PM; Wednesday: 7:00 AM – 11:00 PM; Thursday: 7:00 AM – 12:00 AM; Friday: 7:00 AM – 12:00 PM, 1:00 PM – 12:00 AM; Saturday: 7:00 AM – 11:00 PM; Sunday: 7:00 AM – 11:00 PM",
          "phone": "055 918 1286",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "lazy_cat",
      "canonical_name": "Lazy Cat",
      "arabic_name": "ليزي كات",
      "categories": [
        "breakfast"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "مقلاة كازويلا رويال بيض",
      "signature_dish_en": "Cazuela Royale Egg Skillet",
      "vibe_tags_ar": [
        "برانش كويتي",
        "بانكيك مشهور",
        "أجواء حلوة",
        "صباحيات"
      ],
      "vibe_tags_en": [
        "Kuwaiti Brunch",
        "Famous Pancakes",
        "Vibrant Vibe",
        "Morning Crowd"
      ],
      "reputation_tags": [
        "cult_favorite",
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "popular"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [],
      "delivery_platform_status": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.eatlazycat.com/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Cazuela Royale Egg Skillet",
          "name_ar": "مقلاة كازويلا رويال بيض",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Stuffed French Toast",
          "name_ar": "فرنش توست محشي",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Morning Breakfast Sliders",
          "name_ar": "سلايدرز فطور الصباح",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "lazy_cat",
          "branch_id": "branch_lazy_cat_rawdah",
          "branch_name_en": "Ar Rawdah Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Abdul Maqsud Khojah, Al Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5729312,
          "longitude": 39.1482974,
          "maps_business_name": "Lazy Cat",
          "google_place_id": "ChIJHW4cts_bwxURMtDXfyQ88_c",
          "google_maps_url": "https://maps.google.com/?cid=17863588975317799218",
          "google_rating": 4.6,
          "google_review_count": 6946,
          "operating_status": "open",
          "hours": "Monday: 7:00 AM – 4:00 PM; Tuesday: 7:00 AM – 4:00 PM; Wednesday: 7:00 AM – 4:00 PM; Thursday: 7:00 AM – 4:00 PM; Friday: 7:00 AM – 4:00 PM; Saturday: 7:00 AM – 4:00 PM; Sunday: 7:00 AM – 4:00 PM",
          "phone": "053 505 5201",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "marmalade",
      "canonical_name": "Marmalade",
      "arabic_name": "مارملاد",
      "categories": [
        "breakfast"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بيغل بالسمسم مع بيض بوشيه مميز",
      "signature_dish_en": "Signature E.G.Y. Poached Eggs Sesame Bagel",
      "vibe_tags_ar": [
        "برانش بحري",
        "بيغل وبيض",
        "جلسات رايقة",
        "شمال جدة"
      ],
      "vibe_tags_en": [
        "Coastal Brunch",
        "Bagels & Eggs",
        "Chic & Cozy",
        "North Jeddah"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "local_favorite"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_murjan"
      ],
      "delivery_platforms": [],
      "delivery_platform_status": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.instagram.com/marmalade.sa/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Signature E.G.Y. Poached Eggs Sesame Bagel",
          "name_ar": "بيغل بالسمسم مع بيض بوشيه مميز",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Eggs Benedict",
          "name_ar": "بيض بينيديكت كلاسيكي",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Fluffy Buttermilk Pancakes",
          "name_ar": "بانكيك بترملك هش",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "marmalade",
          "branch_id": "branch_marmalade_murjan",
          "branch_name_en": "Al Murjan Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "Al Murjan, Jeddah 23712, Saudi Arabia",
          "latitude": 21.701594,
          "longitude": 39.1048843,
          "maps_business_name": "Marmalade",
          "google_place_id": "ChIJ9bhQO43ZwxUR9yl-SOAspwU",
          "google_maps_url": "https://maps.google.com/?cid=5064560416972792823",
          "google_rating": 4.3,
          "google_review_count": 1633,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 1:00 AM; Tuesday: 8:00 AM – 1:00 AM; Wednesday: 8:00 AM – 1:00 AM; Thursday: 8:00 AM – 1:00 AM; Friday: 8:00 AM – 1:00 AM; Saturday: 8:00 AM – 1:00 AM; Sunday: 8:00 AM – 1:00 AM",
          "phone": "050 808 7744",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "wayans",
      "canonical_name": "Wayan’s",
      "arabic_name": "وَيَانْز",
      "categories": [
        "breakfast",
        "bakery"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "bakery"
      ],
      "subcategories": [
        "bakery"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بيض بينيديكت بالسبانخ والمشروم مع بريوش",
      "signature_dish_en": "Signature Mushroom & Spinach Brioche Eggs Benedict",
      "vibe_tags_ar": [
        "كرواسون وبيض",
        "فطور سريع",
        "جلسات مريحة",
        "قهوة الصباح"
      ],
      "vibe_tags_en": [
        "Croissants & Eggs",
        "Quick Morning Bite",
        "Cozy Vibe",
        "Morning Coffee"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout",
        "rising"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naeem"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.instagram.com/wayans.sa/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Signature Mushroom & Spinach Brioche Eggs Benedict",
          "name_ar": "بيض بينيديكت بالسبانخ والمشروم مع بريوش",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Scrambled Egg Croissant",
          "name_ar": "كرواسون البيض المخفوق",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "French Toast Bites",
          "name_ar": "لقيمات فرنش توست",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "wayans",
          "branch_id": "branch_wayans_naeem",
          "branch_name_en": "Al Naeem Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "JENC7686, Aaminah Bint Wahb, 7686, Jeddah 23621, Saudi Arabia",
          "latitude": 21.637682,
          "longitude": 39.1415154,
          "maps_business_name": "Wayan’s",
          "google_place_id": "ChIJHaK3SqPZwxUR6350etAfIqE",
          "google_maps_url": "https://maps.google.com/?cid=11649980649723395819",
          "google_rating": 4.7,
          "google_review_count": 1460,
          "operating_status": "open",
          "hours": "Monday: 7:00 AM – 8:00 PM; Tuesday: 7:00 AM – 8:00 PM; Wednesday: 7:00 AM – 8:00 PM; Thursday: 7:00 AM – 8:00 PM; Friday: 7:00 – 11:30 AM, 1:00 – 8:00 PM; Saturday: 7:00 AM – 8:00 PM; Sunday: 7:00 AM – 8:00 PM",
          "phone": "057 380 0778",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "inhabit",
      "canonical_name": "Inhabit",
      "arabic_name": "إنهابت",
      "categories": [
        "breakfast"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 175,
      "signature_dish_ar": "طبق ستيك وبيض برانش مع سلطة كينوا",
      "signature_dish_en": "Steak & Eggs Brunch Platter with Quinoa Bowl",
      "vibe_tags_ar": [
        "فطور راقي",
        "أطباق صحية",
        "أجواء فخمة",
        "تصميم مميز"
      ],
      "vibe_tags_en": [
        "Fine Breakfast",
        "Healthy Bowls",
        "Upscale Vibe",
        "Design Aesthetic"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "destination_dining",
        "premium",
        "dine_in_strong"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [],
      "delivery_platform_status": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.instagram.com/inhabit_sa/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Steak & Eggs Brunch Platter with Quinoa Bowl",
          "name_ar": "طبق ستيك وبيض برانش مع سلطة كينوا",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Truffle Scrambled Eggs",
          "name_ar": "بيض مخفوق بالترفل الأسود",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Brioche Toast",
          "name_ar": "توست بريوش محمص",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "inhabit",
          "branch_id": "branch_inhabit_zahra",
          "branch_name_en": "Al Zahra Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Sari Br Rd, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5726799,
          "longitude": 39.1348136,
          "maps_business_name": "Inhabit",
          "google_place_id": "ChIJTaUss2fbwxURHET5g8SPsPg",
          "google_maps_url": "https://maps.google.com/?cid=17926779435868669212",
          "google_rating": 4.7,
          "google_review_count": 637,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 5:00 PM; Tuesday: 8:00 AM – 5:00 PM; Wednesday: 8:00 AM – 5:00 PM; Thursday: 8:00 AM – 5:00 PM; Friday: 8:00 AM – 5:00 PM; Saturday: 8:00 AM – 5:00 PM; Sunday: 8:00 AM – 5:00 PM",
          "phone": "053 761 0046",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "baker_and_spice",
      "canonical_name": "Baker & Spice",
      "arabic_name": "بيكر آند سبايس",
      "categories": [
        "breakfast",
        "bakery"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "bakery"
      ],
      "subcategories": [
        "bakery"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 175,
      "signature_dish_ar": "مقلاة شكشوكة مميزة مع رغيف ساوردو",
      "signature_dish_en": "Signature Shakshouka Skillet with Sourdough Loaf",
      "vibe_tags_ar": [
        "مخبوزات عضوية",
        "شكشوكة مميزة",
        "جلسات راقية",
        "ساوردو طازج"
      ],
      "vibe_tags_en": [
        "Artisan Bakery",
        "Signature Shakshuka",
        "Upscale Dining",
        "Fresh Sourdough"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "destination_dining",
        "premium"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://bakerandspice.me/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Signature Shakshouka Skillet with Sourdough Loaf",
          "name_ar": "مقلاة شكشوكة مميزة مع رغيف ساوردو",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Green Shakshuka",
          "name_ar": "شكشوكة خضراء بالأعشاب",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Artisan Eggs Benedict",
          "name_ar": "بيض بينيديكت ريفي",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "baker_and_spice",
          "branch_id": "branch_baker_and_spice_rawdah",
          "branch_name_en": "City Yard Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Shirvan Hotel, City Yard Plaza, Abdul Maqsud Khojah, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5725646,
          "longitude": 39.1489367,
          "maps_business_name": "Baker & Spice",
          "google_place_id": "ChIJ0bqR-BHbwxURFo8yyRtLbV0",
          "google_maps_url": "https://maps.google.com/?cid=6735508681534934806",
          "google_rating": 4.4,
          "google_review_count": 3996,
          "operating_status": "open",
          "hours": "Monday: 7:00 AM – 1:00 AM; Tuesday: 7:00 AM – 1:00 AM; Wednesday: 7:00 AM – 1:00 AM; Thursday: 7:00 AM – 1:00 AM; Friday: 7:00 AM – 1:00 AM; Saturday: 7:00 AM – 1:00 AM; Sunday: 7:00 AM – 1:00 AM",
          "phone": "055 836 7700",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "the_breakfast_club",
      "canonical_name": "The Breakfast Club",
      "arabic_name": "ذا بريكفست كلوب",
      "categories": [
        "breakfast",
        "american"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "american"
      ],
      "subcategories": [
        "american"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "برج سوفليه بانكيك بالبترملك",
      "signature_dish_en": "Signature Buttermilk Soufflé Pancake Stack",
      "vibe_tags_ar": [
        "فطور كلاسيكي",
        "بانكيك سوفليه",
        "جلسات عائلية",
        "أطباق بيض"
      ],
      "vibe_tags_en": [
        "Classic Breakfast",
        "Souffle Pancakes",
        "Family Friendly",
        "Egg Dishes"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly",
        "group_friendly"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.instagram.com/thebreakfastclub_sa/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Signature Buttermilk Soufflé Pancake Stack",
          "name_ar": "برج سوفليه بانكيك بالبترملك",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Classic Full English Breakfast",
          "name_ar": "فطور إنجليزي متكامل",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Skillet Fried Eggs",
          "name_ar": "بيض عيون في المقلاة",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "the_breakfast_club",
          "branch_id": "branch_the_breakfast_club_zahra",
          "branch_name_en": "Al Zahra Branch",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Sari Br Rd, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5725907,
          "longitude": 39.1285512,
          "maps_business_name": "The Breakfast Club",
          "google_place_id": "ChIJFeEN2zvbwxURGZMJEDTmCqw",
          "google_maps_url": "https://maps.google.com/?cid=12403759714392478233",
          "google_rating": 4.7,
          "google_review_count": 614,
          "operating_status": "open",
          "hours": "Monday: 6:00 AM – 5:00 PM; Tuesday: 6:00 AM – 5:00 PM; Wednesday: 6:00 AM – 5:00 PM; Thursday: 6:00 AM – 5:00 PM; Friday: 6:00 AM – 5:00 PM; Saturday: 6:00 AM – 5:00 PM; Sunday: 6:00 AM – 5:00 PM",
          "phone": "050 325 4984",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "ihop",
      "canonical_name": "IHOP",
      "arabic_name": "آيهوب",
      "categories": [
        "breakfast",
        "american"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "american"
      ],
      "subcategories": [
        "american"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "برج بانكيك بترملك الشهير (5 طبقات)",
      "signature_dish_en": "World Famous Buttermilk Pancakes Stack (5-tier)",
      "vibe_tags_ar": [
        "فطور أمريكي",
        "بانكيك عائلي",
        "أومليت منوع",
        "جلسات كبيرة"
      ],
      "vibe_tags_en": [
        "American Breakfast",
        "Pancake Stacks",
        "Loaded Omelettes",
        "Family Dining"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "family_friendly",
        "group_friendly",
        "popular"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_andalus",
        "al_mohammadiyyah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.alshaya.com/en/brands/food/ihop/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "World Famous Buttermilk Pancakes Stack (5-tier)",
          "name_ar": "برج بانكيك بترملك الشهير (5 طبقات)",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Colorado Omelette",
          "name_ar": "أومليت كولورادو الغني",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Breakfast Sampler",
          "name_ar": "تشكيلة فطور آيهوب",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "ihop",
          "branch_id": "branch_ihop_andalus",
          "branch_name_en": "Le Mall Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "Le Mall, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5536295,
          "longitude": 39.1677511,
          "maps_business_name": "IHOP",
          "google_place_id": "ChIJGY0gfhDQwxURM6apNa5YTRQ",
          "google_maps_url": "https://maps.google.com/?cid=1460592931481183187",
          "google_rating": 4.5,
          "google_review_count": 10644,
          "operating_status": "open",
          "hours": "Monday: 6:00 AM – 10:00 PM; Tuesday: 6:00 AM – 10:00 PM; Wednesday: 6:00 AM – 10:00 PM; Thursday: 6:00 AM – 10:00 PM; Friday: 6:00 AM – 10:00 PM; Saturday: 6:00 AM – 10:00 PM; Sunday: 6:00 AM – 10:00 PM",
          "phone": "012 661 6668",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ihop",
          "branch_id": "branch_ihop_mohammadiyyah",
          "branch_name_en": "Prince Sultan Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23623, Saudi Arabia",
          "latitude": 21.6571528,
          "longitude": 39.1240228,
          "maps_business_name": "IHOP",
          "google_place_id": "ChIJNWnPkQLZwxURE5bLM32B5CQ",
          "google_maps_url": "https://maps.google.com/?cid=2636402434685794067",
          "google_rating": 4.8,
          "google_review_count": 6034,
          "operating_status": "open",
          "hours": "Monday: 6:00 AM – 10:00 PM; Tuesday: 6:00 AM – 10:00 PM; Wednesday: 6:00 AM – 10:00 PM; Thursday: 6:00 AM – 10:00 PM; Friday: 6:00 AM – 10:00 PM; Saturday: 6:00 AM – 10:00 PM; Sunday: 6:00 AM – 10:00 PM",
          "phone": "054 369 9442",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "paul",
      "canonical_name": "PAUL",
      "arabic_name": "بول",
      "categories": [
        "breakfast",
        "bakery"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "bakery"
      ],
      "subcategories": [
        "bakery"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 175,
      "signature_dish_ar": "أومليت فيليه مينيون مع بارميزان وبطاطس",
      "signature_dish_en": "Filet Mignon & Parmesan Omelette with Crushed Potatoes",
      "vibe_tags_ar": [
        "فطور فرنسي",
        "كرواسون ومخبوزات",
        "جلسات راقية",
        "أومليت باريسي"
      ],
      "vibe_tags_en": [
        "French Breakfast",
        "Artisan Viennoiserie",
        "Elegant Ambience",
        "Parisian Omelette"
      ],
      "reputation_tags": [
        "jeddah_staple",
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly",
        "premium"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_shati",
        "al_aziziyah",
        "al_andalus",
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.azadeagroup.com/en/brands/paul",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Filet Mignon & Parmesan Omelette with Crushed Potatoes",
          "name_ar": "أومليت فيليه مينيون مع بارميزان وبطاطس",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Eggs Royale / Benedict",
          "name_ar": "بيض رويال بينيديكت مع السلمون",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Croque Monsieur",
          "name_ar": "كروك مسيو باريسي مقرمش",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "paul",
          "branch_id": "branch_paul_red_sea_mall",
          "branch_name_en": "Red Sea Mall Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Red Sea Mall, King Abdulaziz Rd, Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.6272028,
          "longitude": 39.1109617,
          "maps_business_name": "PAUL",
          "google_place_id": "ChIJE8_Eqs7bwxURs_WKoDyXcb4",
          "google_maps_url": "https://maps.google.com/?cid=13722915826221905331",
          "google_rating": 4,
          "google_review_count": 405,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 12:00 AM; Tuesday: 8:00 AM – 12:00 AM; Wednesday: 8:00 AM – 12:00 AM; Thursday: 8:00 AM – 12:00 AM; Friday: 1:00 PM – 12:00 AM; Saturday: 8:00 AM – 12:00 AM; Sunday: 8:00 AM – 12:00 AM",
          "phone": null,
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "paul",
          "branch_id": "branch_paul_jeddah_park",
          "branch_name_en": "Jeddah Park Mall Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "Jeddah Park Mall, Aziziyah, Jeddah 23334, Saudi Arabia",
          "latitude": 21.5568441,
          "longitude": 39.1854754,
          "maps_business_name": "PAUL",
          "google_place_id": "ChIJKTsqrXzRwxURfKmW0h0L_n0",
          "google_maps_url": "https://maps.google.com/?cid=9078706121540544892",
          "google_rating": 4.1,
          "google_review_count": 2009,
          "operating_status": "open",
          "hours": "Monday: 9:00 AM – 12:00 AM; Tuesday: 9:00 AM – 12:00 AM; Wednesday: 9:00 AM – 12:00 AM; Thursday: 9:00 AM – 12:00 AM; Friday: 1:00 PM – 12:00 AM; Saturday: 9:00 AM – 12:00 AM; Sunday: 9:00 AM – 12:00 AM",
          "phone": "012 591 0863",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "paul",
          "branch_id": "branch_paul_vibes_andalus",
          "branch_name_en": "Vibes Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "Vibes, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5515208,
          "longitude": 39.160588,
          "maps_business_name": "PAUL",
          "google_place_id": "ChIJ8b1TdQDRwxUR5LYWHRZgIxE",
          "google_maps_url": "https://maps.google.com/?cid=1234936370923222756",
          "google_rating": 4.7,
          "google_review_count": 162,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 12:00 AM; Tuesday: 8:00 AM – 12:00 AM; Wednesday: 8:00 AM – 12:00 AM; Thursday: 8:00 AM – 12:00 AM; Friday: 8:00 AM – 12:00 AM; Saturday: 8:00 AM – 12:00 AM; Sunday: 8:00 AM – 12:00 AM",
          "phone": "012 578 5409",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "paul",
          "branch_id": "branch_paul_sultan_zahra",
          "branch_name_en": "Al Amir Sultan Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "7178 Al Amir Sultan, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5824128,
          "longitude": 39.1417246,
          "maps_business_name": "PAUL",
          "google_place_id": "ChIJc_zDMQDbwxURoFXuvmuqZsU",
          "google_maps_url": "https://maps.google.com/?cid=14224243852837803424",
          "google_rating": 4.7,
          "google_review_count": 77,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 12:00 AM; Tuesday: 8:00 AM – 12:00 AM; Wednesday: 8:00 AM – 12:00 AM; Thursday: 8:00 AM – 12:00 AM; Friday: 1:00 PM – 12:00 AM; Saturday: 8:00 AM – 12:00 AM; Sunday: 8:00 AM – 12:00 AM",
          "phone": null,
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "cafe_bateel",
      "canonical_name": "Café Bateel",
      "arabic_name": "بتيل كافيه",
      "categories": [
        "breakfast"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 80,
      "estimated_spend_max_sar": 175,
      "signature_dish_ar": "بريوش بيض بينيديكت الذواقة مع الهليون",
      "signature_dish_en": "Gourmet Brioche Eggs Benedict with Asparagus",
      "vibe_tags_ar": [
        "فطور فاخر",
        "ضيافة راقية",
        "بيض بينيديكت",
        "تمر الذواقة"
      ],
      "vibe_tags_en": [
        "Gourmet Breakfast",
        "Luxury Hospitality",
        "Artisan Benedict",
        "Gourmet Dates"
      ],
      "reputation_tags": [
        "local_favorite",
        "jeddah_staple"
      ],
      "context_tags": [
        "destination_dining",
        "premium",
        "dine_in_strong"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://bateel.com/en-sa/cafe-bateel",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Gourmet Brioche Eggs Benedict with Asparagus",
          "name_ar": "بريوش بيض بينيديكت الذواقة مع الهليون",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Levant Shakshuka",
          "name_ar": "شكشوكة شامية بالطماطم المطهوة ببطء",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Date French Toast",
          "name_ar": "فرنش توست بالتمر الفاخر",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "cafe_bateel",
          "branch_id": "branch_bateel_le_prestige_shati",
          "branch_name_en": "Le Prestige Mall Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Le Prestige Mall, King Abdulaziz Branch Rd, Ash Shati, Jeddah 23414, Saudi Arabia",
          "latitude": 21.5642681,
          "longitude": 39.1251716,
          "maps_business_name": "Café Bateel",
          "google_place_id": "ChIJF4LvVabbwxURXOtCLX3aAK0",
          "google_maps_url": "https://maps.google.com/?cid=12466203999726660444",
          "google_rating": 4.4,
          "google_review_count": 5895,
          "operating_status": "open",
          "hours": "Monday: 7:30 AM – 12:00 AM; Tuesday: 7:30 AM – 12:00 AM; Wednesday: 7:30 AM – 12:00 AM; Thursday: 7:30 AM – 1:00 AM; Friday: 7:30 AM – 1:00 AM; Saturday: 7:30 AM – 12:00 AM; Sunday: 7:30 AM – 12:00 AM",
          "phone": "800 111 0222",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "mado",
      "canonical_name": "MADO",
      "arabic_name": "مادو",
      "categories": [
        "breakfast",
        "turkish"
      ],
      "primary_category": "breakfast",
      "secondary_categories": [
        "turkish"
      ],
      "subcategories": [
        "turkish"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "مينيمين تركي في طاجن فخار",
      "signature_dish_en": "Clay Pot Shakshuka Menemen in Terracotta Dish",
      "vibe_tags_ar": [
        "فطور تركي متكامل",
        "مينيمين فخار",
        "بوريك تركي",
        "شاي مخدر"
      ],
      "vibe_tags_en": [
        "Turkish Kahvaltı",
        "Clay Pot Menemen",
        "Traditional Borek",
        "Turkish Tea"
      ],
      "reputation_tags": [
        "jeddah_staple",
        "mainstream"
      ],
      "context_tags": [
        "family_friendly",
        "group_friendly",
        "dine_in_strong"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_shati",
        "al_aziziyah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "delivery_platform_status": {
        "hungerstation": "available",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://mado.com.tr/",
      "research_use": "usable_with_caution",
      "best_sellers": [
        {
          "name_en": "Clay Pot Shakshuka Menemen in Terracotta Dish",
          "name_ar": "مينيمين تركي في طاجن فخار",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_en": "Traditional Serpme Kahvaltı Breakfast Spread",
          "name_ar": "سفرة فطور تركي تقليدي متكامل (سربمه)",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Su Böreği with Feta",
          "name_ar": "بوريك الماء التركي بالجبنة الفيتا",
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "branches": [
        {
          "restaurant_id": "mado",
          "branch_id": "branch_mado_red_sea_mall",
          "branch_name_en": "Red Sea Mall Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Red Sea Mall, Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.6275279,
          "longitude": 39.1109788,
          "maps_business_name": "MADO",
          "google_place_id": "ChIJR3Nq5VvbwxURTtOZUj3164c",
          "google_maps_url": "https://maps.google.com/?cid=9794191458374898510",
          "google_rating": 3.7,
          "google_review_count": 1379,
          "operating_status": "open",
          "hours": "Monday: 9:00 AM – 1:00 AM; Tuesday: 9:00 AM – 1:00 AM; Wednesday: 9:00 AM – 1:00 AM; Thursday: 9:00 AM – 1:00 AM; Friday: 1:00 PM – 1:00 AM; Saturday: 9:00 AM – 1:00 AM; Sunday: 9:00 AM – 1:00 AM",
          "phone": "012 605 1119",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mado",
          "branch_id": "branch_mado_jeddah_park",
          "branch_name_en": "Jeddah Park Mall Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "Jeddah Park Mall, Prince Mohammed Bin Abdulaziz St, Aziziyah, Jeddah 23334, Saudi Arabia",
          "latitude": 21.5572764,
          "longitude": 39.1853886,
          "maps_business_name": "MADO",
          "google_place_id": "ChIJIZ9AYwDRwxURvy4ZVOHL6pY",
          "google_maps_url": "https://maps.google.com/?cid=10874728418878500543",
          "google_rating": 4,
          "google_review_count": 88,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 2:00 AM; Tuesday: 8:00 AM – 2:00 AM; Wednesday: 8:00 AM – 2:00 AM; Thursday: 8:00 AM – 3:00 AM; Friday: 8:00 AM – 3:00 AM; Saturday: 8:00 AM – 2:00 AM; Sunday: 8:00 AM – 2:00 AM",
          "phone": "054 860 6018",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mado",
          "branch_id": "branch_mado_yacht_club",
          "branch_name_en": "Jeddah Yacht Club Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Jeddah Yacht Club Marina, Ash Shati, Jeddah 23613, Saudi Arabia",
          "latitude": 21.6527728,
          "longitude": 39.1006114,
          "maps_business_name": "MADO",
          "google_place_id": "ChIJBf0xdADZwxUR2xvWitDyia8",
          "google_maps_url": "https://maps.google.com/?cid=12648908005943155675",
          "google_rating": 4.3,
          "google_review_count": 725,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 1:00 AM; Tuesday: 8:00 AM – 1:00 AM; Wednesday: 8:00 AM – 1:00 AM; Thursday: 8:00 AM – 2:00 AM; Friday: 8:00 AM – 2:00 AM; Saturday: 8:00 AM – 1:00 AM; Sunday: 8:00 AM – 1:00 AM",
          "phone": "054 400 7909",
          "dine_in": true,
          "takeaway": true,
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _breakfast_catalog;
  
  -- Verify brand count is exactly 12
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 12 THEN
    RAISE EXCEPTION 'Breakfast catalog must contain exactly 12 brands';
  END IF;

  -- Verify branch count is exactly 18
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 18 THEN
    RAISE EXCEPTION 'Breakfast catalog must contain exactly 18 branches';
  END IF;

  -- Verify canonical branch count is 18
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 18 THEN
    RAISE EXCEPTION 'Breakfast catalog must contain exactly 18 canonical branches';
  END IF;

  -- Verify outer caution branch count is 0
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 0 THEN
    RAISE EXCEPTION 'Breakfast catalog must contain exactly 0 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Breakfast catalog contains an unknown canonical district'; END IF;

  -- Verify PAUL branches strictly match Gate 2 audited canonical districts
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b
    CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE b->>'brand_id' = 'paul'
      AND (
        (br->>'branch_id' = 'branch_paul_red_sea_mall' AND br->>'district' <> 'al_shati') OR
        (br->>'branch_id' = 'branch_paul_jeddah_park' AND br->>'district' <> 'al_aziziyah') OR
        (br->>'branch_id' = 'branch_paul_vibes_andalus' AND br->>'district' <> 'al_andalus') OR
        (br->>'branch_id' = 'branch_paul_sultan_zahra' AND br->>'district' <> 'al_zahra')
      )
  ) THEN RAISE EXCEPTION 'PAUL branch district mismatch against Gate 2 canonical ground truth'; END IF;

  -- Verify no place ID belongs to another brand in the existing database (safely handling null Place IDs)
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' IS NOT NULL AND br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _breakfast_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode, time_slots, closing_time_ar, is_open_late, is_24_hours,
  avg_prep_minutes, tier, price_tier, signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, rating, platforms, links,
  city, primary_category, secondary_categories, subcategories, category_fit_confidence, category_fit_evidence, editorial_role,
  reputation_tags, context_tags, context_tag_evidence, business_type, operating_status, brand_status_confidence,
  verified_jeddah_branch_count, branch_list_completeness, meal_period_strength, serves_breakfast_menu, dining_mode_summary,
  price_position, estimated_sar_per_person_min, estimated_sar_per_person_max, official_website, trend_status, trend_confidence,
  overall_confidence, research_use, last_verified_at, menu_last_verified_at, manual_review_required, manual_review_reasons, intelligence_origin
)
SELECT
  b->>'brand_id',
  COALESCE(b->>'arabic_name', b->>'canonical_name'),
  b->>'canonical_name',
  ARRAY(SELECT jsonb_array_elements_text(b->'categories')),
  (b->>'is_city_wide')::boolean,
  ARRAY(SELECT jsonb_array_elements_text(b->'canonical_districts')),
  'both',
  ARRAY(SELECT jsonb_array_elements_text(b->'time_slots')),
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 11:30 م' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  15,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  NULL,
  jsonb_build_object(
    'hungerstation', (b->'delivery_platforms' ? 'hungerstation'),
    'jahez', (b->'delivery_platforms' ? 'jahez'),
    'keeta', (b->'delivery_platforms' ? 'keeta')
  ),
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'),
  'jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Verified by first-party operational presence and Google Places branch inventory',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  NULL,
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  '{"breakfast": "strong"}'::jsonb,
  true,
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  (b->>'research_use')::public.research_use,
  '2026-10-18T00:00:00Z'::timestamptz,
  '2026-10-18T00:00:00Z'::timestamptz,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.categories, EXCLUDED.categories)) item),
  secondary_categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.secondary_categories, EXCLUDED.secondary_categories)) item),
  subcategories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.subcategories, EXCLUDED.subcategories)) item),
  primary_category=COALESCE(restaurants.primary_category, EXCLUDED.primary_category),
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  editorial_role=COALESCE(restaurants.editorial_role, EXCLUDED.editorial_role),
  tier=COALESCE(restaurants.tier, EXCLUDED.tier),
  price_tier=COALESCE(restaurants.price_tier, EXCLUDED.price_tier),
  price_position=COALESCE(restaurants.price_position, EXCLUDED.price_position),
  signature_dish_ar=COALESCE(restaurants.signature_dish_ar, EXCLUDED.signature_dish_ar),
  signature_dish_en=COALESCE(restaurants.signature_dish_en, EXCLUDED.signature_dish_en),
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  platforms=EXCLUDED.platforms,
  serves_breakfast_menu=true,
  meal_period_strength='{"breakfast": "strong"}'::jsonb,
  last_verified_at=EXCLUDED.last_verified_at,
  research_use=EXCLUDED.research_use;

-- 2. Cleanup stale best sellers and sources for these 12 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _breakfast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _breakfast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
-- Uses deterministic branch UUID derived from stable branch_id as primary key.
-- Remains 100% safe, idempotent, and non-blocking if google_place_id is absent.
WITH catalog AS (SELECT payload FROM _breakfast_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
)
INSERT INTO public.restaurant_branches (
  id,
  restaurant_id, branch_name_ar, branch_name_en, branch_status, branch_status_confidence, branch_type,
  district, address_en, latitude, longitude, maps_business_name, google_place_id, maps_lookup_status,
  google_maps_url, google_rating, google_review_count, rating_source, maps_last_verified_at,
  branch_identity_confidence, geographic_notes, last_verified_at, dine_in, takeaway
)
SELECT
  COALESCE(
    (SELECT rb.id FROM public.restaurant_branches rb WHERE br->>'google_place_id' IS NOT NULL AND rb.google_place_id = br->>'google_place_id' LIMIT 1),
    md5('weshnakul_branch:' || (br->>'branch_id'))::uuid
  ),
  br->>'restaurant_id',
  br->>'branch_name_ar',
  br->>'branch_name_en',
  'open',
  'high'::public.intelligence_confidence,
  (br->>'branch_type')::public.branch_type,
  br->>'district',
  br->>'address_en',
  (br->>'latitude')::double precision,
  (br->>'longitude')::double precision,
  br->>'maps_business_name',
  br->>'google_place_id',
  CASE 
    WHEN br->>'google_place_id' IS NOT NULL OR br->>'google_maps_url' IS NOT NULL THEN 'verified'::public.maps_lookup_status 
    ELSE 'unknown'::public.maps_lookup_status 
  END,
  br->>'google_maps_url',
  (br->>'google_rating')::numeric,
  (br->>'google_review_count')::integer,
  CASE 
    WHEN br->>'google_rating' IS NOT NULL THEN 'google_maps_direct'::public.rating_source 
    ELSE 'unknown'::public.rating_source 
  END,
  CASE WHEN br->>'google_place_id' IS NOT NULL THEN '2026-10-18T00:00:00Z'::timestamptz ELSE NULL END,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-10-18T00:00:00Z'::timestamptz,
  COALESCE((br->>'dine_in')::boolean, true),
  COALESCE((br->>'takeaway')::boolean, true)
FROM branches
ON CONFLICT (id) DO UPDATE SET
  restaurant_id=EXCLUDED.restaurant_id,
  branch_name_ar=COALESCE(restaurant_branches.branch_name_ar, EXCLUDED.branch_name_ar),
  branch_name_en=EXCLUDED.branch_name_en,
  branch_status=EXCLUDED.branch_status,
  branch_status_confidence=EXCLUDED.branch_status_confidence,
  branch_type=EXCLUDED.branch_type,
  district=EXCLUDED.district,
  address_en=EXCLUDED.address_en,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  maps_business_name=EXCLUDED.maps_business_name,
  google_place_id=EXCLUDED.google_place_id,
  maps_lookup_status=EXCLUDED.maps_lookup_status,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  rating_source=EXCLUDED.rating_source,
  maps_last_verified_at=EXCLUDED.maps_last_verified_at,
  branch_identity_confidence=EXCLUDED.branch_identity_confidence,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at,
  dine_in=EXCLUDED.dine_in,
  takeaway=EXCLUDED.takeaway;

-- 4. Insert best sellers
WITH catalog AS (SELECT payload FROM _breakfast_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
)
INSERT INTO public.restaurant_best_sellers (
  restaurant_id, name_ar, name_en, is_signature, sort_order, confidence, evidence_summary, last_verified_at
)
SELECT
  restaurant_id,
  item->>'name_ar',
  item->>'name_en',
  (item->>'is_signature')::boolean,
  (item->>'sort_order')::integer,
  'high'::public.intelligence_confidence,
  'Certified Breakfast V3 dataset signature item',
  '2026-10-18T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _breakfast_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL
)
INSERT INTO public.restaurant_sources (
  restaurant_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  b->>'brand_id',
  'official_website'::public.research_source_type,
  b->>'official_website',
  ARRAY['brand_identity', 'category', 'best_sellers']::text[],
  '2026-10-18T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources (safely handling branches without maps URL or place ID)
WITH catalog AS (SELECT payload FROM _breakfast_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
  WHERE br->>'google_maps_url' IS NOT NULL
)
INSERT INTO public.restaurant_sources (
  restaurant_id, branch_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  br->>'restaurant_id',
  rb.id,
  'google_maps'::public.research_source_type,
  br->>'google_maps_url',
  ARRAY['google_identity', 'location', 'business_status', 'google_reputation']::text[],
  '2026-10-18T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.id = COALESCE(
  (SELECT old.id FROM public.restaurant_branches old WHERE br->>'google_place_id' IS NOT NULL AND old.google_place_id = br->>'google_place_id' LIMIT 1),
  md5('weshnakul_branch:' || (br->>'branch_id'))::uuid
);

COMMIT;
