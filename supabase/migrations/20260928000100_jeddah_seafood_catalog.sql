-- Google-verified Jeddah Seafood production catalog.
-- Source: docs/research/jeddah-seafood-pass-d-corrected.json
-- 20 approved brands, 52 verified physical branches (41 canonical, 11 outer-district caution branches).
-- Preserves Seafood Anchor Rule (Shrimp Zone & Shrimp Anatomy, 50/50 anchor selection, 1 per 7-card deck).
-- Strict sushi exclusion verified (zero sushi restaurants or dishes).
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Apply after 20260927000600_jeddah_italian_catalog.sql.
BEGIN;

CREATE TEMP TABLE _seafood_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _seafood_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Seafood Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-28",
    "brand_count": 20,
    "branch_count": 52,
    "canonical_branch_count": 41,
    "outer_caution_branch_count": 11,
    "seafood_deck_rule": {
      "deck_size": 7,
      "guaranteed_anchor_count": 1,
      "anchor_candidates": [
        "Shrimp Zone",
        "Shrimp Anatomy"
      ],
      "initial_anchor_probability_each": 0.5,
      "rule": "Choose exactly one anchor first, then choose the nearest usable physical branch. Do not automatically add the other anchor in the remaining six cards.",
      "nearest_usable_branch_resolution": true,
      "remaining_cards_selection": "randomized_from_seafood_candidate_pool"
    }
  },
  "brands": [
    {
      "brand_id": "twina_seafood",
      "canonical_name": "Twina Seafood",
      "arabic_name": "توينا",
      "categories": [
        "seafood",
        "saudi_seafood",
        "fresh_fish"
      ],
      "primary_category": "seafood",
      "secondary_categories": [
        "saudi_seafood",
        "fresh_fish"
      ],
      "subcategories": [
        "saudi_seafood",
        "fresh_fish"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "ناجل وهامور مشوي على الفحم",
      "signature_dish_en": "Grilled Najil & Hamour",
      "vibe_tags_ar": [
        "مأكولات بحرية فاخرة",
        "جلسات عائلية وإطلالات بحرية",
        "نادي اليخوت ودرة العروس وذهبـان",
        "أسماك طازجة"
      ],
      "vibe_tags_en": [
        "Luxury Red Sea Seafood",
        "Waterfront Family Dining",
        "Yacht Club & Resort Venues",
        "Fresh Fish Selection"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "al_mohammadiyyah",
        "al_hamra",
        "al_zahra",
        "al_shati",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://twina.sa/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Seafood - Al Muhammadiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Muhammadiyah, Jeddah 23625, Saudi Arabia",
          "latitude": 21.663243599999998,
          "longitude": 39.1225787,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJVWeyg9PZwxURZdtvtt_aBbQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Seafood%20-%20Al%20Muhammadiyah&query_place_id=ChIJVWeyg9PZwxURZdtvtt_aBbQ",
          "google_rating": 4.5,
          "google_review_count": 2416,
          "operating_status": "open",
          "hours": "Daily 13:00-01:00",
          "phone": "+966920028284",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Seafood - Corniche Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "2903 Al Kurnaysh Br Rd, Al-Hamra'a, Jeddah 23321, Saudi Arabia",
          "latitude": 21.5288491,
          "longitude": 39.159294599999996,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJkcApePTPwxURWdgK3AbmtPk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Seafood%20-%20Corniche%20Al%20Hamra&query_place_id=ChIJkcApePTPwxURWdgK3AbmtPk",
          "google_rating": 4.2,
          "google_review_count": 5501,
          "operating_status": "open",
          "hours": "Daily 13:00-01:00",
          "phone": "+966920028284",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Seafood - Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "3788 Sari Br Rd, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5748926,
          "longitude": 39.1426322,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJU-H0NZfawxUR3Ftqo9sRsYo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Seafood%20-%20Sari&query_place_id=ChIJU-H0NZfawxUR3Ftqo9sRsYo",
          "google_rating": 4.1,
          "google_review_count": 6884,
          "operating_status": "open",
          "hours": "Daily 13:00-01:00",
          "phone": "+966920028284",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Seafood - Jeddah Yacht Club",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Al Kurnaysh Br Rd, Ash Shati, Jeddah 23613, Saudi Arabia",
          "latitude": 21.653590599999998,
          "longitude": 39.100822799999996,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJA0DVLJ7ZwxUReUDtc4vhM4c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Seafood%20-%20Jeddah%20Yacht%20Club&query_place_id=ChIJA0DVLJ7ZwxUReUDtc4vhM4c",
          "google_rating": 4.7,
          "google_review_count": 1661,
          "operating_status": "open",
          "hours": "Official site: daily 13:00-01:00; Google listing showed Sunday/Monday 16:00 opening at verification",
          "phone": "+966920028284",
          "geographic_notes": "Located in Ash Shati (Jeddah Yacht Club), canonical district al_shati. Operational note: hours differ slightly between official site and Google listing; branch-specific verified hours retained.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Seafood - La Playa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "La Playa Beach Twina, Prince Abdullah Al Faisal St, North Obhur, Jeddah 23811, Saudi Arabia",
          "latitude": 21.723122,
          "longitude": 39.0804257,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJs1zdlajYwxURIvIOGfps25E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Seafood%20-%20La%20Playa&query_place_id=ChIJs1zdlajYwxURIvIOGfps25E",
          "google_rating": 4.3,
          "google_review_count": 10582,
          "operating_status": "open",
          "hours": "Official site: daily 08:00-02:00",
          "phone": "+966920028284",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "twina_seafood",
          "branch_name_en": "Twina Park - Dahban",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Twina Park, 9659 Dahaban Road, Dahaban, Jeddah, Saudi Arabia",
          "latitude": 21.9210849,
          "longitude": 39.1218649,
          "maps_business_name": "Twina Seafood",
          "google_place_id": "ChIJqyjaOVBuwRURtKeTPkFWINY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Twina%20Park%20-%20Dahban&query_place_id=ChIJqyjaOVBuwRURtKeTPkFWINY",
          "google_rating": 4.5,
          "google_review_count": 18573,
          "operating_status": "open",
          "hours": "Official site: daily 13:00-01:00",
          "phone": "+966122138737",
          "geographic_notes": "Located in Dahban district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Grilled Najil & Hamour",
          "name_ar": "ناجل وهامور مشوي على الفحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Sayadiyah Rice",
          "name_ar": "أرز صيادية توينا الفاخر",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Jumbo Grilled Prawns",
          "name_ar": "جمبري جامبو مشوي",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "shrimp_anatomy",
      "canonical_name": "Shrimp Anatomy",
      "arabic_name": "شرمب أناتومي",
      "categories": [
        "seafood",
        "shrimp",
        "seafood_boil"
      ],
      "primary_category": "seafood",
      "secondary_categories": [
        "shrimp",
        "seafood_boil"
      ],
      "subcategories": [
        "shrimp",
        "seafood_boil"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Shrimp Mode",
      "signature_dish_en": "Shrimp Mode",
      "vibe_tags_ar": [
        "أكياس شرمب بنكهات مميزة",
        "سيفود بول عصري",
        "سهرات وجلسات شبابية",
        "شرمب مود وديناميت"
      ],
      "vibe_tags_en": [
        "Signature Seafood Boil Bags",
        "Trendy Fast Casual",
        "Late Night Vibes",
        "Shrimp Mode & Dynamite"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "casual_hangout",
        "late_night"
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
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "al_khalidiyyah",
        "al_basateen",
        "al_faiha",
        "al_marwah",
        "abhur_al_janoubiyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://shrimpanatomysa.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "Sari Br Rd, Al Khalidiyah District, Jeddah 23445, Saudi Arabia",
          "latitude": 21.5732948,
          "longitude": 39.139755199999996,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJp8irY5bawxURdfapLcJMIJI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Sari&query_place_id=ChIJp8irY5bawxURdfapLcJMIJI",
          "google_rating": 4.3,
          "google_review_count": 11584,
          "operating_status": "open",
          "hours": "Sun 12:00-00:00; Mon-Thu/Sat 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966550900379",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Club House",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_basateen",
          "address_en": "King Abdul Aziz Rd, Al Basateen, Jeddah 23718, Saudi Arabia",
          "latitude": 21.689407,
          "longitude": 39.110291499999995,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJl_7PO_LZwxUR2pCgK9u_-dk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Club%20House&query_place_id=ChIJl_7PO_LZwxUR2pCgK9u_-dk",
          "google_rating": 4.7,
          "google_review_count": 128,
          "operating_status": "open",
          "hours": "Daily 13:00-03:00",
          "phone": "+966551780416",
          "geographic_notes": "Located in canonical district al_basateen.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Al Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Prince Majid Rd, Al Fayha, Jeddah 22245, Saudi Arabia",
          "latitude": 21.506562499999998,
          "longitude": 39.219812499999996,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJh_2lNADPwxURLeg8g7tayO4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Al%20Fayha&query_place_id=ChIJh_2lNADPwxURLeg8g7tayO4",
          "google_rating": 4.5,
          "google_review_count": 1342,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966559349654",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Al Nahda",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Prince Sultan Rd, An Nahdah, Jeddah 23615, Saudi Arabia",
          "latitude": 21.631736099999998,
          "longitude": 39.1332954,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJKT5eAADbwxURAUWXiV5IHFM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Al%20Nahda&query_place_id=ChIJKT5eAADbwxURAUWXiV5IHFM",
          "google_rating": 4.8,
          "google_review_count": 2773,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966554795615",
          "geographic_notes": "Located in Al Nahdah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "6540 Al Shikh Abdullaziz Bin Baz, Al Marwah, Jeddah 23543, Saudi Arabia",
          "latitude": 21.604832599999998,
          "longitude": 39.2080566,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJqQt5YQDRwxUR-k6ySN2lRLs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Al%20Marwah&query_place_id=ChIJqQt5YQDRwxUR-k6ySN2lRLs",
          "google_rating": 4.5,
          "google_review_count": 354,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966554737328",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_anatomy",
          "branch_name_en": "Shrimp Anatomy - Marina",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_janoubiyah",
          "address_en": "King Abdul Aziz Rd, Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
          "latitude": 21.7652914,
          "longitude": 39.1420203,
          "maps_business_name": "Shrimp Anatomy",
          "google_place_id": "ChIJF5YZIXZjwRUR0zrPNIP4F-I",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Anatomy%20-%20Marina&query_place_id=ChIJF5YZIXZjwRUR0zrPNIP4F-I",
          "google_rating": 4.6,
          "google_review_count": 2233,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:00-02:00; Fri 13:00-02:00",
          "phone": "+966554404901",
          "geographic_notes": "Located in canonical district abhur_al_janoubiyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Shrimp Mode",
          "name_ar": "Shrimp Mode",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Dynamite Shrimp",
          "name_ar": "Dynamite Shrimp",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "The Giant Mix",
          "name_ar": "The Giant Mix",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "shrimp_zone",
      "canonical_name": "Shrimp Zone",
      "arabic_name": "منطقة الجمبري",
      "categories": [
        "seafood",
        "shrimp",
        "seafood_boil",
        "fast_casual"
      ],
      "primary_category": "seafood",
      "secondary_categories": [
        "shrimp",
        "seafood_boil",
        "fast_casual"
      ],
      "subcategories": [
        "shrimp",
        "seafood_boil",
        "fast_casual"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Grilled Shrimp",
      "signature_dish_en": "Grilled Shrimp",
      "vibe_tags_ar": [
        "أشهر أكياس شرمب بجدة",
        "خلطات ونكهات قوية",
        "سريع وسفري وتوصيل قوي",
        "جمبري مشوي ومقلي"
      ],
      "vibe_tags_en": [
        "Iconic Seafood Boil",
        "Bold Signature Seasonings",
        "Delivery & Quick Bite Strong",
        "Grilled & Fried Shrimp"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "quick_bite",
        "casual_hangout",
        "late_night"
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
      "verified_jeddah_branch_count": 10,
      "canonical_districts": [
        "al_rawdah",
        "al_shati",
        "al_mohammadiyyah",
        "abhur_al_shamaliyah",
        "al_marwah",
        "al_hamdaniyah",
        "an_nuzhah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://shrimp.zone/locations",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Sariah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Sariah Branch, Al-Baghdadiyah Al-Gharbiyah, Jeddah 22234, Saudi Arabia",
          "latitude": 21.5097344,
          "longitude": 39.1784319,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJ91biMuTPwxURGxFMqcb8q_I",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Sariah&query_place_id=ChIJ91biMuTPwxURGxFMqcb8q_I",
          "google_rating": 4.5,
          "google_review_count": 4063,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966533357134",
          "geographic_notes": "Located in Al Baghdadiyah Al Gharbiyah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "2709 Sari Br Rd, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.576169,
          "longitude": 39.1492709,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJGfSt5-_bwxUR4lfoUAUAzOc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Sari&query_place_id=ChIJGfSt5-_bwxUR4lfoUAUAzOc",
          "google_rating": 4.4,
          "google_review_count": 15124,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966544500445",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Red Sea Mall, King Abdul Aziz Rd, Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.629089399999998,
          "longitude": 39.111430899999995,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJRSPOJ0LbwxURDUO1OgwD-9c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Red%20Sea%20Mall&query_place_id=ChIJRSPOJ0LbwxURDUO1OgwD-9c",
          "google_rating": 4.9,
          "google_review_count": 3495,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-00:00; Thu 12:00-01:00; Fri 13:00-01:00",
          "phone": "+966536663416",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Aya Mall",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Aya Mall, Prince Sultan Rd, Al Muhammadiyah, Jeddah, Saudi Arabia",
          "latitude": 21.6617793,
          "longitude": 39.120745,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJv5yf4RjawxUR2JDPIcsjc2s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Aya%20Mall&query_place_id=ChIJv5yf4RjawxUR2JDPIcsjc2s",
          "google_rating": 4.3,
          "google_review_count": 8608,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966556623552",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah Al Faisal Branch, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.7534402,
          "longitude": 39.1185439,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJ209VejRjwRUR9kUA6MqbJi4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Obhur&query_place_id=ChIJ209VejRjwRUR9kUA6MqbJi4",
          "google_rating": 4.5,
          "google_review_count": 3260,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966535530991",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23545, Saudi Arabia",
          "latitude": 21.6243873,
          "longitude": 39.2102539,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJlcTohGjXwxUR1Iq86EIgw2E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Al%20Marwah&query_place_id=ChIJlcTohGjXwxUR1Iq86EIgw2E",
          "google_rating": 4.5,
          "google_review_count": 4230,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966536663169",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Al Jamea Plaza",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Jamea Mall Branch, Al Jami'ah, Jeddah 22338, Saudi Arabia",
          "latitude": 21.4834304,
          "longitude": 39.2420389,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJBfQFrv_NwxURYcgPe239hVE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Al%20Jamea%20Plaza&query_place_id=ChIJBfQFrv_NwxURYcgPe239hVE",
          "google_rating": 4.7,
          "google_review_count": 2754,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966530066557",
          "geographic_notes": "Located in Al Jami'ah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Hamdaniya",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Hamdaniya Branch, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7494919,
          "longitude": 39.1885189,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJ4_yajD59wRURL4cVKVPEeKM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Hamdaniya&query_place_id=ChIJ4_yajD59wRURL4cVKVPEeKM",
          "google_rating": 4.6,
          "google_review_count": 1743,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 13:00-03:00",
          "phone": "+966535454053",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, Al-Madinah Al-Munawarah Rd, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6320305,
          "longitude": 39.1549244,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJI6eRa6nXwxURp-8DscIODCw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Mall%20of%20Arabia&query_place_id=ChIJI6eRa6nXwxURp-8DscIODCw",
          "google_rating": 4.6,
          "google_review_count": 986,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-00:00; Thu 12:00-01:00; Fri 14:00-01:00",
          "phone": "+966573590961",
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_zone",
          "branch_name_en": "Shrimp Zone - Al Waha Boulevard",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "3370 8553 Al Samer, Al Waha Branch, Jeddah 23354, Saudi Arabia",
          "latitude": 21.56289,
          "longitude": 39.2448384,
          "maps_business_name": "Shrimp Zone",
          "google_place_id": "ChIJy2vUJgDTwxURusYlr7yGv80",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Zone%20-%20Al%20Waha%20Boulevard&query_place_id=ChIJy2vUJgDTwxURusYlr7yGv80",
          "google_rating": 4.5,
          "google_review_count": 1065,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-02:00; Thu 12:00-03:00; Fri 12:00-03:00",
          "phone": "+966533391089",
          "geographic_notes": "Located in Al Waha district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Grilled Shrimp",
          "name_ar": "Grilled Shrimp",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Dynamite Shrimp",
          "name_ar": "Dynamite Shrimp",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Shrimp bags / Mix & Match",
          "name_ar": "Shrimp bags / Mix & Match",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "shrimp_nation",
      "canonical_name": "Shrimp Nation",
      "arabic_name": "شرمب نيشن",
      "categories": [
        "seafood",
        "shrimp",
        "seafood_boil"
      ],
      "primary_category": "seafood",
      "secondary_categories": [
        "shrimp",
        "seafood_boil"
      ],
      "subcategories": [
        "shrimp",
        "seafood_boil"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Shrimp",
      "signature_dish_en": "Shrimp",
      "vibe_tags_ar": [
        "سلسلة شرمب نيشن الشهيرة",
        "أكياس بحرية وسرطان وكابوريا",
        "سهرات وجلسات كاجوال",
        "فروع متعددة بجدة"
      ],
      "vibe_tags_en": [
        "Famous Seafood Boil Chain",
        "Crab, Lobster & Mussels",
        "Late Night Casual Hangout",
        "Wide Jeddah Coverage"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "casual_hangout",
        "late_night"
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
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "al_salamah",
        "al_murjan",
        "al_naseem",
        "abhur_al_shamaliyah",
        "al_marwah",
        "al_hamdaniyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://shrimpnation.com/sa-en/branches/jeddah/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - Al Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Prince Sultan Rd, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.583823499999998,
          "longitude": 39.144019899999996,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJN9P9upDbwxUR00HYFnn1pHA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20Al%20Salamah&query_place_id=ChIJN9P9upDbwxUR00HYFnn1pHA",
          "google_rating": 4.2,
          "google_review_count": 8926,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966562098999",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "P452+2W3, 7862 Alkurnaysh Road, Al Murjan District, Jeddah 23712, Saudi Arabia",
          "latitude": 21.707511999999998,
          "longitude": 39.1022623,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJIwM_HnLZwxURXYXgBW1euqE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20Al%20Murjan&query_place_id=ChIJIwM_HnLZwxURXYXgBW1euqE",
          "google_rating": 4.3,
          "google_review_count": 1817,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966546039991",
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "King Abdallah Rd, An Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.5110982,
          "longitude": 39.2319414,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJFXlaJLPPwxURYbqNhzVt8ug",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20An%20Naseem&query_place_id=ChIJFXlaJLPPwxURYbqNhzVt8ug",
          "google_rating": 4.2,
          "google_review_count": 805,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966550642999",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah Al Faisal, Obhur Al-Shamaliyah, Jeddah 23817, Saudi Arabia",
          "latitude": 21.7655179,
          "longitude": 39.1286659,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJCR3g_eBjwRURsyF9amjh3y4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20Obhur%20Al%20Shamaliyah&query_place_id=ChIJCR3g_eBjwRURsyF9amjh3y4",
          "google_rating": 4.5,
          "google_review_count": 1141,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966546059991",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Al Marwah, Jeddah 23345, Saudi Arabia",
          "latitude": 21.6051723,
          "longitude": 39.209642699999996,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJAVa15jrRwxURQiRfaaqCzVM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20Al%20Marwah&query_place_id=ChIJAVa15jrRwxURQiRfaaqCzVM",
          "google_rating": 4.8,
          "google_review_count": 1614,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966559768899",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shrimp_nation",
          "branch_name_en": "Shrimp Nation - Al Hamdaniya",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.755492,
          "longitude": 39.1975619,
          "maps_business_name": "Shrimp Nation",
          "google_place_id": "ChIJQ4TTurl9wRURh_Qsd65w_is",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Shrimp%20Nation%20-%20Al%20Hamdaniya&query_place_id=ChIJQ4TTurl9wRURh_Qsd65w_is",
          "google_rating": 4.5,
          "google_review_count": 107,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Sat 12:00-03:00",
          "phone": "+966558204999",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Shrimp",
          "name_ar": "Shrimp",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Crab",
          "name_ar": "Crab",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Lobster",
          "name_ar": "Lobster",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Mussels",
          "name_ar": "Mussels",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "Fish Sticks",
          "name_ar": "Fish Sticks",
          "is_signature": false,
          "sort_order": 4
        },
        {
          "name_en": "Calamari Basket",
          "name_ar": "Calamari Basket",
          "is_signature": false,
          "sort_order": 5
        },
        {
          "name_en": "Dynamite Shrimp",
          "name_ar": "Dynamite Shrimp",
          "is_signature": false,
          "sort_order": 6
        }
      ]
    },
    {
      "brand_id": "alqalzam_seafood_restaurant",
      "canonical_name": "AlQalzam Seafood Restaurant",
      "arabic_name": "القلزم",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "ناجل بلدي مشوي عالفحم",
      "signature_dish_en": "Charcoal Grilled Najil",
      "vibe_tags_ar": [
        "منتجع القلزم البحري",
        "عراقة المأكولات البحرية الحجازية",
        "جلسات عائلية خاصة وكبائن",
        "أسماك طازجة وطواجن"
      ],
      "vibe_tags_en": [
        "AlQalzam Seafood Resort",
        "Hijazi Seafood Tradition",
        "Private Family Cabins",
        "Fresh Fish & Tagines"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://linktr.ee/alqalzam",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "alqalzam_seafood_restaurant",
          "branch_name_en": "AlQalzam - Al Waha / Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Samer, Al Waha, Jeddah 23354, Saudi Arabia",
          "latitude": 21.5638442,
          "longitude": 39.2437058,
          "maps_business_name": "AlQalzam Seafood Restaurant",
          "google_place_id": "ChIJDyFOkvrTwxURPFj97wwmQE8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlQalzam%20-%20Al%20Waha%20%2F%20Al%20Samer&query_place_id=ChIJDyFOkvrTwxURPFj97wwmQE8",
          "google_rating": 4.8,
          "google_review_count": 187,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-01:00; Thu-Fri 13:00-02:00",
          "phone": "+966920001515",
          "geographic_notes": "Located in Al Waha district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "alqalzam_seafood_restaurant",
          "branch_name_en": "AlQalzam - Al Qarat",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Aabir Al Qarath St, Al Qarat, Jeddah 23817, Saudi Arabia",
          "latitude": 21.7609893,
          "longitude": 39.1173121,
          "maps_business_name": "AlQalzam Seafood Restaurant",
          "google_place_id": "ChIJFV1vTgFjwRURrXEd8GN8094",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlQalzam%20-%20Al%20Qarat&query_place_id=ChIJFV1vTgFjwRURrXEd8GN8094",
          "google_rating": 4.5,
          "google_review_count": 1847,
          "operating_status": "open",
          "hours": "Sun-Tue/Sat 13:00-01:00; Wed-Fri 13:00-02:00",
          "phone": "+966920001515",
          "geographic_notes": "Located in Al Qarat district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "alqalzam_seafood_restaurant",
          "branch_name_en": "AlQalzam Seafood Resort",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al-Madinah Al-Munawarah Rd, Al Riyadh, Jeddah 23872, Saudi Arabia",
          "latitude": 21.8830845,
          "longitude": 39.1262949,
          "maps_business_name": "AlQalzam Seafood Restaurant",
          "google_place_id": "ChIJn9hOrr1jwRURqU92wWYUmpA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlQalzam%20Seafood%20Resort&query_place_id=ChIJn9hOrr1jwRURqU92wWYUmpA",
          "google_rating": 4.4,
          "google_review_count": 12519,
          "operating_status": "open",
          "hours": "Sun-Tue/Sat 13:00-01:00; Wed-Fri 13:00-02:00",
          "phone": "+966920001515",
          "geographic_notes": "Located in Al Riyadh district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "alqalzam_seafood_restaurant",
          "branch_name_en": "AlQalzam - Al Nahda",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "6790 Prince Sultan Rd, Al Nahdah, Jeddah 23615, Saudi Arabia",
          "latitude": 21.6221981,
          "longitude": 39.1370248,
          "maps_business_name": "AlQalzam Seafood Restaurant",
          "google_place_id": "ChIJXVmPEWJjwRURB54HXE1tezY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlQalzam%20-%20Al%20Nahda&query_place_id=ChIJXVmPEWJjwRURB54HXE1tezY",
          "google_rating": 4,
          "google_review_count": 6128,
          "operating_status": "open",
          "hours": "Sun-Tue/Sat 12:30-01:00; Wed-Fri approx 13:00-02:00",
          "phone": "+966920001515",
          "geographic_notes": "Located in Al Nahdah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Charcoal Grilled Najil",
          "name_ar": "ناجل بلدي مشوي عالفحم",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "AlQalzam Seafood Tagine",
          "name_ar": "طاجن القلزم المشكل",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Fried Jumbo Shrimp",
          "name_ar": "جمبري جامبو مقلي مقرمش",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "amohamza",
      "canonical_name": "AmoHamza",
      "arabic_name": "عمو حمزة",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Grilled fish fillet",
      "signature_dish_en": "Grilled fish fillet",
      "vibe_tags_ar": [
        "عمو حمزة الشهير",
        "عروض وجبات سمك عائلية",
        "سمك بلطي وفيليه مقلي ومشوي",
        "توصيل سريع واقتصادي"
      ],
      "vibe_tags_en": [
        "Classic AmoHamza",
        "Value Seafood Meals",
        "Grilled & Fried Tilapia / Fillet",
        "Family Delivery Favorite"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.amohamza.com.sa/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "amohamza",
          "branch_name_en": "AmoHamza - Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "2206 Prince Majid Rd, Al Safa, Jeddah 23451, Saudi Arabia",
          "latitude": 21.572456,
          "longitude": 39.200517,
          "maps_business_name": "AmoHamza",
          "google_place_id": "ChIJ9T-zPKrRwxURZH93Phq1bsQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AmoHamza%20-%20Al%20Safa&query_place_id=ChIJ9T-zPKrRwxURZH93Phq1bsQ",
          "google_rating": 3.6,
          "google_review_count": 4438,
          "operating_status": "open",
          "hours": "Daily 12:00-00:30",
          "phone": "+966920000639",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Grilled fish fillet",
          "name_ar": "Grilled fish fillet",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Tilapia with rice",
          "name_ar": "Tilapia with rice",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mixed seafood offers",
          "name_ar": "Mixed seafood offers",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "hook",
      "canonical_name": "Hook",
      "arabic_name": "هوك",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Shrimp",
      "signature_dish_en": "Shrimp",
      "vibe_tags_ar": [
        "مطعم هوك للأكلات البحرية",
        "أكياس جمبري واستاكوزا ومحار",
        "أجواء عصرية شبابية",
        "جلسات الزهراء والفيحاء"
      ],
      "vibe_tags_en": [
        "Hook Seafood Dining",
        "Shrimp, Lobster & Oyster Bags",
        "Modern Casual Atmosphere",
        "Al Zahra & Al Fayha Spots"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "casual_hangout",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_zahra",
        "al_faiha"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "hook",
          "branch_name_en": "Hook - Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Prince Sultan Rd, Al Zahra, Jeddah 23425, Saudi Arabia",
          "latitude": 21.5885534,
          "longitude": 39.1436189,
          "maps_business_name": "Hook",
          "google_place_id": "ChIJ-SqFc5zbwxURGn8crycynOg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Hook%20-%20Al%20Zahra&query_place_id=ChIJ-SqFc5zbwxURGn8crycynOg",
          "google_rating": 4.2,
          "google_review_count": 3260,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-01:00; Thu-Fri 13:00-02:00",
          "phone": "+966126344440",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "hook",
          "branch_name_en": "Hook - Al Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Abdullah Sulayman St, Al Fayha, Jeddah 22246, Saudi Arabia",
          "latitude": 21.4964859,
          "longitude": 39.218767899999996,
          "maps_business_name": "Hook",
          "google_place_id": "ChIJjQqGvSbPwxUR5JhqKtWP3Hc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Hook%20-%20Al%20Fayha&query_place_id=ChIJjQqGvSbPwxUR5JhqKtWP3Hc",
          "google_rating": 4.5,
          "google_review_count": 2026,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-01:00; Thu-Fri 13:00-02:00",
          "phone": "+966122888003",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Shrimp",
          "name_ar": "Shrimp",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lobster",
          "name_ar": "Lobster",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mix seafood",
          "name_ar": "Mix seafood",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Oyster",
          "name_ar": "Oyster",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "Crab",
          "name_ar": "Crab",
          "is_signature": false,
          "sort_order": 4
        }
      ]
    },
    {
      "brand_id": "operation_seafood",
      "canonical_name": "Operation Seafood",
      "arabic_name": "أوبريشن سي فود",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Fresh fish",
      "signature_dish_en": "Fresh fish",
      "vibe_tags_ar": [
        "أوبريشن سي فود الزهراء وأبحر",
        "طواجن بحرية ونكهات تايلندية",
        "أسماك طازجة وأكياس جمبري",
        "سهرات وجلسات حيوية"
      ],
      "vibe_tags_en": [
        "Operation Seafood",
        "Thai Seafood & Tagines",
        "Fresh Catch & Shrimp Bags",
        "Lively Dine-In & Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_zahra",
        "abhur_al_janoubiyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "operation_seafood",
          "branch_name_en": "Operation Seafood - Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Helmi Koutbi, Al Zahra, Jeddah 23521, Saudi Arabia",
          "latitude": 21.5913055,
          "longitude": 39.136612899999996,
          "maps_business_name": "Operation Seafood",
          "google_place_id": "ChIJ5bY08BTbwxURpbuUmbEan0s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Operation%20Seafood%20-%20Al%20Zahra&query_place_id=ChIJ5bY08BTbwxURpbuUmbEan0s",
          "google_rating": 4.5,
          "google_review_count": 3211,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 13:00-01:00; Fri 13:00-02:00",
          "phone": "+966565864626",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "operation_seafood",
          "branch_name_en": "Operation Seafood - Abhur Al Junoobiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_janoubiyah",
          "address_en": "King Abdul Aziz Rd, Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
          "latitude": 21.764929499999997,
          "longitude": 39.141728799999996,
          "maps_business_name": "Operation Seafood",
          "google_place_id": "ChIJWbH2OKtjwRURTFl81UOsag0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Operation%20Seafood%20-%20Abhur%20Al%20Junoobiyah&query_place_id=ChIJWbH2OKtjwRURTFl81UOsag0",
          "google_rating": 4.6,
          "google_review_count": 1065,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-01:00; Thu-Fri 13:00-02:00",
          "phone": "+966509929913",
          "geographic_notes": "Located in canonical district abhur_al_janoubiyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Fresh fish",
          "name_ar": "Fresh fish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Shrimp bags",
          "name_ar": "Shrimp bags",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Thai seafood dishes",
          "name_ar": "Thai seafood dishes",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Seafood tagines",
          "name_ar": "Seafood tagines",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "alaaly_seafood_restaurant",
      "canonical_name": "Alaaly Seafood Restaurant",
      "arabic_name": "العالي",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Grilled fish",
      "signature_dish_en": "Grilled fish",
      "vibe_tags_ar": [
        "مطعم العالي للمأكولات البحرية",
        "صواني وطواجن بحرية مشكلة",
        "حي الروضة عبدالمقصود خوجه",
        "سمك مقلي ومشوي طازج"
      ],
      "vibe_tags_en": [
        "Alaaly Seafood",
        "Generous Seafood Trays",
        "Ar Rawdah Landmark",
        "Fresh Grilled & Fried Fish"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "delivery_strong",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "alaaly_seafood_restaurant",
          "branch_name_en": "Alaaly Seafood Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "8683 2623 Abdul Maqsud Khojah, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5724479,
          "longitude": 39.1486552,
          "maps_business_name": "Alaaly Seafood Restaurant",
          "google_place_id": "ChIJdyf4iTzbwxURtcoLBOJTP4k",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Alaaly%20Seafood%20Restaurant&query_place_id=ChIJdyf4iTzbwxURtcoLBOJTP4k",
          "google_rating": 4.8,
          "google_review_count": 14432,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-00:30; Thu-Fri 13:00-01:30",
          "phone": "+966507873166",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Grilled fish",
          "name_ar": "Grilled fish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Fried fish",
          "name_ar": "Fried fish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Seafood trays",
          "name_ar": "Seafood trays",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Tajines",
          "name_ar": "Tajines",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "albasali_seafood_restaurant",
      "canonical_name": "Albasali Seafood Restaurant",
      "arabic_name": "البصلي",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "سمك حريد مقلي مقرمش مع أرز الصيادية",
      "signature_dish_en": "Crispy Fried Harid with Sayadiyah",
      "vibe_tags_ar": [
        "أقدم وأعرق مطعم سمك بجدة",
        "تاريخ باب مكة والبلد من 1950",
        "سمك حري مقلي وصيادية أصلية",
        "تراث جدة الأصيل"
      ],
      "vibe_tags_en": [
        "Historic Jeddah Oldest Fish Spot",
        "Bab Makkah Heritage Since 1950",
        "Authentic Harid & Sayadiyah",
        "True Hijazi Legacy"
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
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_balad"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.visitsaudi.com/en/jeddah/attractions/al-basli-resturant",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "albasali_seafood_restaurant",
          "branch_name_en": "Albasali Seafood Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_balad",
          "address_en": "Behind Al Falah Schools, Suq Bab Makkah, Historic Jeddah, Jeddah 22236, Saudi Arabia",
          "latitude": 21.4860808,
          "longitude": 39.1902538,
          "maps_business_name": "Albasali Seafood Restaurant",
          "google_place_id": "ChIJD73pfivPwxUROdee-Zl5GxM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Albasali%20Seafood%20Restaurant&query_place_id=ChIJD73pfivPwxUROdee-Zl5GxM",
          "google_rating": 4.6,
          "google_review_count": 10684,
          "operating_status": "open",
          "hours": "Sun-Wed 13:00-23:30; Thu 13:00-23:00/23:30; Fri-Sat 13:00-23:00",
          "phone": "+966504301163",
          "geographic_notes": "Located in Historic Jeddah (Bab Makkah / Al Balad), canonical district al_balad.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Crispy Fried Harid with Sayadiyah",
          "name_ar": "سمك حريد مقلي مقرمش مع أرز الصيادية",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Traditional Bab Makkah Shrimp",
          "name_ar": "جمبري مقلي بلدي بنكهة باب مكة",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Red Sea Fish Soup",
          "name_ar": "شوربة سمك بحرية تقليدية",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "saedi_fish_restaurant",
      "canonical_name": "Saedi Fish Restaurant",
      "arabic_name": "الصعيدي",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "هامور بلدي مشوي طازج بالوزن",
      "signature_dish_en": "Grilled Hamour by Weight",
      "vibe_tags_ar": [
        "مطعم الصعيدي للأسماك الطازجة",
        "عراقة كورنيش الحمراء وحراء",
        "سمك طازج يختار بالوزن",
        "سهرات حتى الفجر"
      ],
      "vibe_tags_en": [
        "Al Saedi Fresh Fish",
        "Corniche Al Hamra & Hira Tradition",
        "Fresh Catch Chosen by Weight",
        "Open Late Until 2am"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_hamra",
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "saedi_fish_restaurant",
          "branch_name_en": "Saedi Fish Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "2128 Al Kurnaysh Br Rd, Al-Hamra'a, Jeddah 23212, Saudi Arabia",
          "latitude": 21.517930399999997,
          "longitude": 39.1536494,
          "maps_business_name": "Saedi Fish Restaurant",
          "google_place_id": "ChIJjc2BsGLFwxUR8OctnGtwyr8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Saedi%20Fish%20Restaurant&query_place_id=ChIJjc2BsGLFwxUR8OctnGtwyr8",
          "google_rating": 3.8,
          "google_review_count": 10601,
          "operating_status": "open",
          "hours": "Daily 13:00-02:00",
          "phone": "+966555036346",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "saedi_fish_restaurant",
          "branch_name_en": "Saedi Fish Restaurant - Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "7751 Hira St, 2395, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.6062333,
          "longitude": 39.121789899999996,
          "maps_business_name": "Saedi Fish Restaurant",
          "google_place_id": "ChIJaXH5QBTbwxUR2dANnaQer4E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Saedi%20Fish%20Restaurant%20-%20Hira&query_place_id=ChIJaXH5QBTbwxUR2dANnaQer4E",
          "google_rating": 4.3,
          "google_review_count": 2744,
          "operating_status": "open",
          "hours": "Daily 12:00-02:00",
          "phone": "+966561198959",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "saedi_fish_restaurant",
          "branch_name_en": "Saedi Fish Restaurant - Al Baghdadiyah Al Gharbiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Near Madinah Palace Hotel, Al Baghdadiyah Al Gharbiyah, Jeddah 22231, Saudi Arabia",
          "latitude": 21.495661899999998,
          "longitude": 39.1734791,
          "maps_business_name": "Saedi Fish Restaurant",
          "google_place_id": "ChIJ205ghQzPwxURgBn-5MzU31g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Saedi%20Fish%20Restaurant%20-%20Al%20Baghdadiyah%20Al%20Gharbiyah&query_place_id=ChIJ205ghQzPwxURgBn-5MzU31g",
          "google_rating": 3.9,
          "google_review_count": 4109,
          "operating_status": "open",
          "hours": "Daily 13:00-02:00",
          "phone": "+966550775333",
          "geographic_notes": "Located in Al Baghdadiyah Al Gharbiyah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Grilled Hamour by Weight",
          "name_ar": "هامور بلدي مشوي طازج بالوزن",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Fried Calamari & Shrimp",
          "name_ar": "حبار وجمبري مقلي مقرمش",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Saedi Sayadiyah Rice",
          "name_ar": "أرز صيادية الصعيدي الشهير",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "baeshen_seafood",
      "canonical_name": "Ba’eshen Seafood",
      "arabic_name": "باعشن",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "سمك شعور مقلي مع الأرز الحجازي",
      "signature_dish_en": "Fried Shaour with Traditional Rice",
      "vibe_tags_ar": [
        "مطعم باعشن التاريخي",
        "تراث سوق باب مكة والبلد",
        "سمك طازج على الطريقة التقليدية",
        "أسعار شعبية وجودة عالية"
      ],
      "vibe_tags_en": [
        "Baeshen Historic Seafood",
        "Bab Makkah Heritage Flavor",
        "Traditional Hijazi Preparation",
        "Authentic Value & Quality"
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
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_balad"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.waze.com/live-map/directions/sa/makkah-province/jeddah/baeshen-seafood?to=place.ChIJgzFNWBDPwxUR8RJvjjybMKI",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "baeshen_seafood",
          "branch_name_en": "Ba’eshen Seafood",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_balad",
          "address_en": "F5PM+RJ, Historic Jeddah, Jeddah 22233, Saudi Arabia",
          "latitude": 21.487078399999998,
          "longitude": 39.1840589,
          "maps_business_name": "Ba’eshen Seafood",
          "google_place_id": "ChIJgzFNWBDPwxUR8RJvjjybMKI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Ba%E2%80%99eshen%20Seafood&query_place_id=ChIJgzFNWBDPwxUR8RJvjjybMKI",
          "google_rating": 4.3,
          "google_review_count": 6428,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:15-23:00; Fri 13:00-23:00",
          "phone": "+966503674710",
          "geographic_notes": "Located in Historic Jeddah (Bab Makkah / Al Balad), canonical district al_balad.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Fried Shaour with Traditional Rice",
          "name_ar": "سمك شعور مقلي مع الأرز الحجازي",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Baeshen Spiced Fresh Shrimp",
          "name_ar": "جمبري بلدي متبل بخلطة باعشن",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Traditional Fish Soup",
          "name_ar": "مرقة سمك حجازية أصيلة",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "asmak_tharaa",
      "canonical_name": "Asmak Tharaa",
      "arabic_name": "أسماك ثراء",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "Tipsy Bahri",
      "signature_dish_en": "Tipsy Bahri",
      "vibe_tags_ar": [
        "أسماك ثراء طريق الأمير سلطان",
        "أطباق بحرية مبتكرة وتبسي بحري",
        "صيادية وطواجن ومقليات فاخرة",
        "جلسات راقية وتوصيل"
      ],
      "vibe_tags_en": [
        "Asmak Tharaa Prince Sultan",
        "Gourmet Tipsy Bahri Platters",
        "Upscale Seafood & Sayadiyah",
        "Premium Ambience & Delivery"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naeem"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://asmaktharaa.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "asmak_tharaa",
          "branch_name_en": "Asmak Tharaa - Al Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Prince Sultan Street, Al Naeem, Jeddah 23526, Saudi Arabia",
          "latitude": 21.617214,
          "longitude": 39.1391329,
          "maps_business_name": "Asmak Tharaa",
          "google_place_id": "ChIJrzBO3HnbwxURyMAm9Wh_fmo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Asmak%20Tharaa%20-%20Al%20Naeem&query_place_id=ChIJrzBO3HnbwxURyMAm9Wh_fmo",
          "google_rating": 4,
          "google_review_count": 6896,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-00:30; Thu-Fri 13:00-01:30",
          "phone": "+966920035050",
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tipsy Bahri",
          "name_ar": "Tipsy Bahri",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Grilled shrimp",
          "name_ar": "Grilled shrimp",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Grilled Red Sea fish",
          "name_ar": "Grilled Red Sea fish",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Sayadiyah-related dishes",
          "name_ar": "Sayadiyah-related dishes",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "el_marakby_seafood_restaurant",
      "canonical_name": "El Marakby Seafood Restaurant",
      "arabic_name": "المراكبي",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Jumbo grilled shrimp",
      "signature_dish_en": "Jumbo grilled shrimp",
      "vibe_tags_ar": [
        "المراكبي للمأكولات البحرية الإسكندرانية",
        "ممشى سعود الفيصل بالتحلية",
        "جمبري جامبو وطواجن بالصوص الأبيض",
        "سهرات عشاء راقية"
      ],
      "vibe_tags_en": [
        "El Marakby Alexandrian Seafood",
        "Saud Al Faisal Tahlia Walk",
        "Jumbo Shrimp & White Sauce Tagines",
        "Late Night Elegant Dining"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
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
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://elmarakby.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "el_marakby_seafood_restaurant",
          "branch_name_en": "El Marakby Seafood Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Saud Al Faisal Walk, Ar Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.557551099999998,
          "longitude": 39.1714966,
          "maps_business_name": "El Marakby Seafood Restaurant",
          "google_place_id": "ChIJ7-5mQ57RwxURdaZXVEmELOw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=El%20Marakby%20Seafood%20Restaurant&query_place_id=ChIJ7-5mQ57RwxURdaZXVEmELOw",
          "google_rating": 4.7,
          "google_review_count": 5165,
          "operating_status": "open",
          "hours": "Sat-Thu approx 12:30/13:00-01:00; Fri 13:00-01:00/02:00",
          "phone": "+966555291131",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Jumbo grilled shrimp",
          "name_ar": "Jumbo grilled shrimp",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Fresh grilled/fried fish",
          "name_ar": "Fresh grilled/fried fish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Seafood tagines",
          "name_ar": "Seafood tagines",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "portofish_seafood",
      "canonical_name": "Portofish Seafood",
      "arabic_name": "بورتوفيش",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "طبق بورتوفيش البحري المميز",
      "signature_dish_en": "Portofish Signature Seafood Platter",
      "vibe_tags_ar": [
        "بورتوفيش شارع فلسطين بالحمراء",
        "تجربة بحرية راقية وسمك طازج",
        "أطباق مبتكرة وعروض مميزة",
        "سهرات حتى وقت متأخر"
      ],
      "vibe_tags_en": [
        "Portofish Seafood Palestine St",
        "Upscale Fresh Catch Experience",
        "Innovative Platters & Combos",
        "Late Night Until 3am"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
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
        "al_hamra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "portofish_seafood",
          "branch_name_en": "Portofish Seafood",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "Palestine St, Al-Hamra'a, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5222135,
          "longitude": 39.1623387,
          "maps_business_name": "Portofish Seafood",
          "google_place_id": "ChIJvXP34Z_PwxUR9-fNZkLbOwE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Portofish%20Seafood&query_place_id=ChIJvXP34Z_PwxUR9-fNZkLbOwE",
          "google_rating": 4.9,
          "google_review_count": 925,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:30-01:00; Thu 13:00-03:00; Fri 13:00-03:00",
          "phone": "+966556650922",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Portofish Signature Seafood Platter",
          "name_ar": "طبق بورتوفيش البحري المميز",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Grilled Salmon & Hamour",
          "name_ar": "سالمون وهامور مشوي بتتبيلة الأعشاب",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Fried Shrimp & Calamari Basket",
          "name_ar": "سلة جمبري وحبار مقلي مقرمش",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "almurjan_seafood_restaurant",
      "canonical_name": "AlMurjan Seafood Restaurant",
      "arabic_name": "المرجان",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 50,
      "estimated_spend_max_sar": 110,
      "signature_dish_ar": "Salmon Bechamel",
      "signature_dish_en": "Salmon Bechamel",
      "vibe_tags_ar": [
        "مطاعم المرجان للمأكولات البحرية",
        "طريق الملك عبدالله وحي المرجان",
        "باييلا بحرية وسالمون بشاميل ومندي",
        "جلسات عائلية واسعة"
      ],
      "vibe_tags_en": [
        "AlMurjan Seafood Restaurants",
        "King Abdullah Rd & Al Murjan",
        "Paella, Salmon Bechamel & Mandhi",
        "Spacious Family Dining"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_murjan"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://almurjanseafood.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "almurjan_seafood_restaurant",
          "branch_name_en": "AlMurjan Seafood - Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "Next to King Abdullah's Palace, 6481, Al Murjan, Jeddah 23715, Saudi Arabia",
          "latitude": 21.6989976,
          "longitude": 39.1047195,
          "maps_business_name": "AlMurjan Seafood Restaurant",
          "google_place_id": "ChIJFwyfKZHZwxURHlBkclvlJyk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlMurjan%20Seafood%20-%20Al%20Murjan&query_place_id=ChIJFwyfKZHZwxURHlBkclvlJyk",
          "google_rating": 4.4,
          "google_review_count": 1503,
          "operating_status": "open",
          "hours": "Daily 11:00-02:00",
          "phone": "+966502955500",
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "almurjan_seafood_restaurant",
          "branch_name_en": "AlMurjan Seafood - Abruq Ar Rughamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "45 King Abdallah Rd, Abruq Ar Rughamah, Jeddah 22261, Saudi Arabia",
          "latitude": 21.518242,
          "longitude": 39.2677106,
          "maps_business_name": "AlMurjan Seafood Restaurant",
          "google_place_id": "ChIJ37ZdQs3TwxURPAENiZrf7yw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=AlMurjan%20Seafood%20-%20Abruq%20Ar%20Rughamah&query_place_id=ChIJ37ZdQs3TwxURPAENiZrf7yw",
          "google_rating": 4.3,
          "google_review_count": 1476,
          "operating_status": "open",
          "hours": "Daily 11:00-02:00",
          "phone": "+966537922200",
          "geographic_notes": "Located in Abruq Ar Rughamah district, outside the canonical 30-district boundary. Handled under outer-geography caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Salmon Bechamel",
          "name_ar": "Salmon Bechamel",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Squid Meal & Rice",
          "name_ar": "Squid Meal & Rice",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Paella",
          "name_ar": "Paella",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Lobster Cheese Bechamel",
          "name_ar": "Lobster Cheese Bechamel",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "Seafood Mandhi",
          "name_ar": "Seafood Mandhi",
          "is_signature": false,
          "sort_order": 4
        }
      ]
    },
    {
      "brand_id": "almarsah",
      "canonical_name": "Almarsah",
      "arabic_name": "المرسى",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "Fried/grilled fish",
      "signature_dish_en": "Fried/grilled fish",
      "vibe_tags_ar": [
        "مطعم المرسى شارع حراء",
        "وجبات سمك وجمبري سريعة واقتصادية",
        "توصيل قوي وسفري سريع",
        "أرز صيادية وسمك مقلي"
      ],
      "vibe_tags_en": [
        "Almarsah Hira Street",
        "Fast Value Seafood Meals",
        "High Turnover Delivery & Takeaway",
        "Fried Fish & Sayadiyah Rice"
      ],
      "reputation_tags": [
        "local_favorite"
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
        "al_marwah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "almarsah",
          "branch_name_en": "Almarsah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23541, Saudi Arabia",
          "latitude": 21.6206256,
          "longitude": 39.1919597,
          "maps_business_name": "Almarsah",
          "google_place_id": "ChIJu5AP5yvXwxURtV7qWQKI_Co",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Almarsah&query_place_id=ChIJu5AP5yvXwxURtV7qWQKI_Co",
          "google_rating": 4.2,
          "google_review_count": 4939,
          "operating_status": "open",
          "hours": "Daily 10:00-01:00",
          "phone": "+966126556833",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Fried/grilled fish",
          "name_ar": "Fried/grilled fish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Shrimp",
          "name_ar": "Shrimp",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Seafood meal",
          "name_ar": "Seafood meal",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "seagulls_catch",
      "canonical_name": "SeaGulls' Catch",
      "arabic_name": "صيد النورس",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "سمك مقلي طازج مع الأرز والصوص",
      "signature_dish_en": "Fried Fresh Fish with Rice",
      "vibe_tags_ar": [
        "صيد النورس حي الرويس",
        "سمك شعور وحريد مقلي طازج",
        "أطباق ومأكولات بحرية شعبية وسريعة",
        "سهرات وجبات بحرية"
      ],
      "vibe_tags_en": [
        "SeaGulls' Catch Al Ruwais",
        "Fresh Fried Shaour & Harid",
        "Neighborhood Seafood Takeaway",
        "Late Night Quick Bites"
      ],
      "reputation_tags": [
        "local_favorite"
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
        "al_ruwais"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "seagulls_catch",
          "branch_name_en": "SeaGulls' Catch - Al Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "Opp. Al Rajhi Bank, Al Maadi St, Al Ruwais, Jeddah, Saudi Arabia",
          "latitude": 21.516343,
          "longitude": 39.169548,
          "maps_business_name": "SeaGulls' Catch",
          "google_place_id": "ChIJjxTQNpHPwxUR_zCKloAJm8A",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=SeaGulls'%20Catch%20-%20Al%20Ruwais&query_place_id=ChIJjxTQNpHPwxUR_zCKloAJm8A",
          "google_rating": 4,
          "google_review_count": 2332,
          "operating_status": "open",
          "hours": "Daily 12:00-01:00",
          "phone": "+966508025763",
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Fried Fresh Fish with Rice",
          "name_ar": "سمك مقلي طازج مع الأرز والصوص",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Golden Fried Shrimp",
          "name_ar": "جمبري مقلي ذهبي مقرمش",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Seafood Soup",
          "name_ar": "شوربة سي فود بالكريمة",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "blue_ocean_restaurant",
      "canonical_name": "Blue Ocean Restaurant",
      "arabic_name": "بلو أوشن",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 90,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "كراب كيك وطبق المأكولات البحرية",
      "signature_dish_en": "Crab Cake & Seafood Platter",
      "vibe_tags_ar": [
        "بلو أوشن فقيه أكواريوم",
        "أشهر إطلالة بحرية مباشرة على كورنيش جدة",
        "جلسات شاطئية وأجواء مميزة",
        "سلطعون وجمبري وأسماك"
      ],
      "vibe_tags_en": [
        "Blue Ocean at Fakieh Aquarium",
        "Direct Red Sea Panoramic Views",
        "Iconic Waterfront Destination",
        "Crab, Shrimp & Fresh Fish"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "blue_ocean_restaurant",
          "branch_name_en": "Blue Ocean Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Al Kurnaysh Br Rd, Ash Shati, Jeddah 23413, Saudi Arabia",
          "latitude": 21.5722175,
          "longitude": 39.109369,
          "maps_business_name": "Blue Ocean Restaurant",
          "google_place_id": "ChIJhRT6XCbbwxURG-1vrUB6bXU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Blue%20Ocean%20Restaurant&query_place_id=ChIJhRT6XCbbwxURG-1vrUB6bXU",
          "google_rating": 4.2,
          "google_review_count": 19317,
          "operating_status": "open",
          "hours": "Daily 07:00-01:00",
          "phone": "+966533056605",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Crab Cake & Seafood Platter",
          "name_ar": "كراب كيك وطبق المأكولات البحرية",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Grilled Lobster Tail",
          "name_ar": "ذيل استاكوزا مشوي بالزبدة",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Crispy Coconut Shrimp",
          "name_ar": "جمبري جوز الهند المقرمش",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "al_daraj_seafood_restaurant",
      "canonical_name": "Al-Daraj Seafood Restaurant",
      "arabic_name": "الدرج",
      "categories": [
        "seafood"
      ],
      "primary_category": "seafood",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "سمك بحري مقلي على الطريقة التاريخية",
      "signature_dish_en": "Authentic Fried Red Sea Fish",
      "vibe_tags_ar": [
        "مطعم الدرج التاريخي",
        "طريق مكة القديم حارة المظلوم بالبلد",
        "سمك طازج مقلي ومشوي على الأصول",
        "جوهرة بحرية مخفية"
      ],
      "vibe_tags_en": [
        "Al-Daraj Historic Seafood",
        "Old Mecca Road Al Balad",
        "Authentic Traditional Fried & Grilled Fish",
        "Old Town Hidden Gem"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "dine_in_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_balad"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "al_daraj_seafood_restaurant",
          "branch_name_en": "Al-Daraj Seafood Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_balad",
          "address_en": "F5PR+H7Q, Old Mecca Al Moukarramah Rd, Historic Jeddah, Jeddah 22236, Saudi Arabia",
          "latitude": 21.4864636,
          "longitude": 39.190830299999995,
          "maps_business_name": "Al-Daraj Seafood Restaurant",
          "google_place_id": "ChIJb7a0h93PwxURcnrTMXc2PAc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Al-Daraj%20Seafood%20Restaurant&query_place_id=ChIJb7a0h93PwxURcnrTMXc2PAc",
          "google_rating": 4.6,
          "google_review_count": 472,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 12:00-23:30; Fri 13:00-23:30",
          "phone": "+966568078200",
          "geographic_notes": "Located in Historic Jeddah (Bab Makkah / Al Balad), canonical district al_balad.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Authentic Fried Red Sea Fish",
          "name_ar": "سمك بحري مقلي على الطريقة التاريخية",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Traditional Spiced Shrimp",
          "name_ar": "جمبري بلدي بالتتبيلة الحجازية",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Al-Daraj Special Sayadiyah",
          "name_ar": "صيادية الدرج الخاصة",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _seafood_catalog), brands AS (
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
  b->'delivery_platforms',
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
  'production_ready'::public.research_use,
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
  last_verified_at=EXCLUDED.last_verified_at,
  research_use='production_ready'::public.research_use;

-- 2. Cleanup stale best sellers and sources for new brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _seafood_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
);

DELETE FROM public.restaurant_sources s USING _seafood_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _seafood_catalog), branches AS (
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

-- 4. Insert best sellers for brands
WITH catalog AS (SELECT payload FROM _seafood_catalog), sellers AS (
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
  'Certified Seafood Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _seafood_catalog), brands AS (
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
  '2026-09-28T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _seafood_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
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
