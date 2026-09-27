-- Google-verified Jeddah Sushi production catalog.
-- Source: docs/research/jeddah-sushi-pass-d-corrected.json
-- 16 approved brands, 28 verified physical branches (all 28 in canonical 30 districts).
-- Reconciles legacy Asian seed restaurant identity (wakame) without duplicate creation.
-- 100% Google Place IDs, Maps URLs, verified exact coordinates, addresses, hours, and ratings.
-- Apply after 20260927000600_jeddah_italian_catalog.sql.
BEGIN;

CREATE TEMP TABLE _sushi_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _sushi_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Sushi Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-28",
    "brand_count": 16,
    "branch_count": 28,
    "canonical_branch_count": 28,
    "outer_caution_branch_count": 0
  },
  "brands": [
    {
      "brand_id": "maki_house",
      "canonical_name": "Maki House",
      "arabic_name": "ماكي هاوس",
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
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Tom Yum Kani Soup",
      "signature_dish_en": "Tom Yum Kani Soup",
      "vibe_tags_ar": [
        "ماكي وسوشي متنوع",
        "بوكسات مشاركة",
        "سهرات حتى الفجر",
        "فروع متعددة"
      ],
      "vibe_tags_en": [
        "Varied Maki & Sushi",
        "Sharing Party Boxes",
        "Late Night Until 4am",
        "Multiple Locations"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
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
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "al_hamdaniyah",
        "al_zahra",
        "al_naseem",
        "abhur_al_shamaliyah",
        "al_mohammadiyyah",
        "al_marwah",
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Al Hamadaniyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Abi Firas Alhamadani, Al Hamadaniyyah, Jeddah 23761",
          "latitude": 21.74951,
          "longitude": 39.188781999999996,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJyX-kf3Z9wRURlSvdgECBuUw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Al+Hamadaniyah&query_place_id=ChIJyX-kf3Z9wRURlSvdgECBuUw",
          "google_rating": 4.6,
          "google_review_count": 603,
          "operating_status": "open",
          "hours": "Sun-Thu 11:00-03:00; Fri-Sat 12:45-03:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas, Al Zahra, Jeddah 23425",
          "latitude": 21.5888682,
          "longitude": 39.1315319,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJebd5bo3bwxURNPJzMayFzZQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Al+Zahra&query_place_id=ChIJebd5bo3bwxURNPJzMayFzZQ",
          "google_rating": 4.7,
          "google_review_count": 1533,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:45-02:00; Thu-Fri 12:45-03:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Al Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "Al Saleem Plaza, King Abdullah Rd, An Naseem, Jeddah",
          "latitude": 21.5109389,
          "longitude": 39.2316383,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJl9owyRbPwxURpr5YEWFvIW4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Al+Naseem&query_place_id=ChIJl9owyRbPwxURpr5YEWFvIW4",
          "google_rating": 4.7,
          "google_review_count": 3644,
          "operating_status": "open",
          "hours": "Daily 12:00-05:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "7230, Obhur Al-Shamaliyah, Jeddah",
          "latitude": 21.7496437,
          "longitude": 39.1134236,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJ1TdErv5jwRUREihVK6nPl0s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Obhur&query_place_id=ChIJ1TdErv5jwRUREihVK6nPl0s",
          "google_rating": 4.5,
          "google_review_count": 1543,
          "operating_status": "open",
          "hours": "Daily 12:45-04:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23625",
          "latitude": 21.6626922,
          "longitude": 39.122557,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJP3v-ronawxUR0ShXt1KxPXo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Al+Mohammadiyyah&query_place_id=ChIJP3v-ronawxUR0ShXt1KxPXo",
          "google_rating": 4.5,
          "google_review_count": 2631,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-02:00; Thu 12:00-03:00; Fri 12:45-03:00; Sat 12:45-02:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "8727 Hira St, Al Marwah District, Jeddah 23545",
          "latitude": 21.624509099999997,
          "longitude": 39.210615,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJn-NvxTLXwxURJHq-gJ_EnqY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Al+Marwah&query_place_id=ChIJn-NvxTLXwxURJHq-gJ_EnqY",
          "google_rating": 4.8,
          "google_review_count": 3794,
          "operating_status": "open",
          "hours": "Daily 12:45-04:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "maki_house",
          "branch_name_en": "Maki House - Salamah / Sari Road",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Hadiqat Rami, As Salamah, Sari Road, Jeddah",
          "latitude": 21.578867,
          "longitude": 39.155601,
          "maps_business_name": "Maki House",
          "google_place_id": "ChIJAf_Z9HjQwxURnAt8pmn2E68",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Maki+House+-+Salamah+%2F+Sari+Road&query_place_id=ChIJAf_Z9HjQwxURnAt8pmn2E68",
          "google_rating": 4.6,
          "google_review_count": 2725,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:45-03:00; Thu-Fri 12:45-04:00",
          "phone": "+966920033371",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tom Yum Kani Soup",
          "name_ar": "Tom Yum Kani Soup",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Maki Bowl Nuts Crunchy",
          "name_ar": "Maki Bowl Nuts Crunchy",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Hot Cheddar sushi",
          "name_ar": "Hot Cheddar sushi",
          "is_signature": false,
          "sort_order": 2
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Wakame Platter",
      "signature_dish_en": "Wakame Platter",
      "vibe_tags_ar": [
        "سوشي ولاونج فاخر",
        "أجواء راقية ومميزة",
        "أطباق طازجة وصحية",
        "طريق الملك والروضة وأبحر"
      ],
      "vibe_tags_en": [
        "Premium Sushi & Lounge",
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
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_zahra",
        "al_rawdah",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation"
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
          "name_en": "Wakame Platter",
          "name_ar": "Wakame Platter",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Sushi Party",
          "name_ar": "Sushi Party",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Cali 15",
          "name_ar": "Cali 15",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "gold_sushi_club",
      "canonical_name": "Gold Sushi Club",
      "arabic_name": "جولد سوشي كلوب",
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Sakura shrimp noodles",
      "signature_dish_en": "Sakura shrimp noodles",
      "vibe_tags_ar": [
        "نادي سوشي راقي",
        "سوشي ونودلز يابانية",
        "أجواء عصرية أنيقة",
        "شارع صاري والمحمدية وأبحر"
      ],
      "vibe_tags_en": [
        "Upscale Sushi Club",
        "Artisan Sushi & Noodles",
        "Chic Trendy Ambience",
        "Sari, Mohammadiyyah & Obhur"
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
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_rawdah",
        "al_mohammadiyyah",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "gold_sushi_club",
          "branch_name_en": "Gold Sushi Club - Sari",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Sari Gate Center, Sari St, Ar Rawdah, Jeddah 23435",
          "latitude": 21.576109499999998,
          "longitude": 39.1507972,
          "maps_business_name": "Gold Sushi Club",
          "google_place_id": "ChIJNcoLQgPQwxURH2A1_KQ4VUM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Gold+Sushi+Club+-+Sari&query_place_id=ChIJNcoLQgPQwxURH2A1_KQ4VUM",
          "google_rating": 4.6,
          "google_review_count": 4783,
          "operating_status": "open",
          "hours": "Daily about 13:00-02:00",
          "phone": "+966126068069",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "gold_sushi_club",
          "branch_name_en": "Gold Sushi Club - Al Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23623",
          "latitude": 21.6474901,
          "longitude": 39.1278283,
          "maps_business_name": "Gold Sushi Club",
          "google_place_id": "ChIJrwcqZJHZwxURFH6UBYBUU9s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Gold+Sushi+Club+-+Al+Mohammadiyyah&query_place_id=ChIJrwcqZJHZwxURFH6UBYBUU9s",
          "google_rating": 4.5,
          "google_review_count": 1283,
          "operating_status": "open",
          "hours": "Daily 13:00-02:00",
          "phone": "+966126999850",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "gold_sushi_club",
          "branch_name_en": "Gold Sushi Club - Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah AlFiasal St, Obhur Dist, Jeddah 23819",
          "latitude": 21.7471923,
          "longitude": 39.1122582,
          "maps_business_name": "Gold Sushi Club",
          "google_place_id": "ChIJhXWABVhiwRURPIEld4l2VUQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Gold+Sushi+Club+-+Obhur&query_place_id=ChIJhXWABVhiwRURPIEld4l2VUQ",
          "google_rating": 4.3,
          "google_review_count": 628,
          "operating_status": "open",
          "hours": "Sun-Wed 13:00-01:00; Thu-Sat 13:00-02:00",
          "phone": "+966122899914",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Sakura shrimp noodles",
          "name_ar": "Sakura shrimp noodles",
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
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "تشكيلة السوشي والنيجيري الخاصة",
      "signature_dish_en": "Specialty Sushi Rolls & Nigiri",
      "vibe_tags_ar": [
        "سوشي مبتكر وعصري",
        "توصيل قوي وسريع",
        "خيارات بوكسات غنية",
        "شارع صاري الزهراء"
      ],
      "vibe_tags_en": [
        "Innovative Modern Sushi",
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
          "name_en": "Specialty Sushi Rolls & Nigiri",
          "name_ar": "تشكيلة السوشي والنيجيري الخاصة",
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
      "signature_dish_ar": "Shiro Box",
      "signature_dish_en": "Shiro Box",
      "vibe_tags_ar": [
        "بوكسات سوشي شهيرة",
        "مزيج كرانشي وكاليفورنيا",
        "حي الروضة",
        "سهرات ولذة سريعة"
      ],
      "vibe_tags_en": [
        "Popular Sushi Boxes",
        "Crunchy & California Rolls",
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
        "hungerstation"
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
          "name_en": "Shiro Box",
          "name_ar": "Shiro Box",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Crunchy Box",
          "name_ar": "Crunchy Box",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "California Box A",
          "name_ar": "California Box A",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Salmon Mix Box",
          "name_ar": "Salmon Mix Box",
          "is_signature": false,
          "sort_order": 3
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
      "estimated_spend_min_sar": 120,
      "estimated_spend_max_sar": 300,
      "signature_dish_ar": "fresh nigiri",
      "signature_dish_en": "fresh nigiri",
      "vibe_tags_ar": [
        "مطعم ياباني فاخر عالمي",
        "أطباق نيجيري وروبيان تيمبورا",
        "البساتين مول التحلية",
        "جلسات استثنائية راقية"
      ],
      "vibe_tags_en": [
        "World-Class Fine Dining",
        "Artisan Nigiri & Tempura",
        "Al Basateen Mall Tahlia",
        "Extraordinary Luxury Ambience"
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
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "myazu",
          "branch_name_en": "MYAZU",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
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
          "name_en": "fresh nigiri",
          "name_ar": "fresh nigiri",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken gyoza",
          "name_ar": "chicken gyoza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "popcorn shrimp",
          "name_ar": "popcorn shrimp",
          "is_signature": false,
          "sort_order": 2
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Tokujou Sushi",
      "signature_dish_en": "Tokujou Sushi",
      "vibe_tags_ar": [
        "مطعم ياباني أصيل عريق",
        "كراون بلازا الحمراء",
        "ساشيمي وسوشي تقليدي",
        "أجواء يابانية هادئة"
      ],
      "vibe_tags_en": [
        "Authentic Heritage Japanese",
        "Crowne Plaza Al Hamra",
        "Traditional Sashimi & Sushi",
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
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_hamra"
      ],
      "delivery_platforms": [
        "hungerstation"
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
          "name_en": "Tokujou Sushi",
          "name_ar": "Tokujou Sushi",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Nami Sushi Moriawase",
          "name_ar": "Nami Sushi Moriawase",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "assorted sashimi",
          "name_ar": "assorted sashimi",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "sushiart",
      "canonical_name": "SushiArt",
      "arabic_name": "سوشي ارت",
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
      "signature_dish_ar": "Samurai Roll",
      "signature_dish_en": "Samurai Roll",
      "vibe_tags_ar": [
        "سوشي عصري فني",
        "رد سي مول",
        "أطباق صحية وساشيمي",
        "جلسات عصرية مريحة"
      ],
      "vibe_tags_en": [
        "Artisan French-Japanese Sushi",
        "Red Sea Mall",
        "Healthy Bites & Sashimi",
        "Relaxed Modern Mall Dining"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "delivery_strong",
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
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sushiart",
          "branch_name_en": "SushiArt",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Red Sea Mall, Level 1, 3020 King Abdul Aziz Rd, Ash Shati, Jeddah 23612",
          "latitude": 21.6278009,
          "longitude": 39.1116405,
          "maps_business_name": "SushiArt",
          "google_place_id": "ChIJPztsYc3bwxURR9sS2lrcUu0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=SushiArt&query_place_id=ChIJPztsYc3bwxURR9sS2lrcUu0",
          "google_rating": 4.7,
          "google_review_count": 4197,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 11:00-00:00; Thu-Fri 11:00-00:30",
          "phone": "+966535303337",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Samurai Roll",
          "name_ar": "Samurai Roll",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "shrimp tempura",
          "name_ar": "shrimp tempura",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "shrimp gyoza",
          "name_ar": "shrimp gyoza",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "crab salad",
          "name_ar": "crab salad",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "sushi_yoshi",
      "canonical_name": "Sushi Yoshi",
      "arabic_name": "سوشي يوشي",
      "categories": [
        "sushi",
        "seafood",
        "asian"
      ],
      "primary_category": "sushi",
      "secondary_categories": [
        "seafood",
        "asian"
      ],
      "subcategories": [
        "seafood",
        "asian"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Signature Box",
      "signature_dish_en": "Signature Box",
      "vibe_tags_ar": [
        "مطعم سوشي وبحري عريق",
        "إطلالة الكورنيش والحمراء",
        "بوكسات مقلية وسوشي كلاسيك",
        "سهرات حتى منتصف الليل"
      ],
      "vibe_tags_en": [
        "Heritage Sushi & Seafood",
        "Corniche & Al Hamra Views",
        "Signature Fried Rolls & Classic Maki",
        "Late Night Dining"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_shati",
        "al_hamra",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "sushi_yoshi",
          "branch_name_en": "Sushi Yoshi - Corniche",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Corniche, Jeddah 23512",
          "latitude": 21.6153968,
          "longitude": 39.108121,
          "maps_business_name": "Sushi Yoshi",
          "google_place_id": "ChIJv9s8BrbbwxURHJfAvM5JGug",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Sushi+Yoshi+-+Corniche&query_place_id=ChIJv9s8BrbbwxURHJfAvM5JGug",
          "google_rating": 4.3,
          "google_review_count": 166,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-00:00; Thu-Fri 13:00-01:00",
          "phone": "+966920008506",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sushi_yoshi",
          "branch_name_en": "Sushi Yoshi - Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "Commercial Center next to Aroma Café, Al Kurnaysh Br Rd, Al Hamra, Jeddah 23212",
          "latitude": 21.5164375,
          "longitude": 39.154312499999996,
          "maps_business_name": "Sushi Yoshi",
          "google_place_id": "ChIJ5ytZWH3FwxURHiK_CAHoQKM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Sushi+Yoshi+-+Al+Hamra&query_place_id=ChIJ5ytZWH3FwxURHiK_CAHoQKM",
          "google_rating": 4,
          "google_review_count": 558,
          "operating_status": "open",
          "hours": "Mostly 12:30-00:00; Fri 12:45-01:00",
          "phone": "+966532276209",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sushi_yoshi",
          "branch_name_en": "Sushi Yoshi - Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Q49M+XH5, beside Batterjee Medical College, Obhur Al-Shamaliyah, Jeddah 23819",
          "latitude": 21.7698966,
          "longitude": 39.1339888,
          "maps_business_name": "Sushi Yoshi",
          "google_place_id": "ChIJyYJI2j9jwRURqc8Exmjbh98",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Sushi+Yoshi+-+Obhur&query_place_id=ChIJyYJI2j9jwRURqc8Exmjbh98",
          "google_rating": 4.2,
          "google_review_count": 444,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 12:00-00:00; Thu-Fri 12:00-01:00",
          "phone": "+966532279665",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Signature Box",
          "name_ar": "Signature Box",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Salmon Galore",
          "name_ar": "Salmon Galore",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mixed Fried Rolls",
          "name_ar": "Mixed Fried Rolls",
          "is_signature": false,
          "sort_order": 2
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
      "estimated_spend_min_sar": 120,
      "estimated_spend_max_sar": 300,
      "signature_dish_ar": "nigiri",
      "signature_dish_en": "nigiri",
      "vibe_tags_ar": [
        "مطعم نيكاي ياباني فاخر",
        "دليل ميشلان جدة",
        "مجمع ليلتي طريق الملك",
        "تجربة طهي مبتكرة واستثنائية"
      ],
      "vibe_tags_en": [
        "Luxury Nikkei Japanese",
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
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_khalidiyyah"
      ],
      "delivery_platforms": [
        "hungerstation"
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
          "name_en": "nigiri",
          "name_ar": "nigiri",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "ceviche",
          "name_ar": "ceviche",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "crunchy shrimp",
          "name_ar": "crunchy shrimp",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "tanuki_sushi",
      "canonical_name": "Tanuki Sushi",
      "arabic_name": "سوشي تانوكي",
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
      "signature_dish_ar": "Tanuki Lovers 24pc",
      "signature_dish_en": "Tanuki Lovers 24pc",
      "vibe_tags_ar": [
        "سوشي شبابي مبتكر",
        "كيكات سوشي وبوبس",
        "حي السلامة",
        "سهرات وتوصيل نشط"
      ],
      "vibe_tags_en": [
        "Creative Trendy Sushi",
        "Sushi Cakes & Push Pops",
        "As Salamah District",
        "Late Night & Delivery"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
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
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "tanuki_sushi",
          "branch_name_en": "Tanuki Sushi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "As Salamah, Jeddah 23437",
          "latitude": 21.5911296,
          "longitude": 39.152675699999996,
          "maps_business_name": "Tanuki Sushi",
          "google_place_id": "ChIJf-dSVQLbwxUR8iDYGoWNcM4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Tanuki+Sushi&query_place_id=ChIJf-dSVQLbwxUR8iDYGoWNcM4",
          "google_rating": 4.2,
          "google_review_count": 1038,
          "operating_status": "open",
          "hours": "Sun-Wed 12:00-01:00; Thu-Sat 12:00-02:00",
          "phone": "+966551723446",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tanuki Lovers 24pc",
          "name_ar": "Tanuki Lovers 24pc",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Tanuki Birthday Cake",
          "name_ar": "Tanuki Birthday Cake",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "California Sushi Push Pop",
          "name_ar": "California Sushi Push Pop",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "kimono",
      "canonical_name": "KIMONO",
      "arabic_name": "كيمونو",
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "تشكيلة السوشي والنيجيري الخاصة",
      "signature_dish_en": "Specialty Sushi Rolls & Nigiri",
      "vibe_tags_ar": [
        "مطعم ياباني راقي",
        "ذا بوينت شارع عبدالمقصود خوجة",
        "أجواء عصرية وسوشي نيجيري",
        "حي الروضة"
      ],
      "vibe_tags_en": [
        "Chic Japanese Eatery",
        "The Point Abdul Maqsud Khojah",
        "Trendy Vibe & Artisan Nigiri",
        "Ar Rawdah District"
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
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "kimono",
          "branch_name_en": "KIMONO",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "2573 Abdul Maqsud Khojah, Jeddah 23435",
          "latitude": 21.5733167,
          "longitude": 39.1481248,
          "maps_business_name": "KIMONO",
          "google_place_id": "ChIJC4K6QgDbwxUREH5ZRDRnns8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=KIMONO&query_place_id=ChIJC4K6QgDbwxUREH5ZRDRnns8",
          "google_rating": 4.6,
          "google_review_count": 859,
          "operating_status": "open",
          "hours": "Daily 14:30-00:30",
          "phone": "+966555125082",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Specialty Sushi Rolls & Nigiri",
          "name_ar": "تشكيلة السوشي والنيجيري الخاصة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "ikigai_sushi_restaurant",
      "canonical_name": "Ikigai Sushi Restaurant",
      "arabic_name": "اكاچي سوشي",
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
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Classic Sushi Combo",
      "signature_dish_en": "Classic Sushi Combo",
      "vibe_tags_ar": [
        "مختص سوشي محلي",
        "كومبو سوشي وكرانشي",
        "حي الحمراء",
        "سهرات حتى الفجر"
      ],
      "vibe_tags_en": [
        "Local Sushi Specialist",
        "Signature Combos & Crunchy Rolls",
        "Al Hamra District",
        "Late Night Until 2am"
      ],
      "reputation_tags": [
        "hidden_gem"
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
        "al_hamra"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "ikigai_sushi_restaurant",
          "branch_name_en": "Ikigai Sushi Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "3236 Arafat, Al Hamra, Jeddah 23323",
          "latitude": 21.5381395,
          "longitude": 39.1651218,
          "maps_business_name": "Ikigai Sushi Restaurant",
          "google_place_id": "ChIJu-VXzIPPwxURmHqIoGsSBk4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Ikigai+Sushi+Restaurant&query_place_id=ChIJu-VXzIPPwxURmHqIoGsSBk4",
          "google_rating": 4.3,
          "google_review_count": 590,
          "operating_status": "open",
          "hours": "Daily 13:00-02:00",
          "phone": "+966558150945",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Classic Sushi Combo",
          "name_ar": "Classic Sushi Combo",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Special Sushi Combo",
          "name_ar": "Special Sushi Combo",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Super Crunchy Roll",
          "name_ar": "Super Crunchy Roll",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "ashi_sushi",
      "canonical_name": "Ashi Sushi",
      "arabic_name": "آشي سوشي",
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
      "signature_dish_ar": "تشكيلة السوشي والنيجيري الخاصة",
      "signature_dish_en": "Specialty Sushi Rolls & Nigiri",
      "vibe_tags_ar": [
        "مطعم سوشي ياباني محبوب",
        "شارع سعود الفيصل الروضة",
        "توصيل نشط وسريع",
        "أجواء مريحة"
      ],
      "vibe_tags_en": [
        "Beloved Local Sushi",
        "Prince Saud Al Faisal Ar Rawdah",
        "Active Delivery & Takeaway",
        "Cozy Atmosphere"
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
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "ashi_sushi",
          "branch_name_en": "Ashi Sushi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Saud Al Faisal, Ar Rawdah, Jeddah 23433",
          "latitude": 21.559883799999998,
          "longitude": 39.1539022,
          "maps_business_name": "Ashi Sushi",
          "google_place_id": "ChIJ6Vq0IHzQwxURJVdTkGOWqyw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Ashi+Sushi&query_place_id=ChIJ6Vq0IHzQwxURJVdTkGOWqyw",
          "google_rating": 4,
          "google_review_count": 1460,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 13:00-01:00; Thu-Fri 13:30-01:30",
          "phone": "+966126044991",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Specialty Sushi Rolls & Nigiri",
          "name_ar": "تشكيلة السوشي والنيجيري الخاصة",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "fuji_japanese_restaurant",
      "canonical_name": "Fuji Japanese Restaurant",
      "arabic_name": "مطعم فوجي",
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Salmon Oshisushi",
      "signature_dish_en": "Salmon Oshisushi",
      "vibe_tags_ar": [
        "مطعم ياباني كلاسيكي عريق",
        "مركز برودواي طريق الملك",
        "أوشي سوشي وقارب ماكي",
        "أجواء عائلية أصيلة"
      ],
      "vibe_tags_en": [
        "Heritage Japanese Classic",
        "Broadway Center King Road",
        "Oshisushi & Maki Boats",
        "Authentic Family Dining"
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
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "fuji_japanese_restaurant",
          "branch_name_en": "Fuji Japanese Restaurant",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Broadway Center, King Abdulaziz Service Rd, Al Zahra, Jeddah 23424",
          "latitude": 21.5761657,
          "longitude": 39.1272861,
          "maps_business_name": "Fuji Japanese Restaurant",
          "google_place_id": "ChIJFX7bUp3bwxURIKGYRCBJLXY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Fuji+Japanese+Restaurant&query_place_id=ChIJFX7bUp3bwxURIKGYRCBJLXY",
          "google_rating": 4.5,
          "google_review_count": 1197,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 16:00-00:00; Thu-Fri 16:00-01:00",
          "phone": "+966539557771",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Salmon Oshisushi",
          "name_ar": "Salmon Oshisushi",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Maki Boat",
          "name_ar": "Maki Boat",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "California Roll",
          "name_ar": "California Roll",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "ricci_san",
      "canonical_name": "Ricci San",
      "arabic_name": "ريتشي سان",
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
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Tempura Shrimp Roll",
      "signature_dish_en": "Tempura Shrimp Roll",
      "vibe_tags_ar": [
        "مطعم ياباني صاعد مميز",
        "أبحر الجنوبية طريق الملك",
        "أوماكاسي وسكالوب رول",
        "سهرات راقية ومميزة"
      ],
      "vibe_tags_en": [
        "Rising Japanese Eatery",
        "South Obhur King Road",
        "Omakase Sashimi & Scallop Rolls",
        "Chic Coastal Dining"
      ],
      "reputation_tags": [
        "rising"
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
        "abhur_al_janoubiyah"
      ],
      "delivery_platforms": [
        "hungerstation"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "ricci_san",
          "branch_name_en": "Ricci San",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_janoubiyah",
          "address_en": "King Abdul Aziz Rd, Abhur Al Junoobiyah, Jeddah 21451",
          "latitude": 21.708685499999998,
          "longitude": 39.102816499999996,
          "maps_business_name": "Ricci San",
          "google_place_id": "ChIJ-5-GeVTZwxURQ0_pDBgGlhc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Ricci+San&query_place_id=ChIJ-5-GeVTZwxURQ0_pDBgGlhc",
          "google_rating": 4.8,
          "google_review_count": 1548,
          "operating_status": "open",
          "hours": "Sun-Wed 13:00-00:00; Thu-Sat 13:00-01:00",
          "phone": "+966500031777",
          "geographic_notes": "Located in canonical district abhur_al_janoubiyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tempura Shrimp Roll",
          "name_ar": "Tempura Shrimp Roll",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Scallop Roll",
          "name_ar": "Scallop Roll",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "salmon nigiri",
          "name_ar": "salmon nigiri",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "omakase sashimi",
          "name_ar": "omakase sashimi",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 1. Upsert public.restaurants
-- Reuses existing restaurant identity 'wakame' while inserting the other 15 verified brands
WITH catalog AS (SELECT payload FROM _sushi_catalog), brands AS (
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
  primary_category=EXCLUDED.primary_category,
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  editorial_role=EXCLUDED.editorial_role,
  tier=EXCLUDED.tier,
  price_tier=EXCLUDED.price_tier,
  price_position=EXCLUDED.price_position,
  signature_dish_ar=EXCLUDED.signature_dish_ar,
  signature_dish_en=EXCLUDED.signature_dish_en,
  branches=EXCLUDED.branches,
  is_city_wide=EXCLUDED.is_city_wide,
  time_slots=EXCLUDED.time_slots,
  closing_time_ar=EXCLUDED.closing_time_ar,
  is_open_late=EXCLUDED.is_open_late,
  platforms=EXCLUDED.platforms,
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  last_verified_at=EXCLUDED.last_verified_at,
  research_use='production_ready'::public.research_use;

-- 2. Cleanup stale best sellers and sources for brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _sushi_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
);

DELETE FROM public.restaurant_sources s USING _sushi_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _sushi_catalog), branches AS (
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
  district=EXCLUDED.district,
  address_en=EXCLUDED.address_en,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  maps_business_name=EXCLUDED.maps_business_name,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert signature dishes into public.restaurant_best_sellers
WITH catalog AS (SELECT payload FROM _sushi_catalog), sellers AS (
  SELECT b->>'brand_id' AS restaurant_id, item
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
  'Certified Sushi Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _sushi_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _sushi_catalog), branches AS (
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
