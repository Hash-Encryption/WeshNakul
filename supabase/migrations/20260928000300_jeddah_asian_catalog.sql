-- Google-verified Jeddah Asian production catalog.
-- Source: docs/research/jeddah-asian-pass-d-corrected.json
-- 19 locked brands (13 Asian primary brands + 6 sushi overlap brands cleanly reconciled).
-- 50 verified physical branches (43 canonical 30 districts + 7 outer-district caution branches).
-- Excludes 1 manual review duplicate branch without coordinates (Canton Ash Shati duplicate).
-- 100% Google Place IDs, Maps URLs, verified exact coordinates, addresses, hours, and ratings.
-- Zero unintended collisions against live production catalog.
-- Apply after 20260928000200_jeddah_mexican_catalog.sql.
BEGIN;

CREATE TEMP TABLE _asian_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _asian_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Asian Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-28",
    "brand_count": 19,
    "branch_count": 50,
    "canonical_branch_count": 43,
    "outer_caution_branch_count": 7
  },
  "brands": [
    {
      "brand_id": "da_bao",
      "canonical_name": "Da Bao",
      "arabic_name": "دا باو",
      "categories": [
        "asian",
        "asian_fusion"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "asian_fusion"
      ],
      "subcategories": [
        "asian_fusion"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "خبز باو الدجاج المقرمش واللحم المطهو ببطء",
      "signature_dish_en": "Crispy Chicken & Slow Cooked Beef Baos",
      "vibe_tags_ar": [
        "أشهر مأكولات باو ستريت فود",
        "خبز باو طري ونكهات آسيوية مبتكرة",
        "حي الزهراء شارع البترجي",
        "سريع وشبابي عصري"
      ],
      "vibe_tags_en": [
        "Famous Asian Bao Street Food",
        "Fluffy Steamed Baos & Asian Bites",
        "Al Zahra Al Batarji",
        "Trendy Modern Vibe"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "casual_hangout",
        "dine_in_strong",
        "delivery_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "da_bao",
          "branch_name_en": "Da Bao – Rovan Tower",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Rovan Tower, Prince Saud Al Faisal, Ar Rawdah, Jeddah 23433, Saudi Arabia",
          "latitude": 21.5620506,
          "longitude": 39.161459,
          "maps_business_name": "Da Bao",
          "google_place_id": "ChIJRWzD_zDRwxURCXY5GnzD-cg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRWzD_zDRwxURCXY5GnzD-cg",
          "google_rating": 4.6,
          "google_review_count": 3775,
          "operating_status": "open",
          "hours": "Sun-Wed: 13:00-02:00; Thu-Sat: 13:00-03:00",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Crispy Fried Chicken Bao",
          "name_ar": "باو الدجاج المقرمش",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Slow-Cooked Beef Brisket Bao",
          "name_ar": "باو لحم البريسكت المطهو ببطء",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "chan",
      "canonical_name": "CHAN",
      "arabic_name": "شان",
      "categories": [
        "asian",
        "mixed_asian",
        "late_night"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "mixed_asian",
        "late_night"
      ],
      "subcategories": [
        "mixed_asian",
        "late_night"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "باول الدجاج المقرمش ونودلز شان الآسيوية",
      "signature_dish_en": "Crispy Chicken Asian Bowl & Signature Noodles",
      "vibe_tags_ar": [
        "مطعم آسيوي عصري متكامل",
        "نودلز وسوشي وباولز آسيوية",
        "حي الزهراء طريق الأمير سلطان",
        "أجواء شبابية رايقة"
      ],
      "vibe_tags_en": [
        "Contemporary Asian Eatery",
        "Asian Noodles Sushi & Bowls",
        "Al Zahra Prince Sultan Rd",
        "Chic Casual Ambiance"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "casual_hangout",
        "dine_in_strong",
        "late_night",
        "high_energy"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "chan",
          "branch_name_en": "CHAN – Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas Street, Al Zahra, Jeddah 23521, Saudi Arabia",
          "latitude": 21.5913792,
          "longitude": 39.1309572,
          "maps_business_name": "CHAN",
          "google_place_id": "ChIJhTEPcTDbwxURsgwQ_YfD_HQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhTEPcTDbwxURsgwQ_YfD_HQ",
          "google_rating": 4.7,
          "google_review_count": 10480,
          "operating_status": "open",
          "hours": "Daily: 12:00-03:00",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature CHAN Crispy Bowl",
          "name_ar": "باول شان المقرمش الخاص",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Asian Stir Fry Noodles",
          "name_ar": "نودلز آسيوية مشوحة بالخضار",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "togarashi",
      "canonical_name": "Togarashi",
      "arabic_name": "توقاراشي",
      "categories": [
        "asian",
        "japanese",
        "ramen"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "japanese",
        "ramen"
      ],
      "subcategories": [
        "japanese",
        "ramen"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "رامن توقاراشي ومقبلات الترياكي",
      "signature_dish_en": "Signature Togarashi Ramen & Teriyaki",
      "vibe_tags_ar": [
        "مطبخ ياباني وآسيوي عصري",
        "نودلز ورامن ومقبلات آسيوية",
        "حي الروضة شارع الكيال",
        "جلسات عصرية رايقة"
      ],
      "vibe_tags_en": [
        "Modern Japanese & Asian Kitchen",
        "Signature Ramen Noodles & Bites",
        "Ar Rawdah Al Kayyal",
        "Stylish Cozy Dining"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "late_night",
        "casual_hangout"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "togarashi",
          "branch_name_en": "Togarashi – Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Helmi Koutbi, Al Zahra, Jeddah 23521, Saudi Arabia",
          "latitude": 21.59189,
          "longitude": 39.1331315,
          "maps_business_name": "Togarashi",
          "google_place_id": "ChIJdwVUQQDbwxURa_VK4nHhCkg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdwVUQQDbwxURa_VK4nHhCkg",
          "google_rating": 4.4,
          "google_review_count": 3338,
          "operating_status": "open",
          "hours": "Sun-Thu: 12:00-02:00; Fri: 17:00-03:00; Sat: 12:00-02:00",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Togarashi Signature Ramen Bowl",
          "name_ar": "وعاء رامن توقاراشي الخاص",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Spicy Asian Chicken Bites",
          "name_ar": "قطع دجاج آسيوي حار",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "wakame",
      "canonical_name": "Wakame",
      "arabic_name": "وكامي",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "سلطة السالمون الحارة وتشكيلة الرولز",
      "signature_dish_en": "Spicy Salmon Salad & Signature Rolls",
      "vibe_tags_ar": [
        "سوشي ولاونج آسيوي فاخر",
        "أجواء راقية ومميزة",
        "أطباق طازجة وصحية",
        "طريق الملك والروضة وأبحر"
      ],
      "vibe_tags_en": [
        "Premium Asian & Sushi Lounge",
        "Chic Upscale Ambience",
        "Fresh & Healthy Options",
        "King Road, Rawdah & Obhur"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "delivery_strong",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_zahra",
        "al_rawdah",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "wakame",
          "branch_name_en": "Wakame King Abdulaziz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "King Abdul Aziz Rd, Al Zahra, Jeddah 23424",
          "latitude": 21.5771653,
          "longitude": 39.127812299999995,
          "maps_business_name": "Wakame",
          "google_place_id": "ChIJ-YTqdunawxURaTWgM0QLLtY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Wakame+King+Abdulaziz&query_place_id=ChIJ-YTqdunawxURaTWgM0QLLtY",
          "google_rating": 4.7,
          "google_review_count": 8115,
          "operating_status": "open",
          "hours": "Sat-Wed 12:00-00:30; Thu-Fri 12:00-01:30",
          "phone": "+966920005036",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "wakame",
          "branch_name_en": "Wakame Al Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Saud Al Faisal, Ar Rawdah, Jeddah 23432",
          "latitude": 21.5612285,
          "longitude": 39.160049099999995,
          "maps_business_name": "Wakame",
          "google_place_id": "ChIJTy6KDgzQwxUR9mohg17tmQo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Wakame+Al+Rawdah&query_place_id=ChIJTy6KDgzQwxUR9mohg17tmQo",
          "google_rating": 4.3,
          "google_review_count": 740,
          "operating_status": "open",
          "hours": "Sat-Wed 12:00-01:30; Thu-Fri 12:00-02:30",
          "phone": "+966920005036",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "wakame",
          "branch_name_en": "Wakame Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah AlFaisal St, Obhur Al-Shamaliyah, Jeddah 23815",
          "latitude": 21.7482751,
          "longitude": 39.1129761,
          "maps_business_name": "Wakame",
          "google_place_id": "ChIJd78w_ldiwRUROJwhXyEpQoU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Wakame+Obhur&query_place_id=ChIJd78w_ldiwRUROJwhXyEpQoU",
          "google_rating": 4.7,
          "google_review_count": 1944,
          "operating_status": "open",
          "hours": "Sat-Wed 12:00-00:30; Thu-Fri 12:00-01:30",
          "phone": "+966920005036",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Spicy Salmon Salad",
          "name_ar": "سلطة السالمون الحارة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "shiro",
      "canonical_name": "SHiRO",
      "arabic_name": "شيرو",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "بوكس كرانشي شيرو وسالمون رول",
      "signature_dish_en": "Shiro Crunchy Box & Salmon Rolls",
      "vibe_tags_ar": [
        "بوكسات سوشي ومأكولات آسيوية شهيرة",
        "مزيج كرانشي ونودلز",
        "حي الروضة",
        "سهرات ولذة سريعة"
      ],
      "vibe_tags_en": [
        "Popular Asian & Sushi Spot",
        "Crunchy Rolls & Noodles",
        "Ar Rawdah District",
        "Late Night Bites"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shiro",
          "branch_name_en": "SHiRO",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Abdul Maqsud Khojah, Ar Rawdah, Jeddah 23435",
          "latitude": 21.5747335,
          "longitude": 39.1478044,
          "maps_business_name": "SHiRO",
          "google_place_id": "ChIJ-4ohxhnbwxURp3xynQBNQgs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=SHiRO&query_place_id=ChIJ-4ohxhnbwxURp3xynQBNQgs",
          "google_rating": 4.6,
          "google_review_count": 3676,
          "operating_status": "open",
          "hours": "Daily 12:30-01:30",
          "phone": "+966122601179",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Shiro Crunchy Box",
          "name_ar": "بوكس كرانشي شيرو",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "myazu",
      "canonical_name": "MYAZU",
      "arabic_name": "ميازو",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 150,
      "estimated_spend_max_sar": 380,
      "signature_dish_ar": "السمك الأسود بالمايسو وروبيان البوبكورن",
      "signature_dish_en": "Black Cod with Miso & Popcorn Shrimp",
      "vibe_tags_ar": [
        "مطعم ياباني آسيوي فاخر عالمي",
        "أطباق نيجيري وروبيان تيمبورا وبلاك كود",
        "البساتين مول التحلية",
        "جلسات استثنائية راقية"
      ],
      "vibe_tags_en": [
        "World-Class Asian Fine Dining",
        "Artisan Robata Black Cod & Tempura",
        "Al Basateen Mall Tahlia",
        "Extraordinary Luxury Ambience"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "myazu",
          "branch_name_en": "MYAZU",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_rawdah",
          "address_en": "Al Basateen Mall, Prince Mohammed Bin Abdulaziz St, Ar Rawdah, Jeddah 23431",
          "latitude": 21.550448499999998,
          "longitude": 39.152941899999995,
          "maps_business_name": "MYAZU",
          "google_place_id": "ChIJr7siXarawxURGedypt4lvyU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=MYAZU&query_place_id=ChIJr7siXarawxURGedypt4lvyU",
          "google_rating": 4.5,
          "google_review_count": 5501,
          "operating_status": "open",
          "hours": "Sun-Tue/Sat 13:00-00:30; Wed-Fri 13:00-01:30",
          "phone": "+966920010434",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Black Cod with Saikyo Miso",
          "name_ar": "السمك الأسود بمايسو سايكو",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "kuuru",
      "canonical_name": "Kuuru",
      "arabic_name": "كورو",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 150,
      "estimated_spend_max_sar": 380,
      "signature_dish_ar": "واغيو بيف كوشي ياكي وسيفيتشي نيكاي",
      "signature_dish_en": "Wagyu Beef Kushi-yaki & Nikkei Ceviche",
      "vibe_tags_ar": [
        "مطعم نيكاي ياباني وبيروفي فاخر",
        "دليل ميشلان جدة",
        "مجمع ليلتي طريق الملك",
        "تجربة طهي مبتكرة واستثنائية"
      ],
      "vibe_tags_en": [
        "Luxury Nikkei Asian Dining",
        "Michelin Guide Jeddah",
        "Leylaty Complex King Road",
        "Innovative Culinary Excellence"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_khalidiyyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "kuuru",
          "branch_name_en": "Kuuru",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "Leylaty, Al Malik Road, Al Khalidiyyah, Jeddah 23422",
          "latitude": 21.5649333,
          "longitude": 39.1269279,
          "maps_business_name": "Kuuru",
          "google_place_id": "ChIJCV_6FK3bwxURGW35gnbsOmY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Kuuru&query_place_id=ChIJCV_6FK3bwxURGW35gnbsOmY",
          "google_rating": 4.6,
          "google_review_count": 1985,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-23:30; Thu-Fri 13:00-00:30",
          "phone": "+966920035739",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Nikkei Wagyu Skewers & Ceviche",
          "name_ar": "أسياخ واغيو بيف وسيفيتشي نيكاي",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "toki",
      "canonical_name": "Toki",
      "arabic_name": "توكي",
      "categories": [
        "asian",
        "chinese",
        "fine_dining"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "chinese",
        "fine_dining"
      ],
      "subcategories": [
        "chinese",
        "fine_dining"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 150,
      "estimated_spend_max_sar": 380,
      "signature_dish_ar": "بط بكين المقرمش وديم سوم توكي الفاخر",
      "signature_dish_en": "Crispy Peking Duck & Toki Dim Sum",
      "vibe_tags_ar": [
        "مطعم صيني فاخر أيقوني",
        "ديم سوم وبط بكين ومأكولات بحرية",
        "طريق الملك الخالدية",
        "أجواء فخمة وتجربة راقية"
      ],
      "vibe_tags_en": [
        "Iconic Luxury Chinese Dining",
        "Artisan Dim Sum Peking Duck & Seafood",
        "King Road Al Khalidiyyah",
        "Opulent Fine Dining"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "premium",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_khalidiyyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "toki",
          "branch_name_en": "Toki Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "King Abdulaziz Road, Al Khalidiyyah, Jeddah 23422, Saudi Arabia",
          "latitude": 21.5650829,
          "longitude": 39.1273139,
          "maps_business_name": "Toki",
          "google_place_id": "ChIJaeuq88XawxUR059lmk5Urps",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJaeuq88XawxUR059lmk5Urps",
          "google_rating": 4.4,
          "google_review_count": 2061,
          "operating_status": "open",
          "hours": "Sun-Wed: 13:00-23:30; Thu-Sat: 13:00-00:30",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Traditional Crispy Peking Duck",
          "name_ar": "بط بكين التقليدي المقرمش",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Steamed Artisan Dim Sum Platter",
          "name_ar": "تشكيلة ديم سوم فاخرة على البخار",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "sura",
      "canonical_name": "SURA Korean Fine Dining",
      "arabic_name": "سورا",
      "categories": [
        "asian",
        "korean"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "korean"
      ],
      "subcategories": [
        "korean"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "مشاوي بولغوغي اللحم الفاخر والبيبيمباب",
      "signature_dish_en": "Prime Beef Bulgogi & Sizzling Bibimbap",
      "vibe_tags_ar": [
        "مطعم كوري فاخر وباربيكيو",
        "مشاوي كورية على الطاولة وبيبيمباب",
        "حي الروضة شارع سعود الفيصل",
        "تجربة كورية راقية"
      ],
      "vibe_tags_en": [
        "Korean Fine Dining & Table BBQ",
        "Authentic Bulgogi & Bibimbap",
        "Ar Rawdah Prince Saud Al Faisal",
        "Refined Korean Experience"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "delivery_strong",
        "premium"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sura",
          "branch_name_en": "SURA Korean Fine Dining",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Saud Al Faisal, Ar Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.5590045,
          "longitude": 39.1533547,
          "maps_business_name": "SURA Korean Fine Dining",
          "google_place_id": "ChIJ8_LCkKfawxURkIR-oDZInLc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8_LCkKfawxURkIR-oDZInLc",
          "google_rating": 4.4,
          "google_review_count": 2659,
          "operating_status": "open",
          "hours": "Sun-Wed: 12:00-23:00; Thu-Sat: 12:00-00:00",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Prime Marinated Beef Bulgogi",
          "name_ar": "بولغوغي لحم متبل فاخر على المشواة",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Stone Pot Dolsot Bibimbap",
          "name_ar": "بيبيمباب في الإناء الحجري الساخن",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "hwaro",
      "canonical_name": "HWARO",
      "arabic_name": "هووارو",
      "categories": [
        "asian",
        "korean",
        "korean_bbq"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "korean",
        "korean_bbq"
      ],
      "subcategories": [
        "korean",
        "korean_bbq"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "مشاوي هووارو على الفحم وشوربة الكيمتشي",
      "signature_dish_en": "Hwaro Charcoal BBQ & Kimchi Jjigae",
      "vibe_tags_ar": [
        "باربيكيو كوري أصيل",
        "مشاوي كورية وهوت بوت",
        "حي الزهراء شارع البترجي",
        "جلسات حيوية وتجربة تفاعلية"
      ],
      "vibe_tags_en": [
        "Authentic Korean Charcoal BBQ",
        "Tabletop Grill & Kimchi Stew",
        "Al Zahra Al Batarji",
        "Interactive Dining Vibe"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "premium",
        "group_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "hwaro",
          "branch_name_en": "HWARO – Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "7140 Prince Saud Al Faisal, Ar Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.5589115,
          "longitude": 39.1534358,
          "maps_business_name": "HWARO",
          "google_place_id": "ChIJj9kfkafawxURXKzuNstbv4Y",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJj9kfkafawxURXKzuNstbv4Y",
          "google_rating": 4.5,
          "google_review_count": 2785,
          "operating_status": "open",
          "hours": "Sun-Wed: 13:00-23:30; Thu-Sat: 13:00-00:00",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Hwaro Premium Charcoal BBQ Set",
          "name_ar": "ست مشاوي هووارو الفاخرة على الفحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Spicy Kimchi Jjigae Stew",
          "name_ar": "شوربة كيمتشي حارة باللحم والتوفو",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "koreana",
      "canonical_name": "Koreana",
      "arabic_name": "كوريانا",
      "categories": [
        "asian",
        "korean"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "korean"
      ],
      "subcategories": [
        "korean"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "بولغوغي اللحم الكلاسيكي وتشكيلة الكيمتشي",
      "signature_dish_en": "Classic Beef Bulgogi & Kimchi Platter",
      "vibe_tags_ar": [
        "أقدم وأعرق مطعم كوري بجدة",
        "كيمتشي وبولغوغي ونكهات كورية أصلية",
        "حي الروضة",
        "أجواء عائلية مريحة"
      ],
      "vibe_tags_en": [
        "Heritage Authentic Korean Classic",
        "Home-style Kimchi & Bulgogi",
        "Ar Rawdah District",
        "Cozy Heritage Dining"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "casual_hangout",
        "dine_in_strong",
        "heritage"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_andalus"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "koreana",
          "branch_name_en": "Koreana Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "Abd Al Majid Shoubakshi, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5468692,
          "longitude": 39.1632177,
          "maps_business_name": "Koreana",
          "google_place_id": "ChIJAysxRuXPwxUR6baPL-w9jTE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAysxRuXPwxUR6baPL-w9jTE",
          "google_rating": 4.4,
          "google_review_count": 1410,
          "operating_status": "open",
          "hours": "Daily: 12:00-23:30",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Classic Korean Beef Bulgogi & Kimchi",
          "name_ar": "بولغوغي كوري كلاسيكي مع تشكيلة كيمتشي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Japchae Glass Noodles",
          "name_ar": "نودلز جابتشي الكورية بالخضار",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "thai_fortune",
      "canonical_name": "Thai Fortune",
      "arabic_name": "مطعم فورتشن التايلاندي",
      "categories": [
        "asian",
        "thai"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "thai"
      ],
      "subcategories": [
        "thai"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "شوربة توم يوم بالروبيان وباد تاي الدجاج",
      "signature_dish_en": "Tom Yum Goong & Chicken Pad Thai",
      "vibe_tags_ar": [
        "جوهرة تايلاندية أصيلة مخفية",
        "توم يوم وباد تاي ونكهات بانكوك",
        "حي الفيصلية",
        "نكهة تايلاندية شعبية أصلية"
      ],
      "vibe_tags_en": [
        "Authentic Thai Hidden Gem",
        "Tom Yum Soup & Classic Pad Thai",
        "Al Faisaliyyah District",
        "Unpretentious Street Flavors"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "casual_hangout",
        "delivery_strong",
        "hidden_gem"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "thai_fortune",
          "branch_name_en": "Thai Fortune Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Shar Qurashi, As Salamah, Jeddah 23437, Saudi Arabia",
          "latitude": 21.5913226,
          "longitude": 39.1568087,
          "maps_business_name": "Thai Fortune",
          "google_place_id": "ChIJFVG7XS3ZwxURdOhnOj_WOxc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJFVG7XS3ZwxURdOhnOj_WOxc",
          "google_rating": 4.8,
          "google_review_count": 1075,
          "operating_status": "open",
          "hours": "Sun-Thu: 12:30-00:30; Fri: 13:00-00:30; Sat: 12:30-00:30",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Authentic Tom Yum Goong Soup",
          "name_ar": "شوربة توم يوم غونغ التايلاندية بالروبيان",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Classic Chicken Pad Thai",
          "name_ar": "باد تاي الدجاج الكلاسيكي بالفول السوداني",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "thai_lee",
      "canonical_name": "Thai Lee",
      "arabic_name": "تاي لي",
      "categories": [
        "asian",
        "thai"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "thai"
      ],
      "subcategories": [
        "thai"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "باد تاي الروبيان ونودلز تاي لي الحارة",
      "signature_dish_en": "Shrimp Pad Thai & Spicy Thai Lee Noodles",
      "vibe_tags_ar": [
        "مطعم تايلاندي محلي محبوب",
        "نودلز تايلاندية ومأكولات بحرية حارة",
        "حي السلامة",
        "سريع ولذيذ"
      ],
      "vibe_tags_en": [
        "Beloved Local Thai Eatery",
        "Spicy Thai Noodles & Tom Yum",
        "As Salamah District",
        "Flavorful Comfort Food"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "thai_lee",
          "branch_name_en": "Thai Lee – Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas, Al Zahra, Jeddah 23425, Saudi Arabia",
          "latitude": 21.5889717,
          "longitude": 39.1315739,
          "maps_business_name": "Thai Lee",
          "google_place_id": "ChIJKz0nuyPbwxURQ3zzgb3leEs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJKz0nuyPbwxURQ3zzgb3leEs",
          "google_rating": 4.4,
          "google_review_count": 1886,
          "operating_status": "open",
          "hours": "Sun-Thu: 13:00-01:00; Fri-Sat: 13:00-02:00",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Special Seafood Pad Thai",
          "name_ar": "باد تاي مأكولات بحرية سبيشال",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Spicy Green Curry Chicken",
          "name_ar": "كاري أخضر تايلاندي حار بالدجاج",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "sakura_japanese_restaurant",
      "canonical_name": "Sakura Japanese Restaurant",
      "arabic_name": "مطعم ساكورا الياباني",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "تيبانياكي اللحم والساشيمي الطازج",
      "signature_dish_en": "Beef Teppanyaki & Fresh Sashimi Platter",
      "vibe_tags_ar": [
        "مطعم ياباني آسيوي أصيل عريق",
        "كراون بلازا الحمراء",
        "ساشيمي وتيبانياكي تقليدي",
        "أجواء يابانية هادئة"
      ],
      "vibe_tags_en": [
        "Authentic Heritage Japanese",
        "Crowne Plaza Al Hamra",
        "Traditional Teppanyaki & Sashimi",
        "Serene Japanese Ambience"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_hamra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sakura_japanese_restaurant",
          "branch_name_en": "Sakura Japanese Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "Al-Hamra'a, Jeddah 21443",
          "latitude": 21.5167003,
          "longitude": 39.155678,
          "maps_business_name": "Sakura Japanese Restaurant",
          "google_place_id": "ChIJg-2NTADPwxURxhfLE_Kmrbc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Sakura+Japanese+Restaurant&query_place_id=ChIJg-2NTADPwxURxhfLE_Kmrbc",
          "google_rating": 4.7,
          "google_review_count": 164,
          "operating_status": "open",
          "hours": "Sun-Wed split lunch/dinner; Thu-Sat 13:00-23:30",
          "phone": "+966552893752",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Prime Beef Teppanyaki",
          "name_ar": "تيبانياكي لحم بقري فاخر",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "sushiah",
      "canonical_name": "Sushiah",
      "arabic_name": "سوشيّا",
      "categories": [
        "sushi",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "asian"
      ],
      "subcategories": [
        "asian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "بوكس سوشيّا سبيشال وسالمون ترياكي",
      "signature_dish_en": "Sushiah Special Box & Salmon Teriyaki",
      "vibe_tags_ar": [
        "سوشي وآسيوي مبتكر وعصري",
        "توصيل قوي وسريع",
        "خيارات بوكسات غنية",
        "شارع صاري الزهراء"
      ],
      "vibe_tags_en": [
        "Innovative Modern Asian & Sushi",
        "Strong Delivery Presence",
        "Generous Party Boxes",
        "Sari Street Al Zahra"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sushiah",
          "branch_name_en": "Sushiah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Sari Br Rd, Al Zahra, Jeddah 23424",
          "latitude": 21.5726662,
          "longitude": 39.1347526,
          "maps_business_name": "Sushiah",
          "google_place_id": "ChIJZYAFEj7bwxURlxfbSWNAWCU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Sushiah&query_place_id=ChIJZYAFEj7bwxURlxfbSWNAWCU",
          "google_rating": 4.7,
          "google_review_count": 2337,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-01:00; Thu 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966555189902",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Sushiah Special Party Box",
          "name_ar": "بوكس حفلات سوشيّا الخاص",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "shang_palace",
      "canonical_name": "Shang Palace",
      "arabic_name": "شانغ بالاس",
      "categories": [
        "asian",
        "chinese",
        "fine_dining"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "chinese",
        "fine_dining"
      ],
      "subcategories": [
        "chinese",
        "fine_dining"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 150,
      "estimated_spend_max_sar": 380,
      "signature_dish_ar": "بط بكين المحمر في الفرن وديم سوم شانغ الفاخر",
      "signature_dish_en": "Roasted Peking Duck & Dim Sum Selection",
      "vibe_tags_ar": [
        "مطعم صيني كانتوني فائق الفخامة",
        "فندق شانغريلا كورنيش جدة",
        "ديم سوم معاصر وبط بكين الملكي",
        "إطلالة بحرية وأجواء استثنائية"
      ],
      "vibe_tags_en": [
        "Ultra-Luxury Cantonese Fine Dining",
        "Shangri-La Hotel Corniche",
        "Contemporary Dim Sum & Peking Duck",
        "Breathtaking Coastal Ambience"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "premium",
        "waterfront_view"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shang_palace",
          "branch_name_en": "Shang Palace – Shangri-La Jeddah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "4th Floor, Shangri-La Jeddah, Corniche Rd, Ash Shati, Jeddah 23611, Saudi Arabia",
          "latitude": 21.622886,
          "longitude": 39.1080209,
          "maps_business_name": "Shang Palace",
          "google_place_id": "ChIJWWrCyzHbwxURr-EBsKkAnDo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWWrCyzHbwxURr-EBsKkAnDo",
          "google_rating": 4.8,
          "google_review_count": 2091,
          "operating_status": "open",
          "hours": "Mon-Wed: 16:00-23:30; Thu-Sat: 13:00-23:30; Sun: closed",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Shang Palace Wood-Fired Peking Duck",
          "name_ar": "بط بكين المحمر بحطب الفرن الخاص",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Steamed Truffle Shrimp Dumplings",
          "name_ar": "دمبلنغ روبيان بالكمأة ديم سوم",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "canton",
      "canonical_name": "Canton",
      "arabic_name": "كانتون",
      "categories": [
        "asian",
        "chinese",
        "fast_casual"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "chinese",
        "fast_casual"
      ],
      "subcategories": [
        "chinese",
        "fast_casual"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "دجاج كانتون بالصويا ونودلز مشكلة",
      "signature_dish_en": "Canton Soy Chicken & Mixed Noodles",
      "vibe_tags_ar": [
        "أشهر سلسلة صينية سريعة",
        "نودلز ودجاج كانتون بالصويا",
        "منتشر في مولات جدة",
        "وجبة سريعة ومميزة"
      ],
      "vibe_tags_en": [
        "Famous Fast Chinese Chain",
        "Canton Noodles & Sweet Sour Chicken",
        "Jeddah Mall Foodcourts & Streets",
        "Quick Comfort Meal"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "budget",
        "quick_bite",
        "delivery_strong",
        "broad_coverage"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 14,
      "canonical_districts": [
        "al_shati",
        "al_faiha",
        "al_ruwais",
        "al_thaghr",
        "al_faisaliyyah",
        "an_nuzhah",
        "al_sheraa",
        "al_rawdah",
        "al_hamdaniyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_shati",
          "address_en": "Red Sea Mall, King Abdulaziz Branch Rd, Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.627959,
          "longitude": 39.111595,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJmQwqXc3bwxURpuqdAjhUSwI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJmQwqXc3bwxURpuqdAjhUSwI",
          "google_rating": 3.9,
          "google_review_count": 434,
          "operating_status": "open",
          "hours": "Daily: 11:00-23:30",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Andalus Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_faiha",
          "address_en": "King Abdullah Rd, Al Andalus Mall, Al Fayha, Jeddah 22245, Saudi Arabia",
          "latitude": 21.5077391,
          "longitude": 39.2176723,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJEZ7TrM3PwxUR0QAaJyb-ysA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJEZ7TrM3PwxUR0QAaJyb-ysA",
          "google_rating": 4.4,
          "google_review_count": 53,
          "operating_status": "open",
          "hours": "Daily: 11:00-23:30",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Ar Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "Palestine Road, Ar Ruwais, Jeddah 23215, Saudi Arabia",
          "latitude": 21.5266296,
          "longitude": 39.1756173,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJn6CJF8LPwxURZG5sb6dRuUQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJn6CJF8LPwxURZG5sb6dRuUQ",
          "google_rating": 4.1,
          "google_review_count": 472,
          "operating_status": "open",
          "hours": "Daily: 11:00-01:00",
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Ath Thaghr",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_thaghr",
          "address_en": "Ibn an Nafis, Ath Thaghr District, Jeddah 22338, Saudi Arabia",
          "latitude": 21.4828444,
          "longitude": 39.2410931,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJoaZz1CDNwxURCDNJ_HMbBEg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJoaZz1CDNwxURCDNJ_HMbBEg",
          "google_rating": 3.8,
          "google_review_count": 225,
          "operating_status": "open",
          "hours": "Daily: 11:30-01:00",
          "geographic_notes": "Located in canonical district al_thaghr.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Faisaliyyah – King Fahd Br Rd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "King Fahad Rd, Al Faisaliyyah, Jeddah 23334, Saudi Arabia",
          "latitude": 21.560847,
          "longitude": 39.1860253,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJ24IGOvXRwxURxn69KHoTL-4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ24IGOvXRwxURxn69KHoTL-4",
          "google_rating": 4.5,
          "google_review_count": 307,
          "operating_status": "open",
          "hours": "Daily: 11:00-23:30",
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Faisaliyyah – Al Souwaiss",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "Al Souwaiss, Al Faisaliyyah, Jeddah 23447, Saudi Arabia",
          "latitude": 21.5767067,
          "longitude": 39.1958821,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJN5Cq3__QwxURCp0jMH3p4bo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJN5Cq3__QwxURCp0jMH3p4bo",
          "google_rating": 3.9,
          "google_review_count": 456,
          "operating_status": "open",
          "hours": "Daily: 11:00-01:00",
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton King Abdullah Rd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Prince Majid Rd, Al Fayha, Jeddah 22251, Saudi Arabia",
          "latitude": 21.5075659,
          "longitude": 39.2245284,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJ6ze0k2rOwxUR6_iuW18_Nrg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ6ze0k2rOwxUR6_iuW18_Nrg",
          "google_rating": 4.3,
          "google_review_count": 767,
          "operating_status": "open",
          "hours": "Daily: 11:45-00:30",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Manar",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Ajawad St, Al-Manar, Jeddah 23462, Saudi Arabia",
          "latitude": 21.5922137,
          "longitude": 39.2294201,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJtYm5JlvRwxUR_iKTo1Qj2DE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJtYm5JlvRwxUR_iKTo1Qj2DE",
          "google_rating": 3.6,
          "google_review_count": 202,
          "operating_status": "open",
          "hours": "Daily: 11:30-01:00",
          "geographic_notes": "Outer Jeddah branch located in Al Manar (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Amir Fawwaz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "District, Makkah - Jeddah Hwy, Al Amir Fawwaz Al Junoobi, Jeddah 22431, Saudi Arabia",
          "latitude": 21.4407944,
          "longitude": 39.2811324,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJwy_Xc4fMwxURscnKsoHauoY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwy_Xc4fMwxURscnKsoHauoY",
          "google_rating": 4,
          "google_review_count": 620,
          "operating_status": "open",
          "hours": "Daily: 11:00-01:00",
          "geographic_notes": "Outer Jeddah branch located in Al Amir Fawwaz Al Junoobi (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton An Nuzhah",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6328398,
          "longitude": 39.1564529,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJ320THLDXwxURe9jGyD0rnxw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ320THLDXwxURe9jGyD0rnxw",
          "google_rating": 4,
          "google_review_count": 274,
          "operating_status": "open",
          "hours": "Daily: 11:00-23:30",
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Shera'a",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sheraa",
          "address_en": "Al Shera'a, Jeddah 23816, Saudi Arabia",
          "latitude": 21.7659959,
          "longitude": 39.1013847,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJN5b0BgBjwRURjsujrl-cGW4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJN5b0BgBjwRURjsujrl-cGW4",
          "google_rating": 4.2,
          "google_review_count": 289,
          "operating_status": "open",
          "hours": "Daily: 11:30-01:00",
          "geographic_notes": "Located in canonical district al_sheraa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_rawdah",
          "address_en": "Tahlia Mall, Ar Rawdah, Jeddah 23431, Saudi Arabia",
          "latitude": 21.5497957,
          "longitude": 39.1475107,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJTYFZvqzawxUR3DF5ohrKmoc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJTYFZvqzawxUR3DF5ohrKmoc",
          "google_rating": 3.9,
          "google_review_count": 113,
          "operating_status": "open",
          "hours": "Daily: 11:00-23:30",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Ibn Manea St, Al Sanabel, Jeddah 22444, Saudi Arabia",
          "latitude": 21.3998055,
          "longitude": 39.2816527,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJJ5N46VDLwxURkvT_8EgPL9s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJ5N46VDLwxURkvT_8EgPL9s",
          "google_rating": 4.4,
          "google_review_count": 25,
          "operating_status": "open",
          "hours": "Daily: 11:30-01:00",
          "geographic_notes": "Outer Jeddah branch located in Al Sanabel (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "canton",
          "branch_name_en": "Canton Al Hamadaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamdaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7554265,
          "longitude": 39.1972715,
          "maps_business_name": "Canton",
          "google_place_id": "ChIJC3gPewB9wRURL1Z3eEXzepM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJC3gPewB9wRURL1Z3eEXzepM",
          "google_rating": 4.2,
          "google_review_count": 241,
          "operating_status": "open",
          "hours": "Daily: 11:00-01:00",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Canton Soy Chicken with Noodles",
          "name_ar": "دجاج كانتون بالصويا مع النودلز",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Sweet & Sour Chicken Rice Box",
          "name_ar": "بوكس أرز دجاج حامض حلو",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "baytoti",
      "canonical_name": "Baytoti",
      "arabic_name": "بيتوتي",
      "categories": [
        "asian",
        "chinese"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "chinese"
      ],
      "subcategories": [
        "chinese"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "دجاج كرانشي حامض حلو ونودلز بيتوتي",
      "signature_dish_en": "Crunchy Sweet & Sour Chicken & Baytoti Noodles",
      "vibe_tags_ar": [
        "سلسلة صينية محلية رائدة",
        "نودلز وأرز مقلي ودجاج حامض حلو",
        "جلسات عائلية واسعة",
        "فروع متعددة بجدة"
      ],
      "vibe_tags_en": [
        "Leading Local Chinese Chain",
        "Noodles Fried Rice & Sweet Sour",
        "Spacious Family Dining",
        "Multiple Jeddah Branches"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "budget",
        "quick_bite",
        "delivery_strong",
        "late_night",
        "broad_coverage"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 9,
      "canonical_districts": [
        "al_salamah",
        "al_mohammadiyyah",
        "al_marwah",
        "abhur_al_shamaliyah",
        "al_samer"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Beside SABB, Sari Br Rd, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.578646,
          "longitude": 39.155614,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJh4CWYHjQwxURQ-bwhoCnT-E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJh4CWYHjQwxURQ-bwhoCnT-E",
          "google_rating": 4.5,
          "google_review_count": 8399,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00; Thu-Fri: 12:45-04:00",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Al Mohammadiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23623, Saudi Arabia",
          "latitude": 21.645183,
          "longitude": 39.12877,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJHRbxI5LZwxURbTt2ZHZkskM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJHRbxI5LZwxURbTt2ZHZkskM",
          "google_rating": 4.4,
          "google_review_count": 6932,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Mandarine Avenue, Al Marwah, Jeddah 23543, Saudi Arabia",
          "latitude": 21.6219844,
          "longitude": 39.2023403,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJm1mbv9DWwxURt6UpZpPBaXs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJm1mbv9DWwxURt6UpZpPBaXs",
          "google_rating": 4.6,
          "google_review_count": 5546,
          "operating_status": "open",
          "hours": "Daily: 12:45-04:00",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Sanabel, Jeddah 22444, Saudi Arabia",
          "latitude": 21.400008,
          "longitude": 39.281654,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJowkyIvXLwxUR5iyQVXGyygs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJowkyIvXLwxUR5iyQVXGyygs",
          "google_rating": 4.8,
          "google_review_count": 945,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Outer Jeddah branch located in Al Sanabel (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah Al Faisal Branch, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.749488,
          "longitude": 39.113414,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJK3vrevhiwRURhD0wZVKdNeA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJK3vrevhiwRURhD0wZVKdNeA",
          "google_rating": 4.6,
          "google_review_count": 5645,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Albughdadiya",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al-Baghdadiyah Al-Gharbiyah, Jeddah 22234, Saudi Arabia",
          "latitude": 21.5015624,
          "longitude": 39.1828163,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJQfHZBqfPwxURgZ8SPMh65tA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQfHZBqfPwxURgZ8SPMh65tA",
          "google_rating": 4.4,
          "google_review_count": 5173,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Outer Jeddah branch located in Al Baghdadiyah (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "H6GR+P7, Al Samer, Jeddah 23464, Saudi Arabia",
          "latitude": 21.5768125,
          "longitude": 39.2406875,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJ37RaYUPTwxUR5vJ3udlmtMM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ37RaYUPTwxUR5vJ3udlmtMM",
          "google_rating": 4.5,
          "google_review_count": 1785,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Alsalama",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Abdul Rahman Ibn Ahmad As Sidayri, As Salamah, Jeddah 23437, Saudi Arabia",
          "latitude": 21.593139,
          "longitude": 39.156291,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJZ7hHRYLQwxURYSZtxu_s9-4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJZ7hHRYLQwxURYSZtxu_s9-4",
          "google_rating": 4.4,
          "google_review_count": 4250,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "baytoti",
          "branch_name_en": "Baytoti Al Yaqoot",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "King Faisal Bin Abdulaziz, Al Yaqoot, Jeddah 23826, Saudi Arabia",
          "latitude": 21.7994586,
          "longitude": 39.084173,
          "maps_business_name": "Baytoti",
          "google_place_id": "ChIJox-wHkBjwRURr3OyZx3RaD4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJox-wHkBjwRURr3OyZx3RaD4",
          "google_rating": 4.6,
          "google_review_count": 464,
          "operating_status": "open",
          "hours": "Daily: 12:45-03:00",
          "geographic_notes": "Outer Jeddah branch located in Al Yaqoot (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Baytoti Noodles & Sweet Sour Chicken",
          "name_ar": "نودلز بيتوتي ودجاج حامض حلو",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Dynamite Shrimp & Fried Rice",
          "name_ar": "ديناميت شرمب وأرز مقلي صيني",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "denden",
      "canonical_name": "Denden",
      "arabic_name": "دندن",
      "categories": [
        "asian",
        "indonesian"
      ],
      "primary_category": "asian",
      "secondary_categories": [
        "indonesian"
      ],
      "subcategories": [
        "indonesian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "صحن دندن مشكل وساتا دجاج مع صوص الفول السوداني",
      "signature_dish_en": "Denden Nasi Campur & Chicken Sate",
      "vibe_tags_ar": [
        "أشهر مطعم إندونيسي بجدة",
        "صحن مشكل إندونيسي وساتا ودندن",
        "نكهة جاويّة أصيلة",
        "فروع منتشرة بجدة"
      ],
      "vibe_tags_en": [
        "Famous Indonesian Heritage Chain",
        "Nasi Campur Sate & Rendang",
        "Authentic Javanese Flavors",
        "Multiple Jeddah Locations"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "budget",
        "quick_bite",
        "delivery_strong",
        "broad_coverage"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 9,
      "canonical_districts": [
        "al_faiha",
        "al_samer",
        "al_marwah",
        "al_safa",
        "abhur_al_shamaliyah",
        "al_naseem",
        "al_hamdaniyah",
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden An Nahdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Hira St, An Nahdah, Jeddah 23523, Saudi Arabia",
          "latitude": 21.60835,
          "longitude": 39.129499,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJ8cic10PawxUR29ld0F3g3hU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8cic10PawxUR29ld0F3g3hU",
          "google_rating": 4.1,
          "google_review_count": 6235,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Outer Jeddah branch located in An Nahdah (outside 30 canonical core districts); coordinates preserved for GPS/distance resolution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden Al Andalus Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_faiha",
          "address_en": "Food court - Andalus Mall, Al Fayha, Jeddah 22245, Saudi Arabia",
          "latitude": 21.50587,
          "longitude": 39.218156,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJg6d6bpjPwxUR_ZJzrgg5kEc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJg6d6bpjPwxUR_ZJzrgg5kEc",
          "google_rating": 4.2,
          "google_review_count": 346,
          "operating_status": "open",
          "hours": "Daily: 12:00-00:00",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden As Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "Ankara, As Samer, Jeddah 23462, Saudi Arabia",
          "latitude": 21.587581,
          "longitude": 39.236068,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJN66YGx3RwxURAFy0_5Hiy9c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJN66YGx3RwxURAFy0_5Hiy9c",
          "google_rating": 3.8,
          "google_review_count": 1078,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Al Marwah, Jeddah 23545, Saudi Arabia",
          "latitude": 21.624429,
          "longitude": 39.210455,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJdcpLSQDXwxURnFIXaSb-V8g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdcpLSQDXwxURnFIXaSb-V8g",
          "google_rating": 4.3,
          "google_review_count": 401,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden As Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "Saud Al Faisal St, Al-Safa, Jeddah 23451, Saudi Arabia",
          "latitude": 21.572896,
          "longitude": 39.200748,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJewKSTUfRwxURcnLDzBqHNxI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJewKSTUfRwxURcnLDzBqHNxI",
          "google_rating": 3.5,
          "google_review_count": 1172,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden Obhur Al Shamaliyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.75635,
          "longitude": 39.120331,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJIeusQgJjwRURj46PqyRAbvo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJIeusQgJjwRURj46PqyRAbvo",
          "google_rating": 4.2,
          "google_review_count": 3068,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "Abu Thar Al-Ghifari, An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.519285,
          "longitude": 39.239542,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJS6g_Zv7NwxURhYlSnzK0vzM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJS6g_Zv7NwxURhYlSnzK0vzM",
          "google_rating": 3.8,
          "google_review_count": 3211,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden Al Hamdaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamadaniyyah St, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.750104,
          "longitude": 39.188298,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJF1zxePF8wRURXz3EejnhRgQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJF1zxePF8wRURXz3EejnhRgQ",
          "google_rating": 3.8,
          "google_review_count": 1751,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "denden",
          "branch_name_en": "Denden As Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Abdul Rahman Ibn Ahmad As Sidayri, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.58918,
          "longitude": 39.15715,
          "maps_business_name": "Denden",
          "google_place_id": "ChIJ5RrsRH7QwxURVFpbF3OisUw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5RrsRH7QwxURVFpbF3OisUw",
          "google_rating": 3.9,
          "google_review_count": 3148,
          "operating_status": "open",
          "hours": "Daily: 12:00-01:00",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Denden Indonesian Mixed Platter (Nasi Campur)",
          "name_ar": "صحن دندن مشكل إندونيسي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Sate with Peanut Sauce",
          "name_ar": "ساتا دجاج بصوص الفول السوداني",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 0. Safely remove unverified/defunct legacy Asian seed records that have no swipes
DELETE FROM public.restaurants WHERE id IN ('benihana', 'pf_changs') AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_swipes WHERE restaurant_id = restaurants.id
);

-- 1. Upsert public.restaurants
-- Preserves primary_category = 'sushi' for sushi overlap brands while adding 'asian' to categories
-- Promotes legacy seed 'chan' to primary_category = 'asian' and production_ready
WITH catalog AS (SELECT payload FROM _asian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode, time_slots,
  closing_time_ar, is_open_late, is_24_hours, avg_prep_minutes, tier, price_tier,
  signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, platforms, links,
  city, primary_category, secondary_categories, subcategories, category_fit_confidence,
  category_fit_evidence, editorial_role, reputation_tags, context_tags, business_type,
  operating_status, brand_status_confidence, verified_jeddah_branch_count,
  branch_list_completeness, dining_mode_summary, price_position,
  estimated_sar_per_person_min, estimated_sar_per_person_max, official_website,
  trend_status, trend_confidence, overall_confidence, research_use, last_verified_at,
  manual_review_required, manual_review_reasons, intelligence_origin
)
SELECT
  b->>'brand_id',
  b->>'arabic_name',
  b->>'canonical_name',
  ARRAY(SELECT jsonb_array_elements_text(b->'categories')),
  (b->>'is_city_wide')::boolean,
  ARRAY(SELECT jsonb_array_elements_text(b->'canonical_districts')),
  'both',
  ARRAY(SELECT jsonb_array_elements_text(b->'time_slots')),
  CASE WHEN (b->>'is_open_late')::boolean THEN 'يقفل 2:00 ص' ELSE 'يقفل 12:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  25,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  jsonb_build_object(
    'hungerstation', b->'delivery_platforms' @> '["hungerstation"]',
    'jahez', b->'delivery_platforms' @> '["jahez"]',
    'keeta', b->'delivery_platforms' @> '["keeta"]'
  ),
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'),
  'jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Verified by operational physical presence and direct Google Places branch inventory',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  (b->>'research_use')::public.research_use,
  '2026-09-28T00:00:00Z'::timestamptz,
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
  primary_category=CASE 
    WHEN restaurants.primary_category = 'sushi' THEN 'sushi' 
    ELSE EXCLUDED.primary_category 
  END,
  editorial_role=COALESCE(EXCLUDED.editorial_role, restaurants.editorial_role),
  tier=COALESCE(EXCLUDED.tier, restaurants.tier),
  price_tier=COALESCE(EXCLUDED.price_tier, restaurants.price_tier),
  price_position=COALESCE(EXCLUDED.price_position, restaurants.price_position),
  signature_dish_ar=COALESCE(EXCLUDED.signature_dish_ar, restaurants.signature_dish_ar),
  signature_dish_en=COALESCE(EXCLUDED.signature_dish_en, restaurants.signature_dish_en),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  platforms=EXCLUDED.platforms,
  links=EXCLUDED.links,
  city=EXCLUDED.city,
  category_fit_confidence=EXCLUDED.category_fit_confidence,
  category_fit_evidence=EXCLUDED.category_fit_evidence,
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  dining_mode=EXCLUDED.dining_mode,
  dining_mode_summary=EXCLUDED.dining_mode_summary,
  estimated_sar_per_person_min=EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max=EXCLUDED.estimated_sar_per_person_max,
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  trend_status=EXCLUDED.trend_status,
  trend_confidence=EXCLUDED.trend_confidence,
  overall_confidence=EXCLUDED.overall_confidence,
  research_use=EXCLUDED.research_use,
  last_verified_at=EXCLUDED.last_verified_at,
  manual_review_required=EXCLUDED.manual_review_required,
  manual_review_reasons=EXCLUDED.manual_review_reasons,
  intelligence_origin=EXCLUDED.intelligence_origin;

-- 2. Cleanup stale best sellers and sources for pure Asian brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _asian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'primary_category' = 'asian'
);

DELETE FROM public.restaurant_sources s USING _asian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'primary_category' = 'asian'
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches for all 50 verified branches
WITH catalog AS (SELECT payload FROM _asian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
)
INSERT INTO public.restaurant_branches (
  restaurant_id, branch_name_ar, branch_name_en, branch_status, branch_status_confidence, branch_type,
  district, address_en, latitude, longitude, maps_business_name, google_place_id, maps_lookup_status,
  google_maps_url, google_rating, google_review_count, rating_source, maps_last_verified_at,
  branch_identity_confidence, geographic_notes, last_verified_at
)
SELECT
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
  'verified',
  br->>'google_maps_url',
  (br->>'google_rating')::numeric,
  (br->>'google_review_count')::integer,
  'google_maps_direct',
  '2026-09-28T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-28T00:00:00Z'::timestamptz
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
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
  maps_lookup_status=EXCLUDED.maps_lookup_status,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  rating_source=EXCLUDED.rating_source,
  maps_last_verified_at=EXCLUDED.maps_last_verified_at,
  branch_identity_confidence=EXCLUDED.branch_identity_confidence,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert best sellers for Asian brands
WITH catalog AS (SELECT payload FROM _asian_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
  WHERE b->>'primary_category' = 'asian'
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
  'Certified Asian Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources for pure Asian brands
WITH catalog AS (SELECT payload FROM _asian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL AND b->>'primary_category' = 'asian'
)
INSERT INTO public.restaurant_sources (
  restaurant_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  b->>'brand_id',
  'official_website'::public.research_source_type,
  b->>'official_website',
  ARRAY['brand_identity', 'category', 'best_sellers']::text[],
  '2026-09-28T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources for pure Asian branches
WITH catalog AS (SELECT payload FROM _asian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
  WHERE b->>'primary_category' = 'asian'
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
  '2026-09-28T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
