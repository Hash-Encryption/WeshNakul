-- Google-verified Jeddah Indian production catalog.
-- Source: docs/research/jeddah-indian-pass-d-corrected.json
-- 13 approved brands, 14 verified physical branches (12 canonical, 2 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and ratings directly from Google Places / Maps.
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, Shawarma, Saudi Rice, Pizza, or Grills catalogs.
-- Apply after 20260927000200_jeddah_grills_catalog.sql.
BEGIN;

-- 0. Clean legacy orphan placeholders if present without branches
DELETE FROM public.restaurants WHERE id = 'shezan' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'shezan'
);
DELETE FROM public.restaurants WHERE id = 'zaikaki' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'zaikaki'
);
DELETE FROM public.restaurants WHERE id = 'makan_indian' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'makan_indian'
);
DELETE FROM public.restaurants WHERE id = 'copper_chandni' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'copper_chandni'
);
DELETE FROM public.restaurants WHERE id = 'baba_khan' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'baba_khan'
);

CREATE TEMP TABLE _indian_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _indian_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Indian Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-27",
    "brand_count": 13,
    "branch_count": 14,
    "canonical_branch_count": 12,
    "outer_caution_branch_count": 2
  },
  "brands": [
    {
      "brand_id": "makan_indian_restaurant",
      "canonical_name": "Makan Indian Restaurant",
      "arabic_name": "مطعم مكان الهندي",
      "categories": [
        "indian",
        "modern_indian",
        "north_indian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "modern_indian",
        "north_indian"
      ],
      "subcategories": [
        "modern_indian",
        "north_indian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "butter chicken",
      "signature_dish_en": "butter chicken",
      "vibe_tags_ar": [
        "أطباق هندية معاصرة",
        "أجواء عائلية راقية",
        "دجاج تكا مسالا وبرياني",
        "جلسات مميزة"
      ],
      "vibe_tags_en": [
        "Contemporary Indian",
        "Fine Family Ambience",
        "Butter Chicken & Biryani",
        "Chic Dining"
      ],
      "reputation_tags": [
        "mainstream"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_khalidiyyah"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://instagram.com/makan1_sa",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "makan_indian_restaurant",
          "branch_name_en": "Al Khalidiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Al Khalidiyyah, Jeddah 23874, Saudi Arabia",
          "latitude": 21.5493026,
          "longitude": 39.1390245,
          "maps_business_name": "Makan Indian Restaurant",
          "google_place_id": "ChIJ_WMxD-HFwxUR7VwJZkMXLc0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_WMxD-HFwxUR7VwJZkMXLc0",
          "google_rating": 4.7,
          "google_review_count": 13539,
          "operating_status": "open",
          "hours": "Sun-Wed 13:00-01:00; Thu-Fri 13:30-01:30; Sat 13:00-01:00",
          "phone": "+966573514100",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "butter chicken",
          "name_ar": "butter chicken",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "garlic naan",
          "name_ar": "garlic naan",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "the_bay_indian_restaurant",
      "canonical_name": "The Bay Indian Restaurant",
      "arabic_name": "مطعم ذا باي الهندي",
      "categories": [
        "indian",
        "modern_indian",
        "north_indian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "modern_indian",
        "north_indian"
      ],
      "subcategories": [
        "modern_indian",
        "north_indian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "butter chicken",
      "signature_dish_en": "butter chicken",
      "vibe_tags_ar": [
        "مطعم هندي عصري",
        "برياني بولز ودجاج زبدة",
        "جلسات شبابية وعائلية",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Modern Indian",
        "Biryani Balls & Butter Chicken",
        "Lively Ambience",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_andalus",
        "al_bawadi"
      ],
      "delivery_platforms": {
        "hungerstation": "yes",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.instagram.com/thebayrestaurant_jed/",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "the_bay_indian_restaurant",
          "branch_name_en": "Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Qouraish, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.5990463,
          "longitude": 39.165409,
          "maps_business_name": "The Bay Indian Restaurant",
          "google_place_id": "ChIJC6SL88TRwxUR25AMKn7mMr4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJC6SL88TRwxUR25AMKn7mMr4",
          "google_rating": 4.5,
          "google_review_count": 7586,
          "operating_status": "open",
          "hours": "Sun-Sat 13:00-02:00",
          "phone": "+966567376165",
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "the_bay_indian_restaurant",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5491491,
          "longitude": 39.1646313,
          "maps_business_name": "The Bay Indian Restaurant",
          "google_place_id": "ChIJG0Wz5jBjwRURpr1SlkRQYBc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJG0Wz5jBjwRURpr1SlkRQYBc",
          "google_rating": 4.6,
          "google_review_count": 3482,
          "operating_status": "open",
          "hours": "Sun-Sat 13:00-02:00",
          "phone": "+966567376168",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "butter chicken",
          "name_ar": "butter chicken",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "biryani balls",
          "name_ar": "biryani balls",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Kashmiri naan",
          "name_ar": "Kashmiri naan",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "biryani_gate_restaurant",
      "canonical_name": "Biryani Gate Restaurant Jeddah",
      "arabic_name": "مطعم برياني كيت",
      "categories": [
        "indian",
        "biryani",
        "north_indian",
        "mughlai",
        "pakistani_influenced"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "biryani",
        "north_indian",
        "mughlai",
        "pakistani_influenced"
      ],
      "subcategories": [
        "biryani",
        "north_indian",
        "mughlai",
        "pakistani_influenced"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "Lucknowi mutton biryani",
      "signature_dish_en": "Lucknowi mutton biryani",
      "vibe_tags_ar": [
        "مختص برياني لكهنوي وسندي",
        "برياني لحم ودجاج فاخر",
        "توصيل وسفري سريع",
        "وجبات اقتصادية"
      ],
      "vibe_tags_en": [
        "Lucknowi & Sindhi Biryani Specialist",
        "Mutton & Chicken Biryani",
        "Fast Delivery & Takeaway",
        "Great Value"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_aziziyah"
      ],
      "delivery_platforms": {
        "hungerstation": "yes",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://hungerstation.com/sa-en/restaurant/jeddah/jeddah-islamic-seaport/106255",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "biryani_gate_restaurant",
          "branch_name_en": "Al Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "Ghernatah, Aziziyah, Jeddah 23342, Saudi Arabia",
          "latitude": 21.5479962,
          "longitude": 39.2105702,
          "maps_business_name": "Biryani Gate Restaurant Jeddah",
          "google_place_id": "ChIJhSncBYTRwxURLDY6wB34Few",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhSncBYTRwxURLDY6wB34Few",
          "google_rating": 4.7,
          "google_review_count": 2150,
          "operating_status": "open",
          "hours": "Sun-Thu 12:30-16:00, 18:30-01:00; Fri 13:00-16:00, 18:30-01:00; Sat 12:30-16:00, 18:30-01:00",
          "phone": "+966551458442",
          "geographic_notes": "Located in canonical district al_aziziyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Lucknowi mutton biryani",
          "name_ar": "Lucknowi mutton biryani",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lucknowi chicken biryani",
          "name_ar": "Lucknowi chicken biryani",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Sindhi chicken biryani",
          "name_ar": "Sindhi chicken biryani",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "jewel_of_nizam",
      "canonical_name": "Jewel of Nizam Restaurant",
      "arabic_name": "مطعم جويل اوف نظام جدة",
      "categories": [
        "indian",
        "hyderabadi",
        "nizami",
        "modern_indian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "hyderabadi",
        "nizami",
        "modern_indian"
      ],
      "subcategories": [
        "hyderabadi",
        "nizami",
        "modern_indian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "برياني مميز",
      "signature_dish_en": "Special Biryani",
      "vibe_tags_ar": [
        "مأكولات حيدر أبادية ونظامية",
        "برياني حيدر أبادي أصيل",
        "جلسات عائلية مريحة",
        "نكهات هندية غنية"
      ],
      "vibe_tags_en": [
        "Hyderabadi & Nizami Heritage",
        "Authentic Dum Biryani",
        "Family Friendly",
        "Rich Indian Flavors"
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
        "al_rehab"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "jewel_of_nizam",
          "branch_name_en": "Al Rehab",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rehab",
          "address_en": "Dallah, Al-Rehab, Jeddah 23344, Saudi Arabia",
          "latitude": 21.5535737,
          "longitude": 39.2206408,
          "maps_business_name": "Jewel of Nizam Restaurant",
          "google_place_id": "ChIJXcKq8fbRwxURINqXN7GzOME",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXcKq8fbRwxURINqXN7GzOME",
          "google_rating": 4.7,
          "google_review_count": 3525,
          "operating_status": "open",
          "hours": "Sun-Sat 12:30-01:00",
          "phone": "+966502677811",
          "geographic_notes": "Located in canonical district al_rehab.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Special Biryani",
          "name_ar": "برياني مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "indira_indian_restaurant",
      "canonical_name": "Indira Indian Restaurant",
      "arabic_name": "مطعم انديرا الهندي",
      "categories": [
        "indian",
        "north_indian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "north_indian"
      ],
      "subcategories": [
        "north_indian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "برياني مميز",
      "signature_dish_en": "Special Biryani",
      "vibe_tags_ar": [
        "أكلات شمال الهند اللذيذة",
        "أجواء دافئة وعائلية",
        "مخبوزات نان ومشاوي تندوري",
        "تقييمات عالية"
      ],
      "vibe_tags_en": [
        "North Indian Specialties",
        "Warm Family Setting",
        "Fresh Naan & Tandoori",
        "High Rated"
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
        "al_naseem"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "indira_indian_restaurant",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "G66J+CJF, An Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.5110651,
          "longitude": 39.2315293,
          "maps_business_name": "Indira Indian Restaurant",
          "google_place_id": "ChIJQzAsXwDPwxUR1diGfSJc9nY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQzAsXwDPwxUR1diGfSJc9nY",
          "google_rating": 4.8,
          "google_review_count": 1149,
          "operating_status": "open",
          "hours": "Sun-Sat 14:00-02:00",
          "phone": "+966573653991",
          "geographic_notes": "Located in canonical district al_naseem. Google formatted address uses Plus Code format G66J+CJF; exact coordinates safely resolved.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Special Biryani",
          "name_ar": "برياني مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "the_spice_route",
      "canonical_name": "The Spice Route-Indian Cuisine",
      "arabic_name": "ذي سبايس روت - مطعم هندي",
      "categories": [
        "indian",
        "modern_indian",
        "hotel_dining"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "modern_indian",
        "hotel_dining"
      ],
      "subcategories": [
        "modern_indian",
        "hotel_dining"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 85,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "برياني مميز",
      "signature_dish_en": "Special Biryani",
      "vibe_tags_ar": [
        "أطباق هندية راقية بفندق سنست",
        "ضيافة فندقية فاخرة",
        "أجواء رومانسية وهادئة",
        "نكهات بهارات مميزة"
      ],
      "vibe_tags_en": [
        "Upscale Hotel Dining at Sunset Jeddah",
        "Fine Hospitality",
        "Serene & Romantic",
        "Exquisite Spices"
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
        "al_rawdah"
      ],
      "delivery_platforms": {
        "hungerstation": "yes",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://www.sunsetjeddah.com/dining",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "the_spice_route",
          "branch_name_en": "Sunset Jeddah / Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Sunset Jeddah, Prince Saud Al Faisal, Ar Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.5636436,
          "longitude": 39.1691414,
          "maps_business_name": "The Spice Route-Indian Cuisine",
          "google_place_id": "ChIJT_szx-fRwxURf80w0Ffpgbs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJT_szx-fRwxURf80w0Ffpgbs",
          "google_rating": 4.9,
          "google_review_count": 582,
          "operating_status": "open",
          "hours": "Sun-Mon 13:00-23:30; Tue closed; Wed-Sat 13:00-23:30",
          "phone": "+966569503289",
          "geographic_notes": "Located in canonical district al_rawdah at Sunset Jeddah. Published official venue schedule (Tuesday closed) is retained; live Maps listing showed Tuesday hours (noted).",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Special Biryani",
          "name_ar": "برياني مميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "rasoi_by_vineet",
      "canonical_name": "Rasoi by Vineet",
      "arabic_name": "راسوي باي فينيت",
      "categories": [
        "indian",
        "modern_indian",
        "fine_dining"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "modern_indian",
        "fine_dining"
      ],
      "subcategories": [
        "modern_indian",
        "fine_dining"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 85,
      "estimated_spend_max_sar": 220,
      "signature_dish_ar": "Murg Makhni",
      "signature_dish_en": "Murg Makhni",
      "vibe_tags_ar": [
        "مطعم شيف عالمي حائز على ميشلان",
        "فاين داينينغ هندي استثنائي",
        "قوائم تذوق فاخرة",
        "أناقة وضيافة راقية"
      ],
      "vibe_tags_en": [
        "Michelin-Pedigree Chef Dining",
        "Ultra Fine Indian Dining",
        "Chef Tasting Menus",
        "Chic & Luxurious"
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
        "al_andalus"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://rasoibyvineetjeddah.com/",
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "rasoi_by_vineet",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "8749 Hael, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5479073,
          "longitude": 39.156472,
          "maps_business_name": "Rasoi by Vineet",
          "google_place_id": "ChIJSWgB4VDRwxURD-6jnv_lTqs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJSWgB4VDRwxURD-6jnv_lTqs",
          "google_rating": 4.4,
          "google_review_count": 439,
          "operating_status": "open",
          "hours": "Sun closed; Mon-Thu 13:00-00:00; Fri-Sat 13:00-01:00",
          "phone": "+966122132000",
          "geographic_notes": "Located in canonical district al_andalus. Official site hours are used; split-service lunch/dinner windows noted from Maps listing.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Murg Makhni",
          "name_ar": "Murg Makhni",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Nawabi Chops",
          "name_ar": "Nawabi Chops",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Lamb Biryani",
          "name_ar": "Lamb Biryani",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Raan Mussallam",
          "name_ar": "Raan Mussallam",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "chennai_darbar_aziziyah",
      "canonical_name": "Chennai Darbar Restaurant Aziziyah",
      "arabic_name": "مطعم الديوان للمأكولات الهندية",
      "categories": [
        "indian",
        "south_indian",
        "indian_chinese",
        "vegetarian_friendly"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "south_indian",
        "indian_chinese",
        "vegetarian_friendly"
      ],
      "subcategories": [
        "south_indian",
        "indian_chinese",
        "vegetarian_friendly"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "dosa",
      "signature_dish_en": "dosa",
      "vibe_tags_ar": [
        "أيقونة المأكولات الهندية والجنوبية",
        "دوسا وإدلي وتيفين صباحي",
        "وجبات سريعة واقتصادية",
        "شعبية جارفة"
      ],
      "vibe_tags_en": [
        "Legendary South Indian & Tiffin",
        "Crispy Dosa & Fresh Idli",
        "Affordable & Fast Casual",
        "Jeddah Staple"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "casual_hangout"
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
        "al_aziziyah"
      ],
      "delivery_platforms": {
        "hungerstation": "yes",
        "jahez": "yes",
        "keeta": "unknown"
      },
      "official_website": "https://chennaidarbar.com/",
      "research_use": "production_ready",
      "serves_breakfast_menu": true,
      "branches": [
        {
          "restaurant_id": "chennai_darbar_aziziyah",
          "branch_name_en": "Al Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "As Sahafa St, Aziziyah, Jeddah 23342, Saudi Arabia",
          "latitude": 21.5527535,
          "longitude": 39.2089402,
          "maps_business_name": "Chennai Darbar Restaurant Aziziyah",
          "google_place_id": "ChIJF8HaYbjRwxUR6BJAUQ6Sqb8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJF8HaYbjRwxUR6BJAUQ6Sqb8",
          "google_rating": 4.2,
          "google_review_count": 14450,
          "operating_status": "open",
          "hours": "Sun-Sat 07:30-00:15",
          "phone": "+966546252772",
          "geographic_notes": "Located in canonical district al_aziziyah. Multi-mode active for both Food and Breakfast.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "dosa",
          "name_ar": "dosa",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "idli",
          "name_ar": "idli",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "South Indian thali",
          "name_ar": "South Indian thali",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "biryani",
          "name_ar": "biryani",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "saravanaa_bhavan_jeddah",
      "canonical_name": "Saravanaa Bhavan Jeddah",
      "arabic_name": "سارافانا بهافان جدة",
      "categories": [
        "indian",
        "south_indian",
        "vegetarian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "south_indian",
        "vegetarian"
      ],
      "subcategories": [
        "south_indian",
        "vegetarian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "masala dosa",
      "signature_dish_en": "masala dosa",
      "vibe_tags_ar": [
        "سلسلة جنوب هندية نباتية عالمية",
        "أصناف التيفين والماسالا دوسا",
        "فطور هندي أصيل",
        "نباتي ١٠٠٪"
      ],
      "vibe_tags_en": [
        "World Renowned Vegetarian South Indian",
        "Mini Tiffin & Masala Dosa",
        "Authentic Indian Breakfast",
        "100% Pure Veg"
      ],
      "reputation_tags": [
        "mainstream"
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
        "al_aziziyah"
      ],
      "delivery_platforms": {
        "hungerstation": "yes",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://saravanaabhavanksa.com/",
      "research_use": "production_ready",
      "serves_breakfast_menu": true,
      "branches": [
        {
          "restaurant_id": "saravanaa_bhavan_jeddah",
          "branch_name_en": "Al Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "H657+G52, Aziziyah, Jeddah 23342, Saudi Arabia",
          "latitude": 21.558755,
          "longitude": 39.2129024,
          "maps_business_name": "Saravanaa Bhavan Jeddah",
          "google_place_id": "ChIJ7TtQFADRwxURsUHZ03r37LY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ7TtQFADRwxURsUHZ03r37LY",
          "google_rating": 4.6,
          "google_review_count": 1703,
          "operating_status": "open",
          "hours": "Sun-Wed 07:00-23:30; Thu-Fri 07:00-00:00; Sat 07:00-23:30",
          "phone": "+966551727755",
          "geographic_notes": "Located in canonical district al_aziziyah. Confirmed actively operating on Google Maps listing; stale aggregator closure concern debunked.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "masala dosa",
          "name_ar": "masala dosa",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "ghee roast",
          "name_ar": "ghee roast",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "idly",
          "name_ar": "idly",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "medhu vada",
          "name_ar": "medhu vada",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "mini tiffin",
          "name_ar": "mini tiffin",
          "is_signature": false,
          "sort_order": 4
        }
      ]
    },
    {
      "brand_id": "shehnai_indian_restaurant",
      "canonical_name": "Shehnai Indian Restaurant",
      "arabic_name": "مطعم شهناي الهندي",
      "categories": [
        "indian",
        "north_indian"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "north_indian"
      ],
      "subcategories": [
        "north_indian"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "mixed tandoori platter",
      "signature_dish_en": "mixed tandoori platter",
      "vibe_tags_ar": [
        "مشاوي تندوري شمالية مميزة",
        "تطبيق طلب خاص وسريع",
        "أجواء عائلية لطيفة",
        "سهرات شارع حراء"
      ],
      "vibe_tags_en": [
        "North Indian Tandoori Platters",
        "Direct Mobile App Ordering",
        "Cozy Family Ambience",
        "Hira Street Dining"
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
        "al_marwah"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown",
        "own_app": "yes"
      },
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "shehnai_indian_restaurant",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23544, Saudi Arabia",
          "latitude": 21.6223865,
          "longitude": 39.1989969,
          "maps_business_name": "Shehnai Indian Restaurant",
          "google_place_id": "ChIJTz1u0y7XwxURvxyxmY2kXlo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJTz1u0y7XwxURvxyxmY2kXlo",
          "google_rating": 4.7,
          "google_review_count": 1159,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu-Fri 12:00-03:00; Sat 12:00-02:00",
          "phone": "+966531914513",
          "geographic_notes": "Located in canonical district al_marwah. Older Sharafiyah references represent legacy/relocated listing and are not imported as an active second branch.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "mixed tandoori platter",
          "name_ar": "mixed tandoori platter",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "royal_garden_indian_restaurant",
      "canonical_name": "Royal Garden Indian Restaurant",
      "arabic_name": "مطعم رويال جاردن الهندي",
      "categories": [
        "indian",
        "north_indian",
        "family_restaurant"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "north_indian",
        "family_restaurant"
      ],
      "subcategories": [
        "north_indian",
        "family_restaurant"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "butter chicken",
      "signature_dish_en": "butter chicken",
      "vibe_tags_ar": [
        "مطعم هندي عريق من ١٩٨٩",
        "دجاج 65 ودجاج بالزبدة",
        "جلسات عائلية كلاسيكية",
        "شارع حراء شمال جدة"
      ],
      "vibe_tags_en": [
        "Heritage Indian Since 1989",
        "Chicken 65 & Butter Chicken",
        "Classic Family Dining",
        "Hira Street / An Nahdah"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "family_friendly",
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
      "canonical_districts": [],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://royalgardenksa.com/",
      "research_use": "usable_with_caution",
      "serves_breakfast_menu": false,
      "branches": [
        {
          "restaurant_id": "royal_garden_indian_restaurant",
          "branch_name_en": "An Nahdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Hira St, An Nahdah, Jeddah 23523, Saudi Arabia",
          "latitude": 21.608283,
          "longitude": 39.1287678,
          "maps_business_name": "Royal Garden Indian Restaurant",
          "google_place_id": "ChIJUQHSZoLbwxURXUhwJ1Bht4M",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUQHSZoLbwxURXUhwJ1Bht4M",
          "google_rating": 4.6,
          "google_review_count": 1402,
          "operating_status": "open",
          "hours": "Sun-Sat 13:00-02:00",
          "phone": "+966552915400",
          "geographic_notes": "Located in An Nahdah district, outside the canonical 30-district boundary. Handled under outer-district caution rules (canonical_district: null). Official site hours 13:00-02:00 retained as authoritative.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "butter chicken",
          "name_ar": "butter chicken",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken 65",
          "name_ar": "Chicken 65",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "cadence_indian_cuisine",
      "canonical_name": "Cadence Indian Cuisine",
      "arabic_name": "مطعم كادينز الهندي",
      "categories": [
        "indian",
        "kerala",
        "malabar",
        "hyderabadi"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "kerala",
        "malabar",
        "hyderabadi"
      ],
      "subcategories": [
        "kerala",
        "malabar",
        "hyderabadi"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "Malabar beef biryani",
      "signature_dish_en": "Malabar beef biryani",
      "vibe_tags_ar": [
        "مأكولات كيرلا ومالابار أصيلة",
        "برياني مالاباري باللحم والدجاج",
        "فطور هندي وسهرات",
        "أسعار اقتصادية"
      ],
      "vibe_tags_en": [
        "Authentic Kerala & Malabar Flavors",
        "Malabar Beef & Chicken Biryani",
        "Breakfast & Late Night",
        "Budget Friendly"
      ],
      "reputation_tags": [
        "local_favorite"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown"
      },
      "official_website": "https://restoqr.skysecretary.com/cadence",
      "research_use": "usable_with_caution",
      "serves_breakfast_menu": true,
      "branches": [
        {
          "restaurant_id": "cadence_indian_cuisine",
          "branch_name_en": "Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Ghernatah, Mishrifah, Jeddah 23336, Saudi Arabia",
          "latitude": 21.5462665,
          "longitude": 39.2019374,
          "maps_business_name": "Cadence Indian Cuisine",
          "google_place_id": "ChIJWYQyd7nRwxURf9yNzxcV9jY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWYQyd7nRwxURf9yNzxcV9jY",
          "google_rating": 4.4,
          "google_review_count": 1081,
          "operating_status": "open",
          "hours": "Sun-Sat 07:00-01:00",
          "phone": "+966562884420",
          "geographic_notes": "Located in Mishrifah district, outside the canonical 30-district boundary. Handled under outer-district caution rules (canonical_district: null).",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Malabar beef biryani",
          "name_ar": "Malabar beef biryani",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Malabar chicken biryani",
          "name_ar": "Malabar chicken biryani",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Malabari Chicken 65",
          "name_ar": "Malabari Chicken 65",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "butter chicken",
          "name_ar": "butter chicken",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "aryaas_indian_restaurant",
      "canonical_name": "Aryaas Indian Restaurant - Jeddah",
      "arabic_name": "مطعم ارياس الهندي",
      "categories": [
        "indian",
        "south_indian",
        "indian_chinese",
        "family_restaurant"
      ],
      "primary_category": "indian",
      "secondary_categories": [
        "south_indian",
        "indian_chinese",
        "family_restaurant"
      ],
      "subcategories": [
        "south_indian",
        "indian_chinese",
        "family_restaurant"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 50,
      "signature_dish_ar": "dosa",
      "signature_dish_en": "dosa",
      "vibe_tags_ar": [
        "مأكولات جنوب الهند وشاي شتيني",
        "دوسا وإدلي طازج",
        "توصيل متجر خاص",
        "أجواء عائلية بالشرفية"
      ],
      "vibe_tags_en": [
        "South Indian & Chettinad Kitchen",
        "Fresh Dosa & Idli",
        "Direct Web Ordering",
        "Sharafeyah Family Classic"
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
        "al_sharafeyah"
      ],
      "delivery_platforms": {
        "hungerstation": "unknown",
        "jahez": "unknown",
        "keeta": "unknown",
        "own_delivery": "yes"
      },
      "official_website": "https://aryaasrestaurant.whastores.com/",
      "research_use": "production_ready",
      "serves_breakfast_menu": true,
      "branches": [
        {
          "restaurant_id": "aryaas_indian_restaurant",
          "branch_name_en": "Al Sharafeyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sharafeyah",
          "address_en": "King Fahd Rd / Sitteen Street, Al Sharafeyah, Jeddah, Saudi Arabia",
          "latitude": 21.4984226,
          "longitude": 39.1943218,
          "maps_business_name": "Aryaas Indian Restaurant - Jeddah",
          "google_place_id": "ChIJqZlH1MXPwxURogfXB1yl6aM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJqZlH1MXPwxURogfXB1yl6aM",
          "google_rating": 4.1,
          "google_review_count": 404,
          "operating_status": "open",
          "hours": "Sun-Thu 07:30-00:00; Fri-Sat 07:00-01:00",
          "phone": "+966543469613",
          "geographic_notes": "Located in canonical district al_sharafeyah. Participates in both Food and Breakfast modes.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "dosa",
          "name_ar": "dosa",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "idly",
          "name_ar": "idly",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "vada",
          "name_ar": "vada",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Chicken Dum Biryani",
          "name_ar": "Chicken Dum Biryani",
          "is_signature": false,
          "sort_order": 3
        },
        {
          "name_en": "Chettinad Chicken",
          "name_ar": "Chettinad Chicken",
          "is_signature": false,
          "sort_order": 4
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _indian_catalog;
  
  -- Verify brand count is exactly 13
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 13 THEN
    RAISE EXCEPTION 'Indian catalog must contain exactly 13 brands';
  END IF;

  -- Verify branch count is exactly 14
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 14 THEN
    RAISE EXCEPTION 'Indian catalog must contain exactly 14 branches';
  END IF;

  -- Verify canonical branch count is 12
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 12 THEN
    RAISE EXCEPTION 'Indian catalog must contain exactly 12 canonical branches';
  END IF;

  -- Verify outer caution branch count is 2
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 2 THEN
    RAISE EXCEPTION 'Indian catalog must contain exactly 2 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Indian catalog contains an unknown canonical district'; END IF;

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
WITH catalog AS (SELECT payload FROM _indian_catalog), brands AS (
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
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 1:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  25,
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
  (b->>'serves_breakfast_menu')::boolean,
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  (b->>'research_use')::public.research_use,
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

-- 2. Cleanup stale best sellers and sources for these 13 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _indian_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _indian_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _indian_catalog), branches AS (
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
  google_place_id=EXCLUDED.google_place_id,
  maps_lookup_status=EXCLUDED.maps_lookup_status,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  rating_source=EXCLUDED.rating_source,
  maps_last_verified_at=EXCLUDED.maps_last_verified_at,
  branch_identity_confidence=EXCLUDED.branch_identity_confidence,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert public.restaurant_best_sellers
WITH catalog AS (SELECT payload FROM _indian_catalog), sellers AS (
  SELECT b->>'brand_id' AS restaurant_id, bs
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') bs
)
INSERT INTO public.restaurant_best_sellers (
  restaurant_id, name_ar, name_en, is_signature, sort_order, confidence, evidence_summary, last_verified_at
)
SELECT
  restaurant_id,
  bs->>'name_ar',
  bs->>'name_en',
  (bs->>'is_signature')::boolean,
  (bs->>'sort_order')::integer,
  'high'::public.intelligence_confidence,
  'Certified Indian Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _indian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL AND length(trim(b->>'official_website')) > 0
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
WITH catalog AS (SELECT payload FROM _indian_catalog), branches AS (
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
