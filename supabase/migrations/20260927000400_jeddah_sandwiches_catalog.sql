-- Google-verified Jeddah Sandwiches production catalog.
-- Source: docs/research/jeddah-sandwiches-pass-d-corrected.json
-- 15 approved brands, 28 verified physical branches (26 canonical, 2 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and ratings directly from Google Places / Maps.
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, Shawarma, Saudi Rice, Pizza, or Grills catalogs.
-- Apply after 20260927000200_jeddah_grills_catalog.sql.
BEGIN;

CREATE TEMP TABLE _sandwiches_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _sandwiches_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Sandwiches Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-27",
    "brand_count": 15,
    "branch_count": 28,
    "canonical_branch_count": 26,
    "outer_caution_branch_count": 2
  },
  "brands": [
    {
      "brand_id": "dank_sandwich",
      "canonical_name": "Dank Sandwich",
      "arabic_name": "دانك ساندوتش",
      "categories": [
        "sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "Philadelphia Steak Sandwich",
      "signature_dish_en": "Philadelphia Steak Sandwich",
      "vibe_tags_ar": [
        "ساندوتشات ستيك وبريسكت",
        "توصيل سريع وقوي",
        "سهرات وجوع آخر الليل",
        "خبز طازج"
      ],
      "vibe_tags_en": [
        "Steak & Brisket Sandwiches",
        "Fast Delivery",
        "Late Night Bites",
        "Fresh Bread"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
        "al_marwah",
        "al_samer",
        "al_zahra",
        "ar_rabwah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://order.dank.sa/branches/p?language=en",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "dank_sandwich",
          "branch_name_en": "Samer / Ankara St",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "Dank Sandwich, انقره، السامر، جدة 23464",
          "latitude": 21.587164899999998,
          "longitude": 39.2333711,
          "maps_business_name": "Dank Sandwich",
          "google_place_id": "ChIJRQdts4nRwxURM8RG15LlCxA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRQdts4nRwxURM8RG15LlCxA",
          "google_rating": 4.5,
          "google_review_count": 2303,
          "operating_status": "open",
          "hours": "الأحد: ١١:٠٠ص–٢:٠٠ص",
          "phone": "9200 35553",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dank_sandwich",
          "branch_name_en": "Palm Walk / Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Dank Sandwich, الشيخ عبدالعزيز بن باز، المروة، جدة 23543",
          "latitude": 21.6050309,
          "longitude": 39.209300299999995,
          "maps_business_name": "Dank Sandwich",
          "google_place_id": "ChIJ7RvwfKzRwxUR1cXCQmVe8RA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ7RvwfKzRwxUR1cXCQmVe8RA",
          "google_rating": 4.9,
          "google_review_count": 2706,
          "operating_status": "open",
          "hours": "الأحد: ١١:٠٠ص–٢:٠٠ص",
          "phone": "9200 35553",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dank_sandwich",
          "branch_name_en": "Al Makarunah Rd",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "Dank Sandwich، طريق المكرونة، حي الربوة، جدة 23448",
          "latitude": 21.592215,
          "longitude": 39.1859842,
          "maps_business_name": "Dank Sandwich",
          "google_place_id": "ChIJPd61jeXQwxUR5lNEAkq7c4Y",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJPd61jeXQwxUR5lNEAkq7c4Y",
          "google_rating": 4.6,
          "google_review_count": 14949,
          "operating_status": "open",
          "hours": "الأحد: ١١:٠٠ص–٤:٠٠ص",
          "phone": "9200 35553",
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "dank_sandwich",
          "branch_name_en": "King Abdullah Rd / Sariya Square",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Dank Sandwich, طريق الملك عبدالله، السارية سكوير, جدة 22234",
          "latitude": 21.5100367,
          "longitude": 39.1779943,
          "maps_business_name": "Dank Sandwich",
          "google_place_id": "ChIJITZ92qnPwxURVpMY4-_hGFc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJITZ92qnPwxURVpMY4-_hGFc",
          "google_rating": 4.7,
          "google_review_count": 12921,
          "operating_status": "open",
          "hours": "الأحد: ١١:٠٠ص–٢:٠٠ص; الاثنين: ١١:٠٠ص–٢:٠٠ص; الثلاثاء: ١١:٠٠ص–٢:٠٠ص; الأربعاء: ١١:٠٠ص–٢:٠٠ص; الخميس: ١١:٠٠ص–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١:٠٠م–٢:٠٠ص",
          "phone": "9200 35553",
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Baghdadiyah Al Gharbiyah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "dank_sandwich",
          "branch_name_en": "Sari St",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Dank Sandwich, صاري فرعي، الزهراء، جدة 23424",
          "latitude": 21.573190099999998,
          "longitude": 39.136815,
          "maps_business_name": "Dank Sandwich",
          "google_place_id": "ChIJzTduvpfbwxURx247-Z4QwnU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJzTduvpfbwxURx247-Z4QwnU",
          "google_rating": 4.6,
          "google_review_count": 10151,
          "operating_status": "open",
          "hours": "الأحد: ١١:٠٠ص–٢:٠٠ص",
          "phone": "9200 35553",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Philadelphia Steak Sandwich",
          "name_ar": "Philadelphia Steak Sandwich",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Brisket Sandwich",
          "name_ar": "Brisket Sandwich",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Crispy Chicken Sandwich",
          "name_ar": "Crispy Chicken Sandwich",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "moe_s_sandwiches",
      "canonical_name": "Moe's Sandwiches",
      "arabic_name": null,
      "categories": [
        "sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "ساندوتش مميز",
      "signature_dish_en": "Signature Sandwich",
      "vibe_tags_ar": [
        "ساندوتشات",
        "وجبات خفيفة"
      ],
      "vibe_tags_en": [
        "Sandwiches",
        "Quick Bites"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout"
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
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://linktr.ee/moesrolls",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "moe_s_sandwiches",
          "branch_name_en": "Obhur Al-Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Moe’s Sandwiches (burger, lobster & more), طريق الكورنيش الفرعي، أبحر الشمالية، جدة 23819",
          "latitude": 21.7697239,
          "longitude": 39.1332774,
          "maps_business_name": "Moe's Sandwiches",
          "google_place_id": "ChIJT5QNTX1jwRURpGMTbdXvKlU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJT5QNTX1jwRURpGMTbdXvKlU",
          "google_rating": 4.6,
          "google_review_count": 345,
          "operating_status": "open",
          "hours": "الأحد: ١٠:٠٠ص–٤:٠٠ص; الاثنين: ١٠:٠٠ص–٤:٠٠ص; الثلاثاء: ١٠:٠٠ص–٤:٠٠ص; الأربعاء: ١٠:٠٠ص–٤:٠٠ص; الخميس: ١٠:٠٠ص–٤:٠٠ص; الجمعة: ١٢:٠٠م–٤:٠٠ص; السبت: ١٠:٠٠ص–٤:٠٠ص",
          "phone": "054 273 3066",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Sandwich",
          "name_ar": "ساندوتش مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "sans_sandwich_bar",
      "canonical_name": "SANS Sandwich Bar",
      "arabic_name": null,
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "ساندوتش مميز",
      "signature_dish_en": "Signature Sandwich",
      "vibe_tags_ar": [
        "بار ساندوتشات راقي",
        "فطور وبرانش مميز",
        "شارع صاري",
        "أجواء عصرية مريحة"
      ],
      "vibe_tags_en": [
        "Craft Sandwich Bar",
        "Breakfast & Brunch",
        "Sari Street",
        "Modern Relaxed Ambience"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "quick_bite"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://sans-sb.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sans_sandwich_bar",
          "branch_name_en": "Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "سانس ساندوتش بار، صاري فرعي، الزهراء، جدة 12222",
          "latitude": 21.572612499999998,
          "longitude": 39.1286693,
          "maps_business_name": "SANS Sandwich Bar",
          "google_place_id": "ChIJSWJ-djbbwxURyaw5LiNtXrY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJSWJ-djbbwxURyaw5LiNtXrY",
          "google_rating": 4.6,
          "google_review_count": 1911,
          "operating_status": "open",
          "hours": "الأحد: ٦:٠٠ص–٣:٣٠م; الاثنين: ٦:٠٠ص–٣:٣٠م; الثلاثاء: ٦:٠٠ص–٣:٣٠م; الأربعاء: ٦:٠٠ص–٣:٣٠م; الخميس: ٦:٠٠ص–٣:٣٠م; الجمعة: ٦:٠٠ص–٣:٣٠م; السبت: ٦:٠٠ص–٣:٣٠م",
          "phone": "056 559 3868",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Sandwich",
          "name_ar": "ساندوتش مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "pronto",
      "canonical_name": "Pronto",
      "arabic_name": "برونتو",
      "categories": [
        "sandwiches",
        "italian"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "italian"
      ],
      "subcategories": [
        "italian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "Chicken Pesto Sandwich",
      "signature_dish_en": "Chicken Pesto Sandwich",
      "vibe_tags_ar": [
        "ساندوتشات فوكاشيا إيطالية",
        "تشكن بيستو مميز",
        "الروضة",
        "سريع وخفيف"
      ],
      "vibe_tags_en": [
        "Italian Focaccia Sandwiches",
        "Signature Chicken Pesto",
        "Ar Rawdah",
        "Quick Gourmet Bite"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong"
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
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://ar.restaurantguru.com/Pronto-Jeddah",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "pronto",
          "branch_name_en": "Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Pronto, عبدالله سلطان، الروضة، جدة 23435",
          "latitude": 21.5700579,
          "longitude": 39.1433574,
          "maps_business_name": "Pronto",
          "google_place_id": "ChIJIRIzZGjbwxURiy-tlzxrATQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJIRIzZGjbwxURiy-tlzxrATQ",
          "google_rating": 4.5,
          "google_review_count": 108,
          "operating_status": "open",
          "hours": "الأحد: ٩:٠٠ص–٢:٠٠ص",
          "phone": "053 666 4136",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Chicken Pesto Sandwich",
          "name_ar": "Chicken Pesto Sandwich",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "eleven_inch_sandwich",
      "canonical_name": "Eleven Inch Sandwich",
      "arabic_name": "إيليفن إنش ساندوتش",
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "Cheese Steak",
      "signature_dish_en": "Cheese Steak",
      "vibe_tags_ar": [
        "ساندوتشات عملاقة ١١ إنش",
        "ستيك وواغيو شهي",
        "حي النسيم",
        "وجبات مشبعة"
      ],
      "vibe_tags_en": [
        "Giant 11-Inch Subs",
        "Steak & Wagyu Sandwiches",
        "An Naseem",
        "Hearty Portions"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naseem"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://menubarcode.com/Inch-11",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "eleven_inch_sandwich",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "ايليفن انش ساندوتش، طريق الملك عبدالله، النسيم، جدة 80200",
          "latitude": 21.5107474,
          "longitude": 39.2324485,
          "maps_business_name": "Eleven Inch Sandwich",
          "google_place_id": "ChIJARKW3APPwxURS-ZHjcie-cA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJARKW3APPwxURS-ZHjcie-cA",
          "google_rating": 4.6,
          "google_review_count": 1365,
          "operating_status": "open",
          "hours": "الأحد: ٧:٠٠ص–٤:٠٠ص",
          "phone": "050 163 2050",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Cheese Steak",
          "name_ar": "Cheese Steak",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Wagyu Sandwich",
          "name_ar": "Wagyu Sandwich",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "samoly",
      "canonical_name": "Samoly",
      "arabic_name": "صامولي",
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 10,
      "estimated_spend_max_sar": 25,
      "signature_dish_ar": "Minced Meat Samoli",
      "signature_dish_en": "Minced Meat Samoli",
      "vibe_tags_ar": [
        "صامولي سعودي كلاسيك",
        "كبدة ومفرومة وجبن",
        "فطور وسهرات",
        "سعر اقتصادي شعبي"
      ],
      "vibe_tags_en": [
        "Classic Saudi Samoli",
        "Minced Meat & Liver",
        "Breakfast & Late Night",
        "Popular Budget Bites"
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
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_rawdah",
        "al_safa"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://ananinja.com/sa/en/restaurants/samoly-13187",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "samoly",
          "branch_name_en": "Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "صامولي, الامام مالك، الروضة، جدة 23435",
          "latitude": 21.5735897,
          "longitude": 39.1572174,
          "maps_business_name": "Samoly",
          "google_place_id": "ChIJaVa5Qw7RwxUReQkpzSYpWmI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJaVa5Qw7RwxUReQkpzSYpWmI",
          "google_rating": 3.9,
          "google_review_count": 1759,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة; الاثنين: نعمل على مدار 24 ساعة; الثلاثاء: نعمل على مدار 24 ساعة; الأربعاء: نعمل على مدار 24 ساعة; الخميس: نعمل على مدار 24 ساعة; الجمعة: نعمل على مدار 24 ساعة; السبت: نعمل على مدار 24 ساعة",
          "phone": "053 962 8009",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "samoly",
          "branch_name_en": "Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "صامولي، ام القرى، الصفا، جدة 23454",
          "latitude": 21.577109399999998,
          "longitude": 39.2194832,
          "maps_business_name": "Samoly",
          "google_place_id": "ChIJCRDnWrnRwxURVJIEGKZffLQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCRDnWrnRwxURVJIEGKZffLQ",
          "google_rating": 4,
          "google_review_count": 447,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة; الاثنين: نعمل على مدار 24 ساعة; الثلاثاء: نعمل على مدار 24 ساعة; الأربعاء: نعمل على مدار 24 ساعة; الخميس: نعمل على مدار 24 ساعة; الجمعة: نعمل على مدار 24 ساعة; السبت: نعمل على مدار 24 ساعة",
          "phone": "055 443 9033",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Minced Meat Samoli",
          "name_ar": "Minced Meat Samoli",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Liver Samoli",
          "name_ar": "Liver Samoli",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Chicken Shawarma Samoli",
          "name_ar": "Chicken Shawarma Samoli",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "noho_deli",
      "canonical_name": "Noho Deli",
      "arabic_name": "نوهو ديلي",
      "categories": [
        "sandwiches",
        "deli"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "deli"
      ],
      "subcategories": [
        "deli"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "Pastrami Sandwich",
      "signature_dish_en": "Pastrami Sandwich",
      "vibe_tags_ar": [
        "ديلي على الطريقة النيويوركية",
        "باسترامي مدخن فاخر",
        "إس سكوير الشاطئ",
        "أجواء راقية"
      ],
      "vibe_tags_en": [
        "New York Style Deli",
        "Smoked Pastrami & Deli Meats",
        "S Square Ash Shati",
        "Chic Casual"
      ],
      "reputation_tags": [
        "rising"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_shati"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://restaurantguru.com/Noho-Deli-nwhw-dyly-Jeddah",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "noho_deli",
          "branch_name_en": "S Square",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Noho Deli / نوهو ديلي, S Square اس سكوير, 7750 شارع حراء، الشاطئ، 3362, جدة 23514",
          "latitude": 21.605985,
          "longitude": 39.118550299999995,
          "maps_business_name": "Noho Deli",
          "google_place_id": "ChIJp9XOFwDbwxUREWkSCESNIt4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJp9XOFwDbwxUREWkSCESNIt4",
          "google_rating": 4.6,
          "google_review_count": 590,
          "operating_status": "open",
          "hours": "الأحد: ١١:٣٠ص–٢:٠٠ص",
          "phone": "055 543 1176",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pastrami Sandwich",
          "name_ar": "Pastrami Sandwich",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "sandwicheina",
      "canonical_name": "Sandwicheina",
      "arabic_name": "ساندوتشينا",
      "categories": [
        "sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "Philly Steak Sandwich",
      "signature_dish_en": "Philly Steak Sandwich",
      "vibe_tags_ar": [
        "ساندوتشات ساخنة سريعة",
        "فيلي ستيك وبيستو وروبيان",
        "توصيل قوي وسفري",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Hot Gourmet Subs",
        "Philly Steak & Shrimp",
        "Strong Delivery",
        "Late Night Classic"
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
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_marwah",
        "al_rawdah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://hungerstation.com/sa-en/restaurant/jeddah/ar-rawdah/111824",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sandwicheina",
          "branch_name_en": "Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "ساندوتشينا | sandwicheina، حمد الجاسر، الروضة، جدة 23435",
          "latitude": 21.5727199,
          "longitude": 39.1577013,
          "maps_business_name": "Sandwicheina",
          "google_place_id": "ChIJadIIYR3RwxURrOhYVSObvQw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJadIIYR3RwxURrOhYVSObvQw",
          "google_rating": 4.7,
          "google_review_count": 1729,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة",
          "phone": "050 992 1848",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sandwicheina",
          "branch_name_en": "Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "ساندوتشينا | sandwicheina، 6574 الشيخ عبدالعزيز بن باز، حي المروة، JDMC4810، 4810، جدة 23543",
          "latitude": 21.605128,
          "longitude": 39.209199,
          "maps_business_name": "Sandwicheina",
          "google_place_id": "ChIJEdyVCADRwxURqOAAxIE__m0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJEdyVCADRwxURqOAAxIE__m0",
          "google_rating": 4.8,
          "google_review_count": 145,
          "operating_status": "open",
          "hours": null,
          "phone": "056 044 7096",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sandwicheina",
          "branch_name_en": "Obhur Al-Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "ساندوتشينا | sandwicheina، شارع عابر القرات، أبحر الشمالية، جدة 23817",
          "latitude": 21.7601029,
          "longitude": 39.1180343,
          "maps_business_name": "Sandwicheina",
          "google_place_id": "ChIJJ411yNFjwRUR-0hhKOF9Vnw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJ411yNFjwRUR-0hhKOF9Vnw",
          "google_rating": 4.7,
          "google_review_count": 787,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة",
          "phone": "056 419 0525",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Philly Steak Sandwich",
          "name_ar": "Philly Steak Sandwich",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Pesto Sandwich",
          "name_ar": "Chicken Pesto Sandwich",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Shrimp Sandwich",
          "name_ar": "Shrimp Sandwich",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "charleys_cheesesteaks",
      "canonical_name": "Charleys Cheesesteaks",
      "arabic_name": null,
      "categories": [
        "sandwiches",
        "cheesesteak"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "cheesesteak"
      ],
      "subcategories": [
        "cheesesteak"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "Philly Cheesesteak",
      "signature_dish_en": "Philly Cheesesteak",
      "vibe_tags_ar": [
        "فيلي ستيك أصلي مشوي",
        "مول العرب",
        "سريع واقتصادي",
        "سلسلة عالمية"
      ],
      "vibe_tags_en": [
        "Authentic Philly Cheesesteaks",
        "Mall of Arabia",
        "Quick Casual Subs",
        "Global Franchise"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong"
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
        "an_nuzhah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.charleys.com/locations/mall-of-arabia/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "charleys_cheesesteaks",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "شارليز فيلي ستيكس، First Level Food Court, جدة",
          "latitude": 21.632105,
          "longitude": 39.1560473,
          "maps_business_name": "Charleys Cheesesteaks",
          "google_place_id": "ChIJ0e_UP1bXwxUR831p-z5Uo6Y",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ0e_UP1bXwxUR831p-z5Uo6Y",
          "google_rating": 3.5,
          "google_review_count": 386,
          "operating_status": "open",
          "hours": "الأحد: ١٠:٠٠ص–١٢:٠٠ص",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Philly Cheesesteak",
          "name_ar": "Philly Cheesesteak",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "fat_steaks",
      "canonical_name": "Fat Steaks",
      "arabic_name": "فات ستيك",
      "categories": [
        "sandwiches",
        "cheesesteak"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "cheesesteak"
      ],
      "subcategories": [
        "cheesesteak"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "Beef Cheesesteak",
      "signature_dish_en": "Beef Cheesesteak",
      "vibe_tags_ar": [
        "تشيز ستيك غني بالجبن",
        "الحمدانية",
        "سريع ومشبع",
        "سهرات وجوع الليل"
      ],
      "vibe_tags_en": [
        "Loaded Cheesesteaks",
        "Al Hamadaniyyah",
        "Generous & Hearty",
        "Late Night Craving"
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
        "al_hamdaniyah"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://maps.yango.com/org/13047867617/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "fat_steaks",
          "branch_name_en": "Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "fat steaks - فات ستيك الحمدانية, شارع عبدالله بن أبي أمية، الحمدانية، جدة 23761",
          "latitude": 21.7659465,
          "longitude": 39.1813143,
          "maps_business_name": "Fat Steaks",
          "google_place_id": "ChIJO1BBbiB9wRUR7eJSx8_GHww",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJO1BBbiB9wRUR7eJSx8_GHww",
          "google_rating": 4.2,
          "google_review_count": 88,
          "operating_status": "open",
          "hours": "الأحد: ١٢:٣٠م–٢:٠٠ص; الاثنين: ١٢:٣٠م–٢:٠٠ص; الثلاثاء: ١٢:٣٠م–٢:٠٠ص; الأربعاء: ١٢:٣٠م–٢:٠٠ص; الخميس: ١٢:٣٠م–٢:٠٠ص; الجمعة: ١:٠٠م–٢:٠٠ص; السبت: ١٢:٣٠م–٢:٠٠ص",
          "phone": "054 551 6491",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Beef Cheesesteak",
          "name_ar": "Beef Cheesesteak",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Cheesesteak",
          "name_ar": "Chicken Cheesesteak",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "1610_bagel",
      "canonical_name": "1610 Bagel",
      "arabic_name": null,
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "ساندوتش مميز",
      "signature_dish_en": "Signature Sandwich",
      "vibe_tags_ar": [
        "بيجل نيويوركي مخبوز طازج",
        "ساندوتشات فطور مميزة",
        "الزهراء",
        "أجواء قهوة وفطور"
      ],
      "vibe_tags_en": [
        "Freshly Baked Artisan Bagels",
        "Breakfast Bagel Sandwiches",
        "Al Zahra",
        "Morning Coffee Ambience"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "quick_bite"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.waze.com/live-map/directions/sa/makkah-province/jeddah/1610-bagel?to=place.ChIJY2XrAjvbwxURZ90q153nR-c",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "1610_bagel",
          "branch_name_en": "Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "1610 Bagel ١٦١٠ بيجل، البترجي، الزهراء، جدة 23522",
          "latitude": 21.5984135,
          "longitude": 39.124013,
          "maps_business_name": "1610 Bagel",
          "google_place_id": "ChIJY2XrAjvbwxURZ90q153nR-c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJY2XrAjvbwxURZ90q153nR-c",
          "google_rating": 4.5,
          "google_review_count": 1414,
          "operating_status": "open",
          "hours": "الأحد: ٧:٣٠ص–١٢:٠٠ص",
          "phone": "055 030 1610",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Sandwich",
          "name_ar": "ساندوتش مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "early_club",
      "canonical_name": "Early Club",
      "arabic_name": null,
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "Chicken Pesto Sandwich",
      "signature_dish_en": "Chicken Pesto Sandwich",
      "vibe_tags_ar": [
        "نادي فطور وبرانش شهير",
        "سكاي ووك الروضة",
        "ساندوتشات بيستو وبيض",
        "جلسات عصرية مبهجة"
      ],
      "vibe_tags_en": [
        "Famous Breakfast & Brunch Club",
        "Skywalk Ar Rawdah",
        "Gourmet Brunch Sandwiches",
        "Vibrant Ambience"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout"
      ],
      "time_slots": [
        "breakfast",
        "lunch"
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
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.waze.com/live-map/directions/sa/mkh-almkrmh/jdh/early-club-breakfast-and-brunch?to=place.ChIJZfHPm77bwxUR8DaEe-n2emM",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "early_club",
          "branch_name_en": "Skywalk / Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "ايرلي كلوب، Abdul Maqsud Khojah, AR Rawdah, skywalk, جدة 23435",
          "latitude": 21.5746839,
          "longitude": 39.148241,
          "maps_business_name": "Early Club",
          "google_place_id": "ChIJZfHPm77bwxUR8DaEe-n2emM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJZfHPm77bwxUR8DaEe-n2emM",
          "google_rating": 4.6,
          "google_review_count": 9763,
          "operating_status": "open",
          "hours": "الأحد: ٧:٠٠ص–٤:٣٠م; الاثنين: ٧:٠٠ص–٤:٣٠م; الثلاثاء: ٧:٠٠ص–٤:٣٠م; الأربعاء: ٧:٠٠ص–٤:٣٠م; الخميس: ٧:٠٠ص–٤:٣٠م; الجمعة: ٧:٠٠ص–٤:٣٠م; السبت: ٧:٠٠ص–٤:٣٠م",
          "phone": "053 167 7755",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Chicken Pesto Sandwich",
          "name_ar": "Chicken Pesto Sandwich",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "club_sandwich_bowl",
      "canonical_name": "Club Sandwich & Bowl",
      "arabic_name": "كلوب ساندويش اند بول",
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "Beef Steak & Egg Sandwich",
      "signature_dish_en": "Beef Steak & Egg Sandwich",
      "vibe_tags_ar": [
        "ساندوتشات",
        "وجبات خفيفة"
      ],
      "vibe_tags_en": [
        "Sandwiches",
        "Quick Bites"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "dine_in_strong",
        "quick_bite"
      ],
      "time_slots": [
        "breakfast",
        "lunch",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://www.arabnews.com/food-health/where-we-are-going-today-club-sandwich-bowl-in-jeddah-2646701",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "club_sandwich_bowl",
          "branch_name_en": "Al Ned / Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "CLUB SANDWICH & BOWL | كلوب ساندويش اند بول, الند، Street, جدة 23425",
          "latitude": 21.5816286,
          "longitude": 39.1300035,
          "maps_business_name": "Club Sandwich & Bowl",
          "google_place_id": "ChIJRfQRMDfbwxURHtAqwXSF65I",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRfQRMDfbwxURHtAqwXSF65I",
          "google_rating": 4.7,
          "google_review_count": 6450,
          "operating_status": "open",
          "hours": "الأحد: ٧:٠٠ص–٢:٣٠ص; الاثنين: ٧:٠٠ص–٢:٣٠ص; الثلاثاء: ٧:٠٠ص–٢:٣٠ص; الأربعاء: ٧:٠٠ص–٢:٣٠ص; الخميس: ٧:٠٠ص–٢:٣٠ص; الجمعة: ٧:٠٠ص–٢:٣٠ص; السبت: ٧:٠٠ص–٢:٣٠ص",
          "phone": "050 095 7596",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Beef Steak & Egg Sandwich",
          "name_ar": "Beef Steak & Egg Sandwich",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "zed",
      "canonical_name": "ZED",
      "arabic_name": "زد",
      "categories": [
        "sandwiches",
        "breakfast_sandwiches"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "breakfast_sandwiches"
      ],
      "subcategories": [
        "breakfast_sandwiches"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 35,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "ساندوتش مميز",
      "signature_dish_en": "Signature Sandwich",
      "vibe_tags_ar": [
        "كافيه وساندوتشات عصرية",
        "فطور وسناكس خفيفة",
        "فروع متعددة بجدة",
        "أجواء رايقة وسريعة"
      ],
      "vibe_tags_en": [
        "Modern Cafe & Sandwiches",
        "Breakfast & Casual Bites",
        "Multiple Jeddah Locations",
        "Chic & Quick"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_andalus",
        "al_khalidiyyah",
        "al_naeem"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://linktr.ee/zed.ksa",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "zed",
          "branch_name_en": "Obhur Al-Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "زد، شارع عابر القرات، أبحر الشمالية، جدة 23817",
          "latitude": 21.7599494,
          "longitude": 39.118135599999995,
          "maps_business_name": "ZED",
          "google_place_id": "ChIJnV2AdBNjwRUR2LlJt59ibL8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJnV2AdBNjwRUR2LlJt59ibL8",
          "google_rating": 4.3,
          "google_review_count": 449,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة; الاثنين: نعمل على مدار 24 ساعة; الثلاثاء: نعمل على مدار 24 ساعة; الأربعاء: نعمل على مدار 24 ساعة; الخميس: نعمل على مدار 24 ساعة; الجمعة: نعمل على مدار 24 ساعة; السبت: نعمل على مدار 24 ساعة",
          "phone": "055 669 0488",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "zed",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "زد | ZED, شارع عرفات، الأندلس، جدة 23325",
          "latitude": 21.5383279,
          "longitude": 39.1648705,
          "maps_business_name": "ZED",
          "google_place_id": "ChIJMdC5X0_PwxURF29N6TaqLjw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJMdC5X0_PwxURF29N6TaqLjw",
          "google_rating": 4,
          "google_review_count": 134,
          "operating_status": "open",
          "hours": "الأحد: ٦:٠٠ص–٢:٠٠ص; الاثنين: ٦:٠٠ص–٢:٠٠ص; الثلاثاء: ٦:٠٠ص–٢:٠٠ص; الأربعاء: ٦:٠٠ص–٢:٠٠ص; الخميس: ٦:٠٠ص–٢:٠٠ص; الجمعة: ٦:٠٠ص–٢:٠٠ص; السبت: ٦:٠٠ص–٢:٠٠ص",
          "phone": "055 662 2748",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "zed",
          "branch_name_en": "Al Khalidiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "H44G+6W2 زد | ZED، الخالدية، فقيه ميديكال، جدة 23421",
          "latitude": 21.5555625,
          "longitude": 39.127312499999995,
          "maps_business_name": "ZED",
          "google_place_id": "ChIJtyn29qLbwxURn2VL4fnCSKU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJtyn29qLbwxURn2VL4fnCSKU",
          "google_rating": 4.4,
          "google_review_count": 33,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة",
          "phone": "054 105 6162",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "zed",
          "branch_name_en": "An Naim",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "زِد النعيم، 7644, An Naim District, Jeddah 23621 3649, جدة 23621",
          "latitude": 21.6374805,
          "longitude": 39.141722699999995,
          "maps_business_name": "ZED",
          "google_place_id": "ChIJqfnnSInZwxURdxpmaNh3pMM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJqfnnSInZwxURdxpmaNh3pMM",
          "google_rating": 4.3,
          "google_review_count": 3069,
          "operating_status": "open",
          "hours": "الأحد: نعمل على مدار 24 ساعة",
          "phone": "055 994 0448",
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Sandwich",
          "name_ar": "ساندوتش مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "pizzawich",
      "canonical_name": "Pizzawich",
      "arabic_name": "بيتزاويتش",
      "categories": [
        "sandwiches",
        "pizza"
      ],
      "primary_category": "sandwiches",
      "secondary_categories": [
        "pizza"
      ],
      "subcategories": [
        "pizza"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "Ranch Pizzawich",
      "signature_dish_en": "Ranch Pizzawich",
      "vibe_tags_ar": [
        "ابتكار بيتزا وساندوتش",
        "رانش وديناميت مميز",
        "سريع وسفري",
        "فروع متعددة بجدة"
      ],
      "vibe_tags_en": [
        "Pizza-Sandwich Hybrid",
        "Signature Ranch & Dynamite",
        "Fast Casual Takeaway",
        "Multi-District Presence"
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
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_marwah",
        "al_murjan",
        "al_naseem"
      ],
      "delivery_platforms": [
        "jahez",
        "hungerstation"
      ],
      "official_website": "https://pizzawich.sa/branches",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "pizzawich",
          "branch_name_en": "Al Murjan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "مطعم بيتزاويتش، المرجان، جدة 23714",
          "latitude": 21.6942092,
          "longitude": 39.1043861,
          "maps_business_name": "Pizzawich",
          "google_place_id": "ChIJpRsTZlfZwxURnI1MPGfVAvI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJpRsTZlfZwxURnI1MPGfVAvI",
          "google_rating": 4.8,
          "google_review_count": 1108,
          "operating_status": "open",
          "hours": "الأحد: ١:٠٠م–٤:٠٠ص",
          "phone": "056 470 1560",
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizzawich",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "بيتزاويتش، Al Marwah, Ibrahim Mohamed Abdel Wahab St, جدة 23545",
          "latitude": 21.6138904,
          "longitude": 39.2183373,
          "maps_business_name": "Pizzawich",
          "google_place_id": "ChIJL8FPNMbXwxURj-pHuAqD7Sc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJL8FPNMbXwxURj-pHuAqD7Sc",
          "google_rating": 4.8,
          "google_review_count": 3214,
          "operating_status": "open",
          "hours": "الأحد: ٥:٣٠م–٤:٠٠ص",
          "phone": "056 609 5110",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizzawich",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "بيتزاويتش, district, Alnasim st, Albasim, جدة 23342",
          "latitude": 21.5150939,
          "longitude": 39.2238116,
          "maps_business_name": "Pizzawich",
          "google_place_id": "ChIJ62Hukw3PwxURZI9WufUj7ho",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ62Hukw3PwxURZI9WufUj7ho",
          "google_rating": 4.9,
          "google_review_count": 2119,
          "operating_status": "open",
          "hours": "الأحد: ٥:٣٠م–٤:٠٠ص",
          "phone": "056 609 5110",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "pizzawich",
          "branch_name_en": "Al Wurud",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "بيتزاويتش, الورود، 6754 الورود، 2891, جدة 23225",
          "latitude": 21.522256199999998,
          "longitude": 39.2109702,
          "maps_business_name": "Pizzawich",
          "google_place_id": "ChIJRZEtXgDPwxURInrHxy0NkME",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRZEtXgDPwxURInrHxy0NkME",
          "google_rating": 4.8,
          "google_review_count": 109,
          "operating_status": "open",
          "hours": "الأحد: ٥:٣٠م–٣:٠٠ص; الاثنين: ٥:٣٠م–٣:٠٠ص; الثلاثاء: ٥:٣٠م–٣:٠٠ص; الأربعاء: ٥:٣٠م–٣:٠٠ص; الخميس: ٥:٠٠م–٤:٠٠ص; الجمعة: ٥:٠٠م–٤:٠٠ص; السبت: ٥:٣٠م–٣:٠٠ص",
          "phone": "056 609 5110",
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Wurud'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Ranch Pizzawich",
          "name_ar": "Ranch Pizzawich",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Dynamite Chicken Pizzawich",
          "name_ar": "Dynamite Chicken Pizzawich",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Pepperoni Pizzawich",
          "name_ar": "Pepperoni Pizzawich",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _sandwiches_catalog;
  
  -- Verify brand count is exactly 15
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 15 THEN
    RAISE EXCEPTION 'Sandwiches catalog must contain exactly 15 brands';
  END IF;

  -- Verify branch count is exactly 28
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 28 THEN
    RAISE EXCEPTION 'Sandwiches catalog must contain exactly 28 branches';
  END IF;

  -- Verify canonical branch count is 26
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 26 THEN
    RAISE EXCEPTION 'Sandwiches catalog must contain exactly 26 canonical branches';
  END IF;

  -- Verify outer caution branch count is 2
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 2 THEN
    RAISE EXCEPTION 'Sandwiches catalog must contain exactly 2 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Sandwiches catalog contains an unknown canonical district'; END IF;

  -- Verify all caution branches have non-null geographic notes
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
WITH catalog AS (SELECT payload FROM _sandwiches_catalog), brands AS (
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
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 2:00 ص' END,
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
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-27T00:00:00Z'::timestamptz,
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

-- 2. Cleanup stale best sellers and sources for these 15 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _sandwiches_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _sandwiches_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _sandwiches_catalog), branches AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-27T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _sandwiches_catalog), sellers AS (
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
  'Certified Sandwiches Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _sandwiches_catalog), brands AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _sandwiches_catalog), branches AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
