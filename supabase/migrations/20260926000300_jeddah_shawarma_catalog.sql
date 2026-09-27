-- Google-verified Jeddah Shawarma production catalog.
-- Source: docs/research/jeddah-shawarma-pass-d-corrected.json
-- 14 approved brands, 48 verified physical branches (40 canonical, 8 outer-district caution branches).
-- Enriched with verified coordinates directly from Google Places API (New) for all 48 unique Google Place IDs.
-- Reconciles legacy unverified placeholder seeds without altering Burger or Broast catalogs.
-- Apply after 20260926000200_jeddah_broast_fried_chicken_catalog.sql.
BEGIN;

-- 0. Reconcile legacy orphan placeholder 'shawerma_alrimal' (with typo ID) if present without branches
DELETE FROM public.restaurants WHERE id = 'shawerma_alrimal' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'shawerma_alrimal'
);

CREATE TEMP TABLE _shawarma_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _shawarma_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Shawarma Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-26",
    "brand_count": 14,
    "branch_count": 48
  },
  "brands": [
    {
      "brand_id": "shawarmer",
      "canonical_name": "Shawarmer",
      "arabic_name": "شاورمر",
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
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "عربي شاورمر بالدجاج 🌯",
      "signature_dish_en": "Arabo Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شاورما مبتكرة",
        "عربي",
        "سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Modern Shawarma",
        "Arabi Box",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
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
      "verified_jeddah_branch_count": 18,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_faiha",
        "al_hamra",
        "al_marwah",
        "al_mohammadiyyah",
        "al_rehab",
        "al_salamah",
        "al_samer",
        "al_shati",
        "al_zahra",
        "an_nuzhah"
      ],
      "official_website": "https://shawarmer.com/en",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Tagamees",
          "name_ar": "عربي شاورمر بالدجاج 🌯",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Saji",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Double Arabo",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Al Azeima",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23431",
          "latitude": 21.640994,
          "longitude": 39.1304188,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJ_zjGlY3ZwxURKZeb-5L1Spc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ_zjGlY3ZwxURKZeb-5L1Spc",
          "google_rating": 4,
          "google_review_count": 2186,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Fayha",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_faiha",
          "address_en": "Al Fayha, Jeddah 22246",
          "latitude": 21.489916299999997,
          "longitude": 39.224320999999996,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJPxm8RzHPwxURCOReaD4mb2g",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJPxm8RzHPwxURCOReaD4mb2g",
          "google_rating": 3.9,
          "google_review_count": 2589,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Rabi",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Al Haramain Rd, Al Rabi, Jeddah 23545",
          "latitude": 21.6184701,
          "longitude": 39.2142099,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJy-uwg9jRwxUR-bJ1AhR3FBc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJy-uwg9jRwxUR-bJ1AhR3FBc",
          "google_rating": 4.2,
          "google_review_count": 1067,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Al Rabi (outer east corridor along Al Haramain Rd), outside the 30-district canonical urban whitelist; stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Al Zahra, Jeddah 23521",
          "latitude": 21.5919714,
          "longitude": 39.131352799999995,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJ7SGvIGHbwxURPvsMMtYIAtI",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ7SGvIGHbwxURPvsMMtYIAtI",
          "google_rating": 4.2,
          "google_review_count": 693,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Rehab",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rehab",
          "address_en": "Prince Mutaib bin Abdulaziz Rd, Al Rehab, Jeddah 23342",
          "latitude": 21.5582477,
          "longitude": 39.2129438,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJVU78RtXRwxURYdgPEmsOKXE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJVU78RtXRwxURYdgPEmsOKXE",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "North Obhur",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23817",
          "latitude": 21.762591999999998,
          "longitude": 39.115113799999996,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJveGyMQFjwRURyjGQnoa9djI",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJveGyMQFjwRURyjGQnoa9djI",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, An Nuzhah, Jeddah 23423",
          "latitude": 21.6326407,
          "longitude": 39.156045999999996,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJXyT-rFfXwxURcNmizGuVsl8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJXyT-rFfXwxURcNmizGuVsl8",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_shati",
          "address_en": "Red Sea Mall, Ash Shati, Jeddah 21146",
          "latitude": 21.6278234,
          "longitude": 39.1110946,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJbd2zjv3bwxURDGPoUpczSK4",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJbd2zjv3bwxURDGPoUpczSK4",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Taiba",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Main St, Taiba, Jeddah 23832",
          "latitude": 21.7971731,
          "longitude": 39.137948200000004,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJE4CY1jNlwRURKj5BMu-iCyM",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJE4CY1jNlwRURKj5BMu-iCyM",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Taiba (far north Jeddah suburb, ~30km north), outside the 30-district canonical urban whitelist; stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_samer",
          "address_en": "Al Samer, Al Ajwad, Jeddah 23462",
          "latitude": 21.5946013,
          "longitude": 39.2423133,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJ9wx_hvvTwxURL22JlZwoTFc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ9wx_hvvTwxURL22JlZwoTFc",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Hamra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamra",
          "address_en": "Al-Hamra'a, Jeddah 22431",
          "latitude": 21.5201416,
          "longitude": 39.1570199,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJsz_a01bPwxURhX9e9ubMjDw",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJsz_a01bPwxURhX9e9ubMjDw",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Al Sanabel, Jeddah 22444",
          "latitude": 21.4000608,
          "longitude": 39.2812726,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJQf66Lo7LwxURsYyAUCF26fU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJQf66Lo7LwxURsYyAUCF26fU",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Al Sanabel (outer south Jeddah, ~25km south of central core), outside the 30-district canonical urban whitelist; stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Umm Al Qoura",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Umm Al Qoura St, Jeddah 23455",
          "latitude": 21.593831599999998,
          "longitude": 39.216023,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJaTzlLFrRwxUR-CYCxpjNfsE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJaTzlLFrRwxUR-CYCxpjNfsE",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Branch verified on Umm Al Qoura St corridor, stored with district = null per non-canonical slug in certified source.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Mishrifah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Palestine, Mishrifah, Jeddah 23335",
          "latitude": 21.5343381,
          "longitude": 39.2040605,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJ8R5AllrRwxUR3646IDL7KyM",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ8R5AllrRwxUR3646IDL7KyM",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Mishrifah (historic central district outside the 30-district canonical urban whitelist); stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Prince Fawaz South",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Makkah–Jeddah Hwy, Al Amir Fawaz Al Janouby, Jeddah 22431",
          "latitude": 21.4406102,
          "longitude": 39.280406899999996,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJFeJ7HlPNwxURjR40GbD9ueY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJFeJ7HlPNwxURjR40GbD9ueY",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Prince Fawaz South (outer south-east Jeddah residential sector), outside the 30-district canonical urban whitelist; stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Marwah - Prince Majid",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Prince Majid Rd, Al Marwah, Jeddah 23541",
          "latitude": 21.6150164,
          "longitude": 39.1881255,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJmSlpE_XRwxURDDCC9KVb6H8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJmSlpE_XRwxURDDCC9KVb6H8",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Saqr Quraish St, As Salamah, Jeddah 23436",
          "latitude": 21.5854958,
          "longitude": 39.1611908,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJK8Ggb4fQwxURWSeZpoYU808",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJK8Ggb4fQwxURWSeZpoYU808",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarmer",
          "branch_name_en": "Al Marwah - Hira",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23545",
          "latitude": 21.6243138,
          "longitude": 39.2101501,
          "maps_business_name": "Shawarmer",
          "google_place_id": "ChIJdcLuRRrXwxUR6UQ37CGXYeU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJdcLuRRrXwxUR6UQ37CGXYeU",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_classic",
      "canonical_name": "Shawarma Classic",
      "arabic_name": "شاورما كلاسك",
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
      "estimated_spend_min_sar": 14,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "شاورما كلاسك عربي 🌯",
      "signature_dish_en": "Shawarma Classic Arabi 🌯",
      "vibe_tags_ar": [
        "شاورما كلاسيك",
        "فلكة",
        "عربي",
        "سريع"
      ],
      "vibe_tags_en": [
        "Classic Shawarma",
        "Falka",
        "Arabi Box",
        "Quick Bite"
      ],
      "reputation_tags": [
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_faiha",
        "al_hamdaniyah",
        "al_marwah",
        "al_safa",
        "al_zahra"
      ],
      "official_website": "https://shawarmaclassic.com/our-story/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Shawarma Classic",
          "name_ar": "شاورما كلاسك عربي 🌯",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Falka",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Jumbo Classic",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Arabi Classic",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "As Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "4126 Umm Al Qoura, As Safa District, Jeddah",
          "latitude": 21.5765015,
          "longitude": 39.2192343,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJUWJgExLRwxURNtqFpE4BgTY",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJUWJgExLRwxURNtqFpE4BgTY",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23542",
          "latitude": 21.621019999999998,
          "longitude": 39.191773999999995,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJYUPMpwvXwxURjSKKW9yYYNA",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJYUPMpwvXwxURjSKKW9yYYNA",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "Al Hamadaniyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "Hamadaniyyah St, Al Hamadaniyyah, Jeddah 23761",
          "latitude": 21.749333999999998,
          "longitude": 39.1889962,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJOTh2WMN9wRURs7v0ovLAwGk",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJOTh2WMN9wRURs7v0ovLAwGk",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "Al Fayha",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_faiha",
          "address_en": "3622 Abdullah Sulayman Branch St, Al Fayha, Jeddah 22244",
          "latitude": 21.4949029,
          "longitude": 39.218268599999995,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJGYcw2N3PwxURIK8dLIGCUVU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJGYcw2N3PwxURIK8dLIGCUVU",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Prince Sultan Rd, Al Zahra, Jeddah 23433",
          "latitude": 21.5932742,
          "longitude": 39.1435247,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJVexALQbbwxUR2PpnI5WUXUE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJVexALQbbwxUR2PpnI5WUXUE",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_classic",
          "branch_name_en": "North Obhur",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, North Obhur, Jeddah 23815",
          "latitude": 21.762476,
          "longitude": 39.115263,
          "maps_business_name": "Shawarma Classic",
          "google_place_id": "ChIJ92qE3e1jwRUR2-FiJoVE38w",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ92qE3e1jwRUR2-FiJoVE38w",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_alrimal",
      "canonical_name": "Shawarma Alrimal",
      "arabic_name": "شاورما الرمال",
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
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "شاورما دجاج مع الثوم 🌯",
      "signature_dish_en": "Chicken Shawarma with Garlic 🌯",
      "vibe_tags_ar": [
        "قديم ومعروف",
        "ثوم",
        "سريع",
        "أصيل"
      ],
      "vibe_tags_en": [
        "Old-School Staple",
        "Garlic Sauce",
        "Quick Bite",
        "Authentic"
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
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_andalus",
        "al_faiha",
        "al_khalidiyyah",
        "al_marwah",
        "al_mohammadiyyah"
      ],
      "official_website": "https://linktr.ee/shawerma_alrimal",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Chicken Shawarma with Garlic 🌯",
          "name_ar": "شاورما دجاج مع الثوم 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_alrimal",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23545",
          "latitude": 21.620744900000002,
          "longitude": 39.1904232,
          "maps_business_name": "Shawarma Alrimal",
          "google_place_id": "ChIJOX7m6T_XwxURQWPnP9eHheE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJOX7m6T_XwxURQWPnP9eHheE",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_alrimal",
          "branch_name_en": "Tahlia / Al Andalus",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_andalus",
          "address_en": "2892 Abd Al Rahman Al Toubaishi, Al Andalus, Jeddah 23326",
          "latitude": 21.5491885,
          "longitude": 39.161079799999996,
          "maps_business_name": "Shawarma Alrimal",
          "google_place_id": "ChIJp-0hkQPQwxUR5Xvjg-yzup8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJp-0hkQPQwxUR5Xvjg-yzup8",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_alrimal",
          "branch_name_en": "Al Khalidiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_khalidiyyah",
          "address_en": "Prince Saud Al Faisal St, Al Khalidiyyah, Jeddah 23422",
          "latitude": 21.559602299999998,
          "longitude": 39.1310734,
          "maps_business_name": "Shawarma Alrimal",
          "google_place_id": "ChIJSWbxbwDbwxURRF6yWMw3OWQ",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJSWbxbwDbwxURRF6yWMw3OWQ",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_alrimal",
          "branch_name_en": "Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23625",
          "latitude": 21.6642831,
          "longitude": 39.1223852,
          "maps_business_name": "Shawarma Alrimal",
          "google_place_id": "ChIJ5bsnZALZwxUR40P5srMdQuo",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ5bsnZALZwxUR40P5srMdQuo",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_alrimal",
          "branch_name_en": "Al Fayha",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_faiha",
          "address_en": "7535 Abdullah Sulayman St, Al Fayha, Jeddah 22246",
          "latitude": 21.4963572,
          "longitude": 39.218970899999995,
          "maps_business_name": "Shawarma Alrimal",
          "google_place_id": "ChIJGQH-HhXPwxURlo-il8pb63o",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJGQH-HhXPwxURlo-il8pb63o",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shamiyat_haritna",
      "canonical_name": "Shamiyat Haritna",
      "arabic_name": "شاميات حارتنا",
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
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "شاورما شامية عربي بالثوم 🌯",
      "signature_dish_en": "Shami Arabic Shawarma with Garlic 🌯",
      "vibe_tags_ar": [
        "شامي أصيل",
        "جلسات شباب",
        "ثوم زيادة"
      ],
      "vibe_tags_en": [
        "Authentic Levantine",
        "Casual Hangout",
        "Extra Garlic"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "late_night",
        "delivery_strong"
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
        "al_naeem",
        "al_salamah"
      ],
      "official_website": "https://linktr.ee/shamyatharitna",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Shami Arabic Shawarma with Garlic 🌯",
          "name_ar": "شاورما شامية عربي بالثوم 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shamiyat_haritna",
          "branch_name_en": "Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naeem",
          "address_en": "Prince Sultan Rd, Al Naeem, Jeddah 23526",
          "latitude": 21.6150473,
          "longitude": 39.14007,
          "maps_business_name": "Shamiyat Haritna",
          "google_place_id": "ChIJAzEqTQDbwxURThhPMFq4sZ4",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJAzEqTQDbwxURThhPMFq4sZ4",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shamiyat_haritna",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Saqer Qouraish St, As Salamah, Jeddah 23436",
          "latitude": 21.5848789,
          "longitude": 39.1593008,
          "maps_business_name": "Shamiyat Haritna",
          "google_place_id": "ChIJV1jA0xbRwxURAKJWs-DTaQ0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJV1jA0xbRwxURAKJWs-DTaQ0",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shamiyat_haritna",
          "branch_name_en": "Al Hamra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamra",
          "address_en": "Al Sourour, Al-Hamra'a, Jeddah 23212",
          "latitude": 21.5201998,
          "longitude": 39.1570598,
          "maps_business_name": "Shamiyat Haritna",
          "google_place_id": "ChIJhTNHkP7PwxUR75tF8PF_tjU",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJhTNHkP7PwxUR75tF8PF_tjU",
          "google_rating": null,
          "google_review_count": null,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "ayedh_shawarma",
      "canonical_name": "Ayedh Shawarma",
      "arabic_name": "شاورما عايض",
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
      "signature_dish_ar": "شاورما دجاج عايض 🌯",
      "signature_dish_en": "Ayedh Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "ترند",
        "ثوم",
        "سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Trendy",
        "Garlicky",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_salamah"
      ],
      "official_website": "https://restaurantguru.com/Ayedh-Shawarma-Jeddah",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Chicken Shawarma",
          "name_ar": "شاورما دجاج عايض 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "ayedh_shawarma",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Prince Sultan Rd, As Salamah, Jeddah 23526",
          "latitude": 21.6152378,
          "longitude": 39.139908399999996,
          "maps_business_name": "Ayedh Shawarma",
          "google_place_id": "ChIJ-2RxAgDbwxURXTbm30gRCjM",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ-2RxAgDbwxURXTbm30gRCjM",
          "google_rating": 4.4,
          "google_review_count": 3401,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "al_khal_al_dimashqi",
      "canonical_name": "Al-Khal Al-Dimashqi",
      "arabic_name": "الخال الدمشقي",
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
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "شاورما دمشقية أصيلة على الفحم 🌯",
      "signature_dish_en": "Authentic Damascene Shawarma 🌯",
      "vibe_tags_ar": [
        "دمشقي أصيل",
        "فحم ونكهة",
        "جلسات"
      ],
      "vibe_tags_en": [
        "Authentic Damascus",
        "Charcoal Flavor",
        "Dine-In"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rawdah"
      ],
      "official_website": "https://restaurantguru.com/ALKHAL-ALDIMASHKI-alkhal-aldmshqy-Jeddah",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Authentic Damascene Shawarma 🌯",
          "name_ar": "شاورما دمشقية أصيلة على الفحم 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "al_khal_al_dimashqi",
          "branch_name_en": "Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rawdah",
          "address_en": "Prince Saud Al Faisal, Ar Rawdah, Jeddah 23337",
          "latitude": 21.5592617,
          "longitude": 39.1434746,
          "maps_business_name": "Al-Khal Al-Dimashqi",
          "google_place_id": "ChIJm9UGdADbwxURNAknozjvmcA",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJm9UGdADbwxURNAknozjvmcA",
          "google_rating": 4.7,
          "google_review_count": 11038,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_habteen",
      "canonical_name": "Shawarma Habteen",
      "arabic_name": "شاورما حبتين",
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
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "حبتين دجاج على الطريقة الشامية 🌯",
      "signature_dish_en": "Habteen Double Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "حبتين",
        "شامي",
        "سريع",
        "آخر الليل"
      ],
      "vibe_tags_en": [
        "Double Wrap",
        "Levant Style",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
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
        "al_murjan",
        "al_shati"
      ],
      "official_website": "https://linktr.ee/habteen",
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "Habteen Double Chicken Shawarma 🌯",
          "name_ar": "حبتين دجاج على الطريقة الشامية 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_habteen",
          "branch_name_en": "King Abdulaziz Road / Ash Shati",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_shati",
          "address_en": "H4XC+M92, King Abdulaziz Rd, Ash Shati, Jeddah 23513",
          "latitude": 21.5991362,
          "longitude": 39.1209401,
          "maps_business_name": "Shawarma Habteen",
          "google_place_id": "ChIJzbugmXPbwxURSoJGmsoHMQE",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJzbugmXPbwxURSoJGmsoHMQE",
          "google_rating": 4,
          "google_review_count": 5111,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_habteen",
          "branch_name_en": "Al Murjan",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_murjan",
          "address_en": "M4X3+8R5, Al Murjan, Jeddah 23715",
          "latitude": 21.6983125,
          "longitude": 39.1045625,
          "maps_business_name": "Shawarma Habteen",
          "google_place_id": "ChIJz4HiYgDZwxUROiVrQsYaOq4",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJz4HiYgDZwxUROiVrQsYaOq4",
          "google_rating": 4.5,
          "google_review_count": 647,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "ziyada_toum",
      "canonical_name": "Ziyada Toum",
      "arabic_name": "زيادة ثوم",
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
      "estimated_spend_min_sar": 22,
      "estimated_spend_max_sar": 45,
      "signature_dish_ar": "شاورما دجاج ثوم زيادة 🌯",
      "signature_dish_en": "Extra-Garlic Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "ثوم زيادة",
        "لبناني",
        "جلسات شباب"
      ],
      "vibe_tags_en": [
        "Extra Garlic",
        "Lebanese Style",
        "Youth Hangout"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout"
      ],
      "time_slots": [
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
      "official_website": "https://jeddahnight.com/en/place/ziyada-toum-zyad-thom",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Extra-Garlic Chicken Shawarma 🌯",
          "name_ar": "شاورما دجاج ثوم زيادة 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "ziyada_toum",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Brand Rd 6157, King Abdulaziz Rd, Al Zahra, Jeddah 23424",
          "latitude": 21.572695799999998,
          "longitude": 39.1292232,
          "maps_business_name": "Ziyada Toum",
          "google_place_id": "ChIJ_x0NAgrbwxURwqwcAI-PBks",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ_x0NAgrbwxURwqwcAI-PBks",
          "google_rating": 4.6,
          "google_review_count": 2790,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_elak",
      "canonical_name": "Shawarma Elak",
      "arabic_name": "شاورما إلك",
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
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "شاورما إلك عربي دجاج 🌯",
      "signature_dish_en": "Elak Arabic Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شامي",
        "سريع",
        "آخر الليل"
      ],
      "vibe_tags_en": [
        "Levant Style",
        "Quick Bite",
        "Late Night"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_salamah"
      ],
      "official_website": null,
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "Elak Arabic Chicken Shawarma 🌯",
          "name_ar": "شاورما إلك عربي دجاج 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_elak",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Abdul Rahman Ibn Ahmad As Sidayri, As Salamah, Jeddah 23436",
          "latitude": 21.583198799999998,
          "longitude": 39.1592056,
          "maps_business_name": "Shawarma Elak",
          "google_place_id": "ChIJM0pMsxTRwxUR_hEsyv9DFSQ",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJM0pMsxTRwxUR_hEsyv9DFSQ",
          "google_rating": 4.2,
          "google_review_count": 567,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_elak",
          "branch_name_en": "North Obhur",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23815",
          "latitude": 21.7558549,
          "longitude": 39.1207926,
          "maps_business_name": "Shawarma Elak",
          "google_place_id": "ChIJkelihgJjwRURdN9LnIP6h_0",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJkelihgJjwRURdN9LnIP6h_0",
          "google_rating": 4,
          "google_review_count": 1452,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_shakir_aljazeera",
      "canonical_name": "Shawarma Shakir Aljazeera",
      "arabic_name": "شاورما شاكر الجزيرة",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 10,
      "estimated_spend_max_sar": 24,
      "signature_dish_ar": "شاورما لحم خلطة شاكر 🌯",
      "signature_dish_en": "Shakir Mixed Meat Shawarma 🌯",
      "vibe_tags_ar": [
        "أسطورة جدة",
        "لحم بلدي",
        "خلطة شاكر"
      ],
      "vibe_tags_en": [
        "Jeddah Legend",
        "Fresh Meat",
        "Shakir Signature Mix"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite"
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_ruwais"
      ],
      "official_website": "https://shakiraljazeera.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Meat Shawarma - Shakir Mixture",
          "name_ar": "شاورما لحم خلطة شاكر 🌯",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Shawarma",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_shakir_aljazeera",
          "branch_name_en": "Ar Ruwais",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_ruwais",
          "address_en": "Hail St, Ar Ruwais, opposite International Medical Center, Jeddah",
          "latitude": 21.5140109,
          "longitude": 39.1724151,
          "maps_business_name": "Shawarma Shakir Aljazeera",
          "google_place_id": "ChIJGyOgugbPwxURFGdvv7RoC8s",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJGyOgugbPwxURFGdvv7RoC8s",
          "google_rating": 4.1,
          "google_review_count": 13939,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_abu_bahij",
      "canonical_name": "Shawarma Abu Bahij",
      "arabic_name": "شاورما أبو بهيج",
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
      "estimated_spend_min_sar": 14,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "شاورما دجاج خاصة أبو بهيج 🌯",
      "signature_dish_en": "Abu Bahij Special Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شاورما خاصة",
        "خلطات مميزة",
        "سريع"
      ],
      "vibe_tags_en": [
        "Special Shawarma",
        "Signature Dips",
        "Quick Bite"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
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
        "al_bawadi",
        "al_safa"
      ],
      "official_website": "https://abobahij.analytiqatech.com/ar",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Chicken Shawarma",
          "name_ar": "شاورما دجاج خاصة أبو بهيج 🌯",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Beef Shawarma",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Special Chicken Shawarma",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_abu_bahij",
          "branch_name_en": "Hira / Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_bawadi",
          "address_en": "Facing Imad Bakery, Hira St, Al Bawadi District, Jeddah 00966",
          "latitude": 21.6142677,
          "longitude": 39.1579085,
          "maps_business_name": "Shawarma Abu Bahij",
          "google_place_id": "ChIJb6mr-nDRwxUR5PIMjodKLTA",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJb6mr-nDRwxUR5PIMjodKLTA",
          "google_rating": 4.4,
          "google_review_count": 4191,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shawarma_abu_bahij",
          "branch_name_en": "Prince Fawaz South",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Sayed Al-Shuhada'a, Al Shifa Complex, Al Amir Fawaz Al Janouby, Jeddah 00961",
          "latitude": 21.436550999999998,
          "longitude": 39.276811599999995,
          "maps_business_name": "Shawarma Abu Bahij",
          "google_place_id": "ChIJbU437H_NwxUReecRAb4iFFk",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJbU437H_NwxUReecRAb4iFFk",
          "google_rating": 4.6,
          "google_review_count": 1726,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Prince Fawaz South (outer south-east Jeddah residential sector), outside the 30-district canonical urban whitelist; stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "shawarma_abu_bahij",
          "branch_name_en": "As Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "Prince Saud Al Faisal, As Safa, Jeddah 23451",
          "latitude": 21.574032199999998,
          "longitude": 39.2030479,
          "maps_business_name": "Shawarma Abu Bahij",
          "google_place_id": "ChIJbQWg9FzRwxURAQLBzY2Se_I",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJbQWg9FzRwxURAQLBzY2Se_I",
          "google_rating": 4.5,
          "google_review_count": 514,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "radi_shawarma",
      "canonical_name": "Radi Shawarma and Juices",
      "arabic_name": "شاورما راضي",
      "categories": [
        "shawarma"
      ],
      "primary_category": "shawarma",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 10,
      "estimated_spend_max_sar": 24,
      "signature_dish_ar": "شاورما راضي دجاج بالثوم 🌯",
      "signature_dish_en": "Radi Chicken Shawarma with Garlic 🌯",
      "vibe_tags_ar": [
        "أسطورة شعبية",
        "شاورما وعصير",
        "قديم ومعروف"
      ],
      "vibe_tags_en": [
        "Popular Legend",
        "Shawarma & Juice",
        "Classic Jeddah Staple"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "breakfast",
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
        "al_salamah",
        "al_samer"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Radi Chicken Shawarma with Garlic 🌯",
          "name_ar": "شاورما راضي دجاج بالثوم 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "radi_shawarma",
          "branch_name_en": "Mishrifah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Al Makarunah Rd, Mishrifah, Jeddah 23336",
          "latitude": 21.5402584,
          "longitude": 39.1969326,
          "maps_business_name": "Radi Shawarma and Juices",
          "google_place_id": "ChIJe9f4bC3QwxUR1ZP4KS6RHas",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJe9f4bC3QwxUR1ZP4KS6RHas",
          "google_rating": 4.2,
          "google_review_count": 5346,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Mishrifah (historic central district outside the 30-district canonical urban whitelist); stored with district = null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "radi_shawarma",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Abdul Rahman Ibn Ahmad As Sidayri, As Salamah, Jeddah 23436",
          "latitude": 21.5825615,
          "longitude": 39.159341,
          "maps_business_name": "Radi Shawarma and Juices",
          "google_place_id": "ChIJy0K3g37QwxURJ5tyc-ynoiI",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJy0K3g37QwxURJ5tyc-ynoiI",
          "google_rating": 4.1,
          "google_review_count": 3576,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "radi_shawarma",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_samer",
          "address_en": "Wahib Bin Umair, Al Samer, Jeddah 23462",
          "latitude": 21.589620699999998,
          "longitude": 39.2375623,
          "maps_business_name": "Radi Shawarma and Juices",
          "google_place_id": "ChIJiZZONQHPwxURQZP5k-kFuE8",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJiZZONQHPwxURQZP5k-kFuE8",
          "google_rating": 4.2,
          "google_review_count": 1582,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_allosh",
      "canonical_name": "Shawarma Allosh",
      "arabic_name": "شاورما علوش",
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
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "شاورما علوش عربي بالثوم 🌯",
      "signature_dish_en": "Arabic Chicken Shawarma 🌯",
      "vibe_tags_ar": [
        "شامي أصيل",
        "ثوم زيادة",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Levant Style",
        "Extra Garlic",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naeem"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Arabic Chicken Shawarma 🌯",
          "name_ar": "شاورما علوش عربي بالثوم 🌯",
          "is_signature": true,
          "sort_order": 0
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_allosh",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naeem",
          "address_en": "Al Naeem, Jeddah 23526",
          "latitude": 21.6120069,
          "longitude": 39.141214999999995,
          "maps_business_name": "Shawarma Allosh",
          "google_place_id": "ChIJLRdqHBPawxURyAp8xSSJ5oc",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJLRdqHBPawxURyAp8xSSJ5oc",
          "google_rating": 4,
          "google_review_count": 6199,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "shawarma_marmasha",
      "canonical_name": "Shawarma Marmasha",
      "arabic_name": "شاورما مرمشة",
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
      "estimated_spend_min_sar": 10,
      "estimated_spend_max_sar": 24,
      "signature_dish_ar": "شاورما مرمشة بالبلد 🌯",
      "signature_dish_en": "Marmasha Classic Balad Shawarma 🌯",
      "vibe_tags_ar": [
        "تاريخي بالبلد",
        "شاورما أصيلة",
        "نكهة زمان"
      ],
      "vibe_tags_en": [
        "Historic Balad",
        "Authentic Shawarma",
        "Old School Flavor"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "quick_bite"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_balad"
      ],
      "official_website": "https://restaurantguru.com/shawrma-mrmshh-Shawarma-Marmasha-Jeddah",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "Chicken Shawarma",
          "name_ar": "شاورما مرمشة بالبلد 🌯",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Beef Shawarma",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        }
      ],
      "delivery_platforms": {
        "hungerstation": false,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "shawarma_marmasha",
          "branch_name_en": "Al Balad",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_balad",
          "address_en": "F5MP+PRF, Souq Al Alawi, Barhat Naseef, Al Mira Building, Jeddah 22236",
          "latitude": 21.4843238,
          "longitude": 39.1869459,
          "maps_business_name": "Shawarma Marmasha",
          "google_place_id": "ChIJ_1irKTzPwxURUhC34KyNT9o",
          "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ_1irKTzPwxURUhC34KyNT9o",
          "google_rating": 4.6,
          "google_review_count": 186,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _shawarma_catalog);
BEGIN
  -- Verify total brands count = 14
  IF jsonb_array_length(p->'brands') <> 14 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 14 brands';
  END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 14 THEN
    RAISE EXCEPTION 'Duplicate shawarma brand IDs';
  END IF;

  -- Verify total branches count = 48
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 48 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in shawarma branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in shawarma branches';
  END IF;

  -- Verify all branches have non-null coordinates, addresses, maps URLs, and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in shawarma payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Shawarma catalog contains an unknown canonical district'; END IF;

  -- Verify exactly 8 branches outside 30-district canonical whitelist have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 8 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 8 caution branches with null district';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NULL AND (br->>'geographic_notes' IS NULL OR length(trim(br->>'geographic_notes')) = 0)
  ) THEN RAISE EXCEPTION 'Caution branch without geographic notes detected'; END IF;

  -- Verify no place ID belongs to another brand in the existing database
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _shawarma_catalog), brands AS (
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
  false,
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  (b->>'trend_status')::public.trend_status,
  (b->>'trend_confidence')::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-25T00:00:00Z'::timestamptz,
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

-- 2. Cleanup stale best sellers and sources for these 14 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _shawarma_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _shawarma_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _shawarma_catalog), branches AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-25T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _shawarma_catalog), sellers AS (
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
  'Certified Shawarma Pass D dataset signature item',
  '2026-09-25T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _shawarma_catalog), brands AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _shawarma_catalog), branches AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
