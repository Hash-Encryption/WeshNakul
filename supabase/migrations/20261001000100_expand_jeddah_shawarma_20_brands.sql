-- WeshNakul — Forward-Only Migration: Shawarma Catalog Expansion (14 -> 20 Brands)
-- Migration: 20261001000100_expand_jeddah_shawarma_20_brands.sql
-- Reference: WeshNakul Restaurant Discovery & Research Requirements V3
-- Adds 6 newly approved Shawarma brands (Palm Beach, Ganat Al Shawarma, Shawarma Jalila, Samar Jeddah Shawarma, Professional Shawarma, Al-Wazzan Restaurant)
-- Incorporates exactly 13 verified active physical branches with branch-specific Place IDs, coordinates, and ratings.
-- Preserves existing 14 Shawarma brands, Burger, Broast, Pizza, Rice, and all other categories untouched.
-- Strictly forward-only, idempotent, and fully aligned with 30-district canonical geography.
BEGIN;

CREATE TEMP TABLE _shawarma_expansion (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _shawarma_expansion(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Shawarma Catalog Expansion",
    "version": "Pass D Certified Corrected Expansion",
    "date": "2026-10-01",
    "expansion_brands_count": 6,
    "expansion_branches_count": 13,
    "total_target_brands": 20,
    "total_target_branches": 61
  },
  "brands": [
    {
      "brand_id": "palm_beach",
      "canonical_name": "Palm Beach",
      "arabic_name": "بالم بيتش",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "شاورما دجاج عربي بالم بيتش 🌯",
      "signature_dish_en": "Palm Beach Arabi Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شاورما عريقة",
        "لبناني",
        "سريع",
        "عائلي"
      ],
      "vibe_tags_en": [
        "Classic Lebanese",
        "Shawarma Legend",
        "Quick Bite",
        "Family Friendly"
      ],
      "reputation_tags": [
        "local_favorite",
        "mainstream"
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
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_zahra",
        "abhur_al_janoubiyah"
      ],
      "official_website": "https://palmbeachksa.com",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "شاورما دجاج عربي",
          "name_en": "Arabi Chicken Shawarma",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "شاورما لحم عربي",
          "name_en": "Arabi Beef Shawarma",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "ساندوتش شاورما لحم",
          "name_en": "Beef Shawarma Sandwich",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "palm_beach",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": "الزهراء",
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Al Batarji, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.597963,
          "longitude": 39.139307,
          "maps_business_name": "Palm Beach",
          "google_place_id": "ChIJxX-9L2TawxURGNKhTbdSpMU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJxX-9L2TawxURGNKhTbdSpMU",
          "google_rating": 4.1,
          "google_review_count": 10989,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "palm_beach",
          "branch_name_en": "Abhur / Marina Avenue",
          "branch_name_ar": "أبحر / مارينا أفينيو",
          "branch_type": "unknown",
          "district": "abhur_al_janoubiyah",
          "address_en": "Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
          "latitude": 21.7647671,
          "longitude": 39.1415757,
          "maps_business_name": "Palm Beach Restaurant",
          "google_place_id": "ChIJSz-kHQBjwRUR977JALhYkK8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJSz-kHQBjwRUR977JALhYkK8",
          "google_rating": 3.8,
          "google_review_count": 937,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "palm_beach",
          "branch_name_en": "Al Baghdadiyah / Al Sariah Square",
          "branch_name_ar": "البغدادية / ميدان السارية",
          "branch_type": "unknown",
          "district": null,
          "address_en": "Al Sariah Square, Al-Baghdadiyah Al-Gharbiyah, Jeddah 22234, Saudi Arabia",
          "latitude": 21.5099734,
          "longitude": 39.1774628,
          "maps_business_name": "PALM BEACH RESTAURANTS",
          "google_place_id": "ChIJl0hnwE3PwxURV8qzlc0R8YI",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJl0hnwE3PwxURV8qzlc0R8YI",
          "google_rating": 4.0,
          "google_review_count": 920,
          "operating_status": "open",
          "geographic_notes": "Outer Jeddah branch in physical district Al Baghdadiyah Al Gharbiyah (Al Sariah Square), outside the 30 canonical districts; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "ganat_al_shawarma",
      "canonical_name": "Ganat Al Shawarma",
      "arabic_name": "جنة الشاورما",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 10,
      "estimated_spend_max_sar": 25,
      "signature_dish_ar": "شاورما دجاج عربي جنة الشاورما 🌯",
      "signature_dish_en": "Ganat Arabi Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شعبي",
        "سريع",
        "اقتصادي",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Local Favorite",
        "Quick Bite",
        "Budget Friendly",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
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
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "research_use": "usable_with_caution",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "صحن شاورما عربي دجاج",
          "name_en": "Arabi Chicken Shawarma Plate",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "صاروخ شاورما دجاج",
          "name_en": "Chicken Shawarma Saroukh",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "صحن شاورما فرط",
          "name_en": "Shawarma Platter",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "ganat_al_shawarma",
          "branch_name_en": "Mada'en Al-Fahd",
          "branch_name_ar": "مدائن الفهد",
          "branch_type": "unknown",
          "district": null,
          "address_en": "Mada'en Al-Fahd, Jeddah 22347, Saudi Arabia",
          "latitude": 21.4560402,
          "longitude": 39.2457165,
          "maps_business_name": "ganat alshawarma",
          "google_place_id": "ChIJY8j1NhrMwxUR1h-Jw_NcMc0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJY8j1NhrMwxUR1h-Jw_NcMc0",
          "google_rating": 4.3,
          "google_review_count": 2141,
          "operating_status": "open",
          "geographic_notes": "Outer Jeddah branch in physical district Mada'en Al-Fahd (postal 22347), outside canonical 30 districts; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "ganat_al_shawarma",
          "branch_name_en": "Marikh / Palestine",
          "branch_name_ar": "مريخ / شارع فلسطين",
          "branch_type": "unknown",
          "district": null,
          "address_en": "8060 Palestine St, Marikh, Jeddah 23252, Saudi Arabia",
          "latitude": 21.5545928,
          "longitude": 39.2865726,
          "maps_business_name": "Ganat Alshawarma",
          "google_place_id": "ChIJx08kFwDTwxURxMVOLVG3Pvs",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJx08kFwDTwxURxMVOLVG3Pvs",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Physical listing on Palestine Street in Marikh (postal 23252), outside canonical 30 districts; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "shawarma_jalila",
      "canonical_name": "Shawarma Jalila",
      "arabic_name": "شاورما جليلة",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 16,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "شاورما جليلة 🌯",
      "signature_dish_en": "Jalila Shawarma 🌯",
      "vibe_tags_ar": [
        "شاورما شامي",
        "عربي مميز",
        "سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Levant Shawarma",
        "Arabi Box",
        "Quick Bite",
        "Late Night"
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_safa",
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "rising",
      "trend_confidence": "high",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "شاورما جليلة",
          "name_en": "Jalila Shawarma",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "شاورما عربي دجاج",
          "name_en": "Arabi Chicken Shawarma",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "صاروخية جليلة",
          "name_en": "Jalila Saroukh",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "shawarma_jalila",
          "branch_name_en": "Al Safa",
          "branch_name_ar": "الصفا",
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "3141 Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23451, Saudi Arabia",
          "latitude": 21.5740633,
          "longitude": 39.2094765,
          "maps_business_name": "Shawarma Jalila شاورما جليلة",
          "google_place_id": "ChIJc1d5qsPRwxURxk5zjAV0qW8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJc1d5qsPRwxURxk5zjAV0qW8",
          "google_rating": 4.1,
          "google_review_count": 1438,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_jalila",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": "الزهراء",
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "2497 Hira, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.6064317,
          "longitude": 39.1227845,
          "maps_business_name": "Shawarma Jalila شاورما جليلة",
          "google_place_id": "ChIJQbu5i9_bwxURDEYfwLTIB4U",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJQbu5i9_bwxURDEYfwLTIB4U",
          "google_rating": 3.9,
          "google_review_count": 2085,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "samar_jeddah_shawarma",
      "canonical_name": "Samar Jeddah Shawarma",
      "arabic_name": "شاورما سمر",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 28,
      "signature_dish_ar": "شاورما سمر دجاج عربي بالثوم والشطة 🌯",
      "signature_dish_en": "Samar Arabi Shawarma with Garlic & Shotta 🌯",
      "vibe_tags_ar": [
        "شاورما أصيلة",
        "ثوم وشطة",
        "سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Authentic Shawarma",
        "Garlic & Spicy",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
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
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_safa",
        "al_shati"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "وجبة شاورما عربي",
          "name_en": "Arabi Shawarma Meal",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "شاورما صاروخ",
          "name_en": "Saroukh Shawarma",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "شاورما إيطالي",
          "name_en": "Italian Shawarma",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "samar_jeddah_shawarma",
          "branch_name_en": "Al Safa",
          "branch_name_ar": "الصفا",
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "Al-Shakireen, Al Safa, Jeddah 23453, Saudi Arabia",
          "latitude": 21.5733423,
          "longitude": 39.2103978,
          "maps_business_name": "Samar Jeddah Shawarma",
          "google_place_id": "ChIJjT8PognRwxURA3yRHuSrOHg",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJjT8PognRwxURA3yRHuSrOHg",
          "google_rating": 4.0,
          "google_review_count": 3704,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "samar_jeddah_shawarma",
          "branch_name_en": "Marina / Waterfront",
          "branch_name_ar": "الواجهة البحرية / مركز شاطئ المارينا",
          "branch_type": "unknown",
          "district": "al_shati",
          "address_en": "Jeddah Waterfront, Marina Beach Center, Al Shati, Jeddah 67321, Saudi Arabia",
          "latitude": 21.6163283,
          "longitude": 39.1083364,
          "maps_business_name": "samar land jeddah",
          "google_place_id": "ChIJTxbldIrbwxURbZeKSTOvrZk",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJTxbldIrbwxURbZeKSTOvrZk",
          "google_rating": 4.1,
          "google_review_count": 802,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "samar_jeddah_shawarma",
          "branch_name_en": "North Jeddah / Hamdaniyah-area",
          "branch_name_ar": "شمال جدة / منطقة الحمدانية",
          "branch_type": "unknown",
          "district": null,
          "address_en": "Al Yam, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7500525,
          "longitude": 39.1876432,
          "maps_business_name": "SHAWERMA SAMAR JEDDAH",
          "google_place_id": "ChIJ65ffIB99wRURq0dUcAC5Aao",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ65ffIB99wRURq0dUcAC5Aao",
          "google_rating": 3.7,
          "google_review_count": 1076,
          "operating_status": "open",
          "geographic_notes": "North Jeddah branch in postal code 23761 (outer / Hamdaniyah vicinity); canonical_district is null per Pass D research requirement; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "professional_shawarma",
      "canonical_name": "Professional Shawarma",
      "arabic_name": "شاورما المحترفين",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 28,
      "signature_dish_ar": "صحن عربي دجاج 🌯",
      "signature_dish_en": "Arabi Chicken Shawarma Plate 🌯",
      "vibe_tags_ar": [
        "شاورما شامي",
        "سريع",
        "اقتصادي",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Levant Shawarma",
        "Quick Bite",
        "Budget Friendly",
        "Late Night"
      ],
      "reputation_tags": [
        "hidden_gem"
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_sharafeyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "صحن عربي دجاج",
          "name_en": "Arabi Chicken Shawarma Plate",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "شاورما دجاج صاج",
          "name_en": "Saj Chicken Shawarma Sandwich",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "الصحن الإيطالي",
          "name_en": "Italian Shawarma Plate",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "professional_shawarma",
          "branch_name_en": "Al Sharafiyah",
          "branch_name_ar": "الشرفية",
          "branch_type": "unknown",
          "district": "al_sharafeyah",
          "address_en": "Ibn Al Alam Center, King Fahd Rd, Al Sharafeyah, Jeddah 23218, Saudi Arabia",
          "latitude": 21.5242626,
          "longitude": 39.192294,
          "maps_business_name": "شاورما المحترفين Professional shawarma",
          "google_place_id": "ChIJe7XN1hLPwxUR13HhN1oRqSY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJe7XN1hLPwxUR13HhN1oRqSY",
          "google_rating": 4.1,
          "google_review_count": 1378,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "professional_shawarma",
          "branch_name_en": "Al Baghdadiyah Al Sharqiyah",
          "branch_name_ar": "البغدادية الشرقية",
          "branch_type": "unknown",
          "district": null,
          "address_en": "Mud Said Al Matbuli St, Al Baghdadiyah Al Sharqiyah, Jeddah 22235, Saudi Arabia",
          "latitude": 21.4998303,
          "longitude": 39.1849882,
          "maps_business_name": "Professional Shawarma",
          "google_place_id": "ChIJ_w52rkzPwxURCW829ZKK-eY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ_w52rkzPwxURCW829ZKK-eY",
          "google_rating": 4.6,
          "google_review_count": 387,
          "operating_status": "open",
          "geographic_notes": "Outer Jeddah branch in physical district Al Baghdadiyah Al Sharqiyah, outside canonical 30 districts; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "al_wazzan_restaurant",
      "canonical_name": "Al-Wazzan Restaurant",
      "arabic_name": "مطعم الوزان",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "شاورما دجاج الوزان الأصلية 🌯",
      "signature_dish_en": "Original Al-Wazzan Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "مؤسسة تاريخية",
        "لبناني أصيل",
        "مفتوح 24 ساعة",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Historic Landmark",
        "Authentic Lebanese",
        "24/7 Service",
        "Late Night"
      ],
      "reputation_tags": [
        "jeddah_staple",
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "late_night",
        "open_24_hours"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "closing_time_ar": "مفتوح 24 ساعة",
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_faisaliyyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": true,
        "keeta": true
      },
      "best_sellers": [
        {
          "name_ar": "ساندوتش شاورما دجاج الوزان",
          "name_en": "Al-Wazzan Chicken Shawarma Sandwich",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_ar": "ساندوتش شاورما لحم الوزان",
          "name_en": "Al-Wazzan Beef Shawarma Sandwich",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_ar": "وجبة شاورما عربي",
          "name_en": "Arabi Shawarma Platter",
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "branches": [
        {
          "restaurant_id": "al_wazzan_restaurant",
          "branch_name_en": "Al Faisaliyah",
          "branch_name_ar": "الفيصلية",
          "branch_type": "unknown",
          "district": "al_faisaliyyah",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Al Faisaliyyah, Jeddah 23441, Saudi Arabia",
          "latitude": 21.5581379,
          "longitude": 39.18091,
          "maps_business_name": "Al-Wazzan Restaurant",
          "google_place_id": "ChIJV1POzTjQwxURDjZwwrOJSWo",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJV1POzTjQwxURDjZwwrOJSWo",
          "google_rating": 4.0,
          "google_review_count": 32458,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- Defensive Validation Assertions
DO $$
DECLARE
  p jsonb;
  b_cnt int;
  br_cnt int;
BEGIN
  SELECT payload INTO p FROM _shawarma_expansion;
  SELECT count(*) INTO b_cnt FROM jsonb_array_elements(p->'brands');
  IF b_cnt <> 6 THEN RAISE EXCEPTION 'Expected 6 expansion brands, got %', b_cnt; END IF;

  SELECT count(*) INTO br_cnt
  FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br;
  IF br_cnt <> 13 THEN RAISE EXCEPTION 'Expected 13 verified physical expansion branches, got %', br_cnt; END IF;

  -- Verify caution branches have non-empty geographic notes
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NULL AND (br->>'geographic_notes' IS NULL OR length(trim(br->>'geographic_notes')) = 0)
  ) THEN RAISE EXCEPTION 'Caution branch without geographic notes detected'; END IF;

  -- Verify no place ID collision with different brand
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants for the 6 new brands
WITH catalog AS (SELECT payload FROM _shawarma_expansion), brands AS (
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
  b->>'arabic_name',
  b->>'canonical_name',
  ARRAY(SELECT jsonb_array_elements_text(b->'categories')),
  (b->>'is_city_wide')::boolean,
  ARRAY(SELECT jsonb_array_elements_text(b->'canonical_districts')),
  'both',
  ARRAY(SELECT jsonb_array_elements_text(b->'time_slots')),
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 3:00 ص' END,
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
  b->'delivery_platforms',
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
  NULL,
  coalesce((b->>'serves_breakfast_menu')::boolean, false),
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  (b->>'trend_status')::public.trend_status,
  (b->>'trend_confidence')::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  (b->>'research_use')::public.research_use,
  '2026-10-01T00:00:00Z'::timestamptz,
  NULL,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  categories=EXCLUDED.categories,
  is_city_wide=EXCLUDED.is_city_wide,
  branches=EXCLUDED.branches,
  dining_mode=EXCLUDED.dining_mode,
  time_slots=EXCLUDED.time_slots,
  closing_time_ar=EXCLUDED.closing_time_ar,
  is_open_late=EXCLUDED.is_open_late,
  is_24_hours=EXCLUDED.is_24_hours,
  avg_prep_minutes=EXCLUDED.avg_prep_minutes,
  tier=EXCLUDED.tier,
  price_tier=EXCLUDED.price_tier,
  signature_dish_ar=EXCLUDED.signature_dish_ar,
  signature_dish_en=EXCLUDED.signature_dish_en,
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  platforms=EXCLUDED.platforms,
  links=EXCLUDED.links,
  city=EXCLUDED.city,
  primary_category=EXCLUDED.primary_category,
  secondary_categories=EXCLUDED.secondary_categories,
  subcategories=EXCLUDED.subcategories,
  category_fit_confidence=EXCLUDED.category_fit_confidence,
  category_fit_evidence=EXCLUDED.category_fit_evidence,
  editorial_role=EXCLUDED.editorial_role,
  reputation_tags=EXCLUDED.reputation_tags,
  context_tags=EXCLUDED.context_tags,
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  serves_breakfast_menu=EXCLUDED.serves_breakfast_menu,
  dining_mode_summary=EXCLUDED.dining_mode_summary,
  price_position=EXCLUDED.price_position,
  estimated_sar_per_person_min=EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max=EXCLUDED.estimated_sar_per_person_max,
  official_website=EXCLUDED.official_website,
  trend_status=EXCLUDED.trend_status,
  trend_confidence=EXCLUDED.trend_confidence,
  overall_confidence=EXCLUDED.overall_confidence,
  research_use=EXCLUDED.research_use,
  last_verified_at=EXCLUDED.last_verified_at,
  manual_review_required=EXCLUDED.manual_review_required,
  manual_review_reasons=EXCLUDED.manual_review_reasons,
  intelligence_origin=EXCLUDED.intelligence_origin;

-- 2. Cleanup stale best sellers and sources for these 6 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _shawarma_expansion c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _shawarma_expansion c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _shawarma_expansion), branches AS (
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
  '2026-10-01T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-10-01T00:00:00Z'::timestamptz
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id=EXCLUDED.restaurant_id,
  branch_name_ar=EXCLUDED.branch_name_ar,
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

-- 4. Insert best sellers
WITH catalog AS (SELECT payload FROM _shawarma_expansion), sellers AS (
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
  'Certified Shawarma Pass D expansion signature item',
  '2026-10-01T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _shawarma_expansion), brands AS (
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
  '2026-10-01T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _shawarma_expansion), branches AS (
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
  '2026-10-01T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
