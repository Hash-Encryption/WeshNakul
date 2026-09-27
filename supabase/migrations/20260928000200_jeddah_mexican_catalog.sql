-- Google-verified Jeddah Mexican production catalog.
-- Source: docs/research/jeddah-mexican-pass-d-corrected.json
-- 14 approved brands (13 physical brands + 1 delivery-only brand Taqado).
-- 19 verified physical branches (17 canonical, 2 outer-district caution branches).
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Zero collisions against existing 145 live brands / 453 live branches.
-- Preserves Mexican deck invariants (FireGrill guaranteed anchor, rotating strong pool, 7-card deck).
BEGIN;

CREATE TEMP TABLE _mexican_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _mexican_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Mexican Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-28",
    "brand_count": 14,
    "branch_count": 19,
    "canonical_branch_count": 17,
    "outer_caution_branch_count": 2
  },
  "brands": [
    {
      "brand_id": "firegrill",
      "canonical_name": "FireGrill",
      "arabic_name": "فاير جريل",
      "categories": [
        "mexican",
        "tex_mex",
        "burritos",
        "bowls",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tex_mex",
        "burritos",
        "bowls",
        "tacos"
      ],
      "subcategories": [
        "tex_mex",
        "burritos",
        "bowls",
        "tacos"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بوريتو وتاكو فاير جريل",
      "signature_dish_en": "FireGrill Burrito & Tacos",
      "vibe_tags_ar": [
        "أشهر براند مكسيكي وسريع",
        "بوريتو وباول وسلطات",
        "فروع متعددة بجدة",
        "وجبة سريعة وخيارات صحية"
      ],
      "vibe_tags_en": [
        "Leading Fast-Casual Mexican",
        "Burritos Bowls & Tacos",
        "Multiple Jeddah Branches",
        "Quick Casual Dining"
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
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "al_zahra",
        "al_naeem",
        "al_ruwais",
        "al_shati",
        "an_nuzhah",
        "al_sheraa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "2328 King Abdul Aziz Rd, AZ Zahra District, 6403, Jeddah 23424, Saudi Arabia",
          "latitude": 21.575775699999998,
          "longitude": 39.1274448,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJOU1E5unawxURfjHoaCoVOyY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOU1E5unawxURfjHoaCoVOyY",
          "google_rating": 4.1,
          "google_review_count": 2222,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 2:00 AM; Tuesday: 11:00 AM – 2:00 AM; Wednesday: 11:00 AM – 2:00 AM; Thursday: 11:00 AM – 2:00 AM; Friday: 12:30 PM – 2:00 AM; Saturday: 11:00 AM – 2:00 AM; Sunday: 11:00 AM – 2:00 AM",
          "phone": "+966 55 435 0052",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Prince Sultan Rd, حي النعيم،، Jeddah 23621, Saudi Arabia",
          "latitude": 21.637205299999998,
          "longitude": 39.132021,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJIc20ZovZwxURTkdtk-agTQg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJIc20ZovZwxURTkdtk-agTQg",
          "google_rating": 4.1,
          "google_review_count": 2373,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 3:30 AM; Tuesday: 11:00 AM – 2:00 AM; Wednesday: 11:00 AM – 2:00 AM; Thursday: 11:00 AM – 2:00 AM; Friday: 12:30 PM – 2:00 AM; Saturday: 11:00 AM – 2:00 AM; Sunday: 11:00 AM – 2:00 AM",
          "phone": "+966 55 453 5569",
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Al Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "Liwan Center، King Abdullah Road, Al Ruwais،، Al-Ruwais, Jeddah 23214, Saudi Arabia",
          "latitude": 21.5110429,
          "longitude": 39.1818896,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJl_oaFLvPwxURfuENAVij11w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJl_oaFLvPwxURfuENAVij11w",
          "google_rating": 4.1,
          "google_review_count": 1915,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 2:00 AM; Tuesday: 11:00 AM – 2:00 AM; Wednesday: 11:00 AM – 2:00 AM; Thursday: 11:00 AM – 2:00 AM; Friday: 12:30 PM – 2:00 AM; Saturday: 11:00 AM – 2:00 AM; Sunday: 11:00 AM – 2:00 AM",
          "phone": "+966 55 660 2049",
          "geographic_notes": "Located in canonical district al_ruwais.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Ash Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.6281325,
          "longitude": 39.111729499999996,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJ93xpUA7bwxURpUX58ciaRkQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ93xpUA7bwxURpUX58ciaRkQ",
          "google_rating": 4,
          "google_review_count": 314,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 12:00 AM; Tuesday: 11:00 AM – 12:00 AM; Wednesday: 11:00 AM – 12:00 AM; Thursday: 11:00 AM – 12:00 AM; Friday: 12:30 PM – 1:00 AM; Saturday: 11:00 AM – 12:00 AM; Sunday: 11:00 AM – 12:00 AM",
          "phone": "+966 53 031 6569",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Al Asalah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Prince Talal Bin Mansour Rd, Al Asalah, Jeddah 23738, Saudi Arabia",
          "latitude": 21.7741755,
          "longitude": 39.1703143,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJb0Loqsl9wRURSzQb0G1oEb0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJb0Loqsl9wRURSzQb0G1oEb0",
          "google_rating": 4.3,
          "google_review_count": 237,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 12:00 AM; Tuesday: 11:00 AM – 12:00 AM; Wednesday: 11:00 AM – 12:00 AM; Thursday: 11:00 AM – 12:00 AM; Friday: 12:30 PM – 1:00 AM; Saturday: 11:00 AM – 12:00 AM; Sunday: 11:00 AM – 12:00 AM",
          "phone": "+966 53 902 5776",
          "geographic_notes": "Located in outer Jeddah district Al Asalah; outside canonical 30 districts, hence canonical_district is null.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "an_nuzhah",
          "address_en": "An Nuzahah, Al- Madinah Al Munawara Rd, Mall of Arabia Second floor, النزهة، جدة 23532, Saudi Arabia",
          "latitude": 21.6326341,
          "longitude": 39.1555973,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJ1Y8Uyb_XwxURC-5gpZtpJ20",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ1Y8Uyb_XwxURC-5gpZtpJ20",
          "google_rating": 3.4,
          "google_review_count": 92,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 12:00 AM; Tuesday: 11:00 AM – 12:00 AM; Wednesday: 11:00 AM – 12:00 AM; Thursday: 11:00 AM – 12:00 AM; Friday: 12:30 PM – 1:00 AM; Saturday: 11:00 AM – 12:00 AM; Sunday: 11:00 AM – 12:00 AM",
          "phone": null,
          "geographic_notes": "Located in canonical district an_nuzhah (Mall of Arabia, 2nd floor). Normalized source typo An Nuzahah -> an_nuzhah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "firegrill",
          "branch_name_en": "Al Shiraa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sheraa",
          "address_en": "JHYC2627, 2627 Prince Naif Rd, 7242،, حي, الشراع،, جدة 23816, Saudi Arabia",
          "latitude": 21.7660427,
          "longitude": 39.0909498,
          "maps_business_name": "FireGrill",
          "google_place_id": "ChIJU8Frhv9jwRUROxy5aP6Qa_U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJU8Frhv9jwRUROxy5aP6Qa_U",
          "google_rating": 3.9,
          "google_review_count": 667,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 2:00 AM; Tuesday: 11:00 AM – 2:00 AM; Wednesday: 11:00 AM – 2:00 AM; Thursday: 11:00 AM – 2:00 AM; Friday: 12:30 PM – 2:00 AM; Saturday: 11:00 AM – 2:00 AM; Sunday: 11:00 AM – 2:00 AM",
          "phone": null,
          "geographic_notes": "Located in canonical district al_sheraa (Al Shiraa).",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Steak & Chicken Burrito Bowl",
          "name_ar": "باول بوريتو ستيك ودجاج",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Crispy & Soft Tacos",
          "name_ar": "تاكو مقرمش وطري",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "cocina_la_cantina",
      "canonical_name": "Cocina La Cantina",
      "arabic_name": "كوتشينا لا كانتينا",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تاكوز لا كانتينا",
      "signature_dish_en": "La Cantina Tacos",
      "vibe_tags_ar": [
        "مطعم مكسيكي محلي محبوب",
        "أجواء لاتينية مبهجة",
        "تاكوز وكاساديا",
        "شارع صاري الزهراء"
      ],
      "vibe_tags_en": [
        "Local Mexican Favorite",
        "Vibrant Latin Vibe",
        "Tacos & Quesadillas",
        "Sari Street Al Zahra"
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
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "cocina_la_cantina",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Sari Br Rd, Al Zahra, Jeddah 23424, الزهراء، جدة 23615, Saudi Arabia",
          "latitude": 21.5733257,
          "longitude": 39.137460399999995,
          "maps_business_name": "Cocina La Cantina",
          "google_place_id": "ChIJnXiuyYTbwxURksI859BDH9M",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJnXiuyYTbwxURksI859BDH9M",
          "google_rating": 4.7,
          "google_review_count": 1897,
          "operating_status": "open",
          "hours": "Monday: 4:00 PM – 12:00 AM; Tuesday: 4:00 PM – 12:00 AM; Wednesday: 4:00 PM – 12:00 AM; Thursday: 1:00 PM – 1:45 AM; Friday: 1:00 PM – 1:45 AM; Saturday: 1:00 PM – 1:45 AM; Sunday: 4:00 PM – 12:00 AM",
          "phone": "+966 50 766 0556",
          "geographic_notes": "Located in canonical district al_zahra on Sari Branch Rd.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "La Cantina Tacos & Quesadillas",
          "name_ar": "تاكوز وكاساديا لا كانتينا",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "eds_taco",
      "canonical_name": "ED'S Taco",
      "arabic_name": "إيدز تاكو",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تاكو البيريا",
      "signature_dish_en": "Birria Tacos",
      "vibe_tags_ar": [
        "أشهر تاكو بيريا بجدة",
        "خبز طازج ولحم مطهو ببطء",
        "حي الزهراء البترجي",
        "سريع وشبابي"
      ],
      "vibe_tags_en": [
        "Famous Jeddah Birria Tacos",
        "Slow Cooked Beef & Consomé",
        "Al Zahra Al Batarji",
        "Trendy Fast Casual"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout"
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
          "restaurant_id": "eds_taco",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Al Batarji, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.5986023,
          "longitude": 39.125437,
          "maps_business_name": "ED'S Taco",
          "google_place_id": "ChIJAfLe4yjbwxURJRHjzYoQA58",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAfLe4yjbwxURJRHjzYoQA58",
          "google_rating": 4.1,
          "google_review_count": 1601,
          "operating_status": "open",
          "hours": "Monday: 12:00 PM – 2:00 AM; Tuesday: 12:00 PM – 2:00 AM; Wednesday: 12:00 PM – 2:00 AM; Thursday: 12:00 PM – 3:00 AM; Friday: 5:00 PM – 3:00 AM; Saturday: 12:00 PM – 2:00 AM; Sunday: 12:00 PM – 2:00 AM",
          "phone": "+966 59 770 0070",
          "geographic_notes": "Located in canonical district al_zahra on Al Batarji.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Birria Beef Tacos with Consomé",
          "name_ar": "تاكو لحم بيريا مع الكونسومي",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "speakeasy",
      "canonical_name": "Speakeasy",
      "arabic_name": "سبيك إيزي",
      "categories": [
        "mexican",
        "latin",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "latin",
        "tacos"
      ],
      "subcategories": [
        "latin",
        "tacos"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تاكو البارباكوا والبوريتو",
      "signature_dish_en": "Barbacoa Tacos & Burritos",
      "vibe_tags_ar": [
        "مطعم لاتيني ومكسيكي مميز",
        "أجواء عصرية وجلسات رايقة",
        "تاكوز وبرجر ولاتيني",
        "حي النعيم"
      ],
      "vibe_tags_en": [
        "Distinctive Latin-Mexican",
        "Cozy Modern Ambiance",
        "Tacos & Latin Bites",
        "Al Naeem District"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout"
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
        "al_naeem"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "speakeasy",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Amna Bint Wahb St, Al Naeem, Jeddah 23621, Saudi Arabia",
          "latitude": 21.6329253,
          "longitude": 39.14363,
          "maps_business_name": "Speakeasy",
          "google_place_id": "ChIJf9RLrLnbwxUR4OhTyqJ5iCQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJf9RLrLnbwxUR4OhTyqJ5iCQ",
          "google_rating": 4.4,
          "google_review_count": 2225,
          "operating_status": "open",
          "hours": "Monday: 1:00 PM – 1:00 AM; Tuesday: 1:00 PM – 1:00 AM; Wednesday: 1:00 PM – 1:00 AM; Thursday: 1:00 PM – 2:00 AM; Friday: 1:00 PM – 2:00 AM; Saturday: 1:00 PM – 1:00 AM; Sunday: 1:00 PM – 1:00 AM",
          "phone": "+966 56 789 3384",
          "geographic_notes": "Located in canonical district al_naeem on Amna Bint Wahb St.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Barbacoa Tacos & Burritos",
          "name_ar": "تاكو بارباكوا وبوريتو",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "chilis",
      "canonical_name": "Chili's",
      "arabic_name": "تشيليز",
      "categories": [
        "mexican",
        "tex_mex",
        "american"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tex_mex",
        "american"
      ],
      "subcategories": [
        "tex_mex",
        "american"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 60,
      "estimated_spend_max_sar": 130,
      "signature_dish_ar": "فاهيتا ومقبلات تشيليز",
      "signature_dish_en": "Chili's Sizzling Fajitas",
      "vibe_tags_ar": [
        "تكس مكس وأمريكي كلاسيك",
        "فاهيتا وبرجر وأجواء عائلية",
        "شارع فلسطين الحمراء",
        "جلسات عائلية واسعة"
      ],
      "vibe_tags_en": [
        "Classic Tex-Mex & American",
        "Sizzling Fajitas & Burgers",
        "Palestine St Al Hamra",
        "Family Friendly Casual"
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
          "restaurant_id": "chilis",
          "branch_name_en": "Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "شارع الاندلس، حي الحمراء، Palestine, Al-Hamra'a, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5227136,
          "longitude": 39.1636744,
          "maps_business_name": "Chili's",
          "google_place_id": "ChIJpREyco3PwxUR_uqfIhqhJi0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJpREyco3PwxUR_uqfIhqhJi0",
          "google_rating": 4.1,
          "google_review_count": 7929,
          "operating_status": "open",
          "hours": "Monday: 11:00 AM – 1:00 AM; Tuesday: 11:00 AM – 1:00 AM; Wednesday: 11:00 AM – 1:00 AM; Thursday: 11:00 AM – 1:00 AM; Friday: 1:30 PM – 1:30 AM; Saturday: 11:00 AM – 1:00 AM; Sunday: 11:00 AM – 1:00 AM",
          "phone": "+966 12 665 8504",
          "geographic_notes": "Located in canonical district al_hamra at intersection of Palestine St and Al Andalus Rd.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Sizzling Fajitas Trio",
          "name_ar": "تريو فاهيتا تشيليز الشهيرة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "taqado_mexican_kitchen",
      "canonical_name": "Taqado Mexican Kitchen",
      "arabic_name": "تاكادو المطبخ المكسيكي",
      "categories": [
        "mexican",
        "tacos",
        "burritos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos",
        "burritos"
      ],
      "subcategories": [
        "tacos",
        "burritos"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بوريتو وتاكو تاكادو",
      "signature_dish_en": "Taqado Burrito & Tacos",
      "vibe_tags_ar": [
        "توصيل مكسيكي سحابي",
        "بوريتو وكاساديا وبيريا",
        "هنقرستيشن الزهراء",
        "سريع وتوصيل"
      ],
      "vibe_tags_en": [
        "Cloud Delivery Mexican",
        "Burritos Quesadillas & Birria",
        "HungerStation Az Zahra",
        "Fast Delivery"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
        "quick_bite"
      ],
      "time_slots": [
        "lunch",
        "dinner"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 0,
      "canonical_districts": [],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "usable_with_caution",
      "branches": [],
      "best_sellers": [
        {
          "name_en": "Signature Burrito & Birria Quesadilla",
          "name_ar": "بوريتو وكاساديا بيريا تاكادو",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "casa_twist",
      "canonical_name": "Casa Twist",
      "arabic_name": "كازا تويست",
      "categories": [
        "mexican"
      ],
      "primary_category": "mexican",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "أطباق مكسيكية تويست",
      "signature_dish_en": "Casa Twist Mexican Plates",
      "vibe_tags_ar": [
        "مكسيكي محلي مميز",
        "حي المحمدية",
        "جلسات مسائية",
        "تاكوز ومأكولات خفيفة"
      ],
      "vibe_tags_en": [
        "Distinctive Local Mexican",
        "Al Muhammadiyyah District",
        "Evening Hangout",
        "Tacos & Bites"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "casual_hangout"
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
        "al_mohammadiyyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "casa_twist",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_mohammadiyyah",
          "address_en": "Al Mohammadiyyah, Jeddah 23617, Saudi Arabia",
          "latitude": 21.6497821,
          "longitude": 39.1246564,
          "maps_business_name": "Casa Twist",
          "google_place_id": "ChIJ_7LBUQDZwxURx4YyTVfAw5Q",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_7LBUQDZwxURx4YyTVfAw5Q",
          "google_rating": 4.5,
          "google_review_count": 409,
          "operating_status": "open",
          "hours": "Monday: 8:00 PM – 2:00 AM; Tuesday: 8:00 PM – 2:00 AM; Wednesday: 8:00 PM – 2:00 AM; Thursday: 8:00 PM – 3:00 AM; Friday: 8:00 PM – 3:00 AM; Saturday: 8:00 PM – 2:00 AM; Sunday: 8:00 PM – 2:00 AM",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah. Google Places formatted address is district-level without street name; exact coordinates and operating hours verified.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Casa Twist Special Mexican Tacos",
          "name_ar": "تاكوز كازا تويست الخاصة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "chiii",
      "canonical_name": "Chiii",
      "arabic_name": "تشي",
      "categories": [
        "mexican"
      ],
      "primary_category": "mexican",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تشي تاكوز",
      "signature_dish_en": "Chiii Tacos",
      "vibe_tags_ar": [
        "تاكو ومكسيكي سريع",
        "حي النعيم آمنة بنت وهب",
        "وجبة خفيفة ولذيذة",
        "سهرات حتى الفجر"
      ],
      "vibe_tags_en": [
        "Fast Mexican Bites",
        "Al Naeem Amna Bint Wahb",
        "Tasty Quick Bite",
        "Late Night"
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
      "is_open_late": true,
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
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "chiii",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Amna Bint Wahb St, Al Naeem, Jeddah 23622, Saudi Arabia",
          "latitude": 21.6317092,
          "longitude": 39.14455410000001,
          "maps_business_name": "Chiii",
          "google_place_id": "ChIJn4qafwDZwxURfJ4Hq3FSk5c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJn4qafwDZwxURfJ4Hq3FSk5c",
          "google_rating": 4.5,
          "google_review_count": 323,
          "operating_status": "open",
          "hours": "Monday: 12:00 PM – 1:00 AM; Tuesday: 12:00 PM – 1:00 AM; Wednesday: 12:00 PM – 1:00 AM; Thursday: 12:00 PM – 3:00 AM; Friday: 3:00 PM – 3:00 AM; Saturday: 12:00 PM – 1:00 AM; Sunday: 12:00 PM – 1:00 AM",
          "phone": "+966 56 689 9678",
          "geographic_notes": "Located in canonical district al_naeem on Amna Bint Wahb St.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Chiii Signature Tacos",
          "name_ar": "تاكوز تشي المميزة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "chalcos_mexican_grill",
      "canonical_name": "Chalcos Mexican Grill",
      "arabic_name": "شالكوس مكسيكان جريل",
      "categories": [
        "mexican",
        "tacos",
        "burritos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos",
        "burritos"
      ],
      "subcategories": [
        "tacos",
        "burritos"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تاكو البيريا والبوريتو",
      "signature_dish_en": "Birria Tacos & Burritos",
      "vibe_tags_ar": [
        "مكسيكان جريل محلي",
        "تاكو وبوريتو طازج",
        "حي الزهراء البترجي",
        "خيارات سريعة"
      ],
      "vibe_tags_en": [
        "Local Mexican Grill",
        "Fresh Tacos & Burritos",
        "Al Zahra Al Batarji",
        "Fast Mexican"
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
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "chalcos_mexican_grill",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.5983938,
          "longitude": 39.1246738,
          "maps_business_name": "Chalcos Mexican Grill",
          "google_place_id": "ChIJ4-Sos8HbwxURGll1LNwCxko",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ4-Sos8HbwxURGll1LNwCxko",
          "google_rating": 4.1,
          "google_review_count": 280,
          "operating_status": "open",
          "hours": "Monday: 8:00 AM – 1:30 AM; Tuesday: 8:00 AM – 1:30 AM; Wednesday: 8:00 AM – 1:30 AM; Thursday: 8:00 AM – 1:30 AM; Friday: 2:00 PM – 1:30 AM; Saturday: 8:00 AM – 1:30 AM; Sunday: 8:00 AM – 1:30 AM",
          "phone": "+966 54 587 6753",
          "geographic_notes": "Located in canonical district al_zahra near Al Batarji.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Birria Tacos & Grilled Burritos",
          "name_ar": "تاكو بيريا وبوريتو مشوي",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "tacomole",
      "canonical_name": "Tacomole",
      "arabic_name": "تاكومولي",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "تاكومولي سبيشال تاكوز",
      "signature_dish_en": "Tacomole Special Tacos",
      "vibe_tags_ar": [
        "جوهرة مكسيكية مخفية",
        "تقييم ممتاز ٥ نجوم",
        "حي الشاطئ",
        "تاكوز ومأكولات خفيفة"
      ],
      "vibe_tags_en": [
        "Mexican Hidden Gem",
        "5-Star Rating",
        "Ash Shati District",
        "Fresh Tacos & Bites"
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
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "tacomole",
          "branch_name_en": "Ash Shati",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_shati",
          "address_en": "الشاطئ، جدة 23616, Saudi Arabia",
          "latitude": 21.639572899999997,
          "longitude": 39.1258312,
          "maps_business_name": "Tacomole",
          "google_place_id": "ChIJH_2-MwDZwxURevswJ3aqm5w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJH_2-MwDZwxURevswJ3aqm5w",
          "google_rating": 5,
          "google_review_count": 41,
          "operating_status": "open",
          "hours": "Monday: 8:00 PM – 2:00 AM; Tuesday: 8:00 PM – 2:00 AM; Wednesday: 8:00 PM – 2:00 AM; Thursday: 8:00 PM – 2:00 AM; Friday: 8:00 PM – 2:00 AM; Saturday: 8:00 PM – 2:00 AM; Sunday: 8:00 PM – 2:00 AM",
          "phone": null,
          "geographic_notes": "Located in canonical district al_shati. Formatted address is district-level on Google Places; exact coordinates and operating hours verified.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tacomole Fresh Tacos",
          "name_ar": "تاكوز تاكومولي الطازجة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "el_taco_loco",
      "canonical_name": "EL TACO LOCO",
      "arabic_name": "التاكو المجنون",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "التاكو المجنون سبيشال",
      "signature_dish_en": "El Taco Loco Tacos",
      "vibe_tags_ar": [
        "جوهرة تاكو شعبية",
        "جنوب جدة القرينية",
        "تاكو مكسيكي بأسعار مناسبة",
        "نكهة مكسيكية أصيلة"
      ],
      "vibe_tags_en": [
        "Street Taco Gem",
        "South Jeddah Al Qryniah",
        "Value-Friendly Mexican",
        "Authentic Flavor"
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
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "el_taco_loco",
          "branch_name_en": "Al Qryniah",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": null,
          "address_en": "حي, JMYC4530, 4530، 8060 الامير مشعل ابن عبدالعزيز، Al Qryniah, Jeddah 22624, Saudi Arabia",
          "latitude": 21.3167546,
          "longitude": 39.2551063,
          "maps_business_name": "EL TACO LOCO",
          "google_place_id": "ChIJOwRQLwC1wxURWZDE_FtRdeE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOwRQLwC1wxURWZDE_FtRdeE",
          "google_rating": 4.7,
          "google_review_count": 48,
          "operating_status": "open",
          "hours": "Monday: 6:00 PM – 2:00 AM; Tuesday: 6:00 PM – 2:00 AM; Wednesday: 6:00 PM – 2:00 AM; Thursday: 6:00 PM – 2:00 AM; Friday: 6:00 PM – 2:00 AM; Saturday: 6:00 PM – 2:00 AM; Sunday: 6:00 PM – 2:00 AM",
          "phone": "+966 56 525 3281",
          "geographic_notes": "Located in outer Jeddah district Al Qryniah; outside canonical 30 districts, hence canonical_district is null.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "El Taco Loco Street Tacos",
          "name_ar": "تاكوز التاكو المجنون الشعبية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "gyb_taco",
      "canonical_name": "Gyb Taco",
      "arabic_name": "جي واي بي تاكو",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "جي واي بي تاكو",
      "signature_dish_en": "Gyb Tacos",
      "vibe_tags_ar": [
        "تاكو مكسيكي بحي الرحاب",
        "تقييم عالي ٤.٨",
        "سريع وسفري",
        "سهرات حتى الفجر"
      ],
      "vibe_tags_en": [
        "Al Rehab Mexican Tacos",
        "High 4.8 Rating",
        "Quick Takeaway",
        "Late Night Bites"
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
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_rehab"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "gyb_taco",
          "branch_name_en": "Al Rehab",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_rehab",
          "address_en": "dist, 4353 Sharurah, Al-Rehab, Jeddah 23343, Saudi Arabia",
          "latitude": 21.5442867,
          "longitude": 39.2247554,
          "maps_business_name": "Gyb Taco",
          "google_place_id": "ChIJo7aD9b3RwxUR6vfK_4kvdUM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJo7aD9b3RwxUR6vfK_4kvdUM",
          "google_rating": 4.8,
          "google_review_count": 32,
          "operating_status": "open",
          "hours": "Monday: 6:00 PM – 2:30 AM; Tuesday: 6:00 PM – 2:30 AM; Wednesday: 6:00 PM – 2:30 AM; Thursday: 6:00 PM – 3:00 AM; Friday: 6:00 PM – 3:00 AM; Saturday: 6:00 PM – 3:00 AM; Sunday: 6:00 PM – 2:30 AM",
          "phone": "+966 56 409 8080",
          "geographic_notes": "Located in canonical district al_rehab on Sharurah St.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Gyb Taco Special",
          "name_ar": "وجبة جي واي بي تاكو الخاصة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "taco_in",
      "canonical_name": "Taco In",
      "arabic_name": "تاكو ان",
      "categories": [
        "mexican",
        "tacos"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "tacos"
      ],
      "subcategories": [
        "tacos"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "تاكو ان بوكس",
      "signature_dish_en": "Taco In Box",
      "vibe_tags_ar": [
        "تاكو حي النسيم",
        "تقييم ممتاز ٤.٨",
        "سريع وشبابي",
        "مفتوح حتى الفجر"
      ],
      "vibe_tags_en": [
        "An Naseem Taco Spot",
        "Excellent 4.8 Rating",
        "Fast Casual Bites",
        "Late Night Until 4am"
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
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_naseem"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "taco_in",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_naseem",
          "address_en": "G66G+P8J, Al Naseem St, An Naseem, Jeddah 23231, Saudi Arabia",
          "latitude": 21.5118296,
          "longitude": 39.225776599999996,
          "maps_business_name": "Taco In",
          "google_place_id": "ChIJq29kOwDPwxURX0eW9sWErz0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJq29kOwDPwxURX0eW9sWErz0",
          "google_rating": 4.8,
          "google_review_count": 20,
          "operating_status": "open",
          "hours": "Monday: 7:00 PM – 4:00 AM; Tuesday: 7:00 PM – 4:00 AM; Wednesday: 7:00 PM – 4:00 AM; Thursday: 7:00 PM – 4:00 AM; Friday: 7:00 PM – 4:00 AM; Saturday: 6:00 PM – 4:30 AM; Sunday: 7:00 PM – 4:00 AM",
          "phone": "+966 54 872 7087",
          "geographic_notes": "Located in canonical district al_naseem on Al Naseem St.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Taco In Box",
          "name_ar": "بوكس تاكو ان المميز",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "kakt",
      "canonical_name": "KAKT",
      "arabic_name": "كاكت",
      "categories": [
        "mexican",
        "burritos",
        "bowls"
      ],
      "primary_category": "mexican",
      "secondary_categories": [
        "burritos",
        "bowls"
      ],
      "subcategories": [
        "burritos",
        "bowls"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 40,
      "estimated_spend_max_sar": 85,
      "signature_dish_ar": "بوريتو بريسكت البيريا وباول البارباكوا",
      "signature_dish_en": "Birria Brisket Burrito & Barbacoa Bowl",
      "vibe_tags_ar": [
        "مكسيكي عصري يو ووك",
        "بوريتو بريسكت وبيريا وباولز",
        "حي الزهراء طريق الأمير سلطان",
        "تقييم ممتاز ٤.٨"
      ],
      "vibe_tags_en": [
        "Trendy Mexican at U Walk",
        "Birria Brisket Burrito & Bowls",
        "Al Zahra Prince Sultan Rd",
        "High 4.8 Rating"
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
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "kakt",
          "branch_name_en": "U Walk",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "U WALK, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.582539,
          "longitude": 39.139972,
          "maps_business_name": "KAKT",
          "google_place_id": "ChIJm4HefLfZwxURWEFXlUqNX00",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJm4HefLfZwxURWEFXlUqNX00",
          "google_rating": 4.8,
          "google_review_count": 67,
          "operating_status": "open",
          "hours": "Monday: 3:00 PM – 1:00 AM; Tuesday: 3:00 PM – 1:00 AM; Wednesday: 3:00 PM – 1:00 AM; Thursday: 3:00 PM – 2:00 AM; Friday: 3:00 PM – 2:00 AM; Saturday: 3:00 PM – 1:00 AM; Sunday: 3:00 PM – 1:00 AM",
          "phone": null,
          "geographic_notes": "Located in canonical district al_zahra in U Walk on Prince Sultan Rd.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Birria Brisket Burrito & Barbacoa Bowl",
          "name_ar": "بوريتو بريسكت بيريا وباول بارباكوا",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 0. Safely remove unverified/defunct legacy Mexican seed records
DELETE FROM public.restaurants WHERE id = 'takosan' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_swipes WHERE restaurant_id = 'takosan'
);

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _mexican_catalog), brands AS (
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
  (b->>'research_use')::public.research_use,
  '2026-09-28T00:00:00Z'::timestamptz,
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

-- 2. Cleanup stale best sellers and sources for Mexican brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _mexican_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
);

DELETE FROM public.restaurant_sources s USING _mexican_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _mexican_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _mexican_catalog), sellers AS (
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
  'Certified Mexican Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _mexican_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _mexican_catalog), branches AS (
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
