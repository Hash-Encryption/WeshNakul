-- Google-verified Jeddah Italian production catalog.
-- Source: docs/research/jeddah-italian-pass-d-corrected.json
-- 16 approved brands, 22 verified physical branches (21 canonical, 1 outer-district caution branch).
-- Reconciles 6 Pizza-catalog overlaps (jon_and_vinnys, napoli_blu, pizzalio, verra_pizza, wood_fire_pizza_lenuo, il_postino_pizzeria) without duplicates.
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Apply after 20260927000200_jeddah_grills_catalog.sql.
BEGIN;

CREATE TEMP TABLE _italian_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _italian_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Italian Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-27",
    "brand_count": 16,
    "branch_count": 22,
    "canonical_branch_count": 21,
    "outer_caution_branch_count": 1
  },
  "brands": [
    {
      "brand_id": "jon_and_vinnys",
      "canonical_name": "Jon & Vinny's",
      "arabic_name": "جون آند فينيز",
      "categories": [
        "italian",
        "italian_american",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "italian_american",
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "italian_american",
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Spicy Fusilli",
      "signature_dish_en": "Spicy Fusilli",
      "vibe_tags_ar": [
        "أيقونة لوس أنجلوس",
        "إيطالي أمريكي فاخر",
        "أجواء عصرية",
        "جلسات راقية"
      ],
      "vibe_tags_en": [
        "LA Icon",
        "Upscale Italian-American",
        "Trendy Hotspot",
        "Premium Dining"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout",
        "late_night",
        "premium"
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
      "canonical_districts": [
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://jonandvinnysksa.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "jon_and_vinnys",
          "branch_name_en": "La Paz / As Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "La Paz Plaza, Prince Sultan Street, As Salamah, Jeddah 23525, Saudi Arabia",
          "latitude": 21.6036875,
          "longitude": 39.1430625,
          "maps_business_name": "Jon & Vinny's",
          "google_place_id": "ChIJL1hhI4zbwxURYcBSwlTBhLo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJL1hhI4zbwxURYcBSwlTBhLo",
          "google_rating": 4.5,
          "google_review_count": 5189,
          "operating_status": "open",
          "hours": "Sat–Tue 08:00–23:30; Wed–Fri 08:00–01:30",
          "phone": "9200 18212",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Spicy Fusilli",
          "name_ar": "Spicy Fusilli",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Spaghetti Limone",
          "name_ar": "Spaghetti Limone",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Chicken Parmigiana",
          "name_ar": "Chicken Parmigiana",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Margherita Pizza",
          "name_ar": "Margherita Pizza",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "noto",
      "canonical_name": "Noto",
      "arabic_name": "نوتو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Truffle Tubetti Pasta",
      "signature_dish_en": "Truffle Tubetti Pasta",
      "vibe_tags_ar": [
        "إيطالي فاخر وراقي",
        "جدة ووك والتحلية",
        "بيتزا وباستا صقلية",
        "أجواء أنيقة"
      ],
      "vibe_tags_en": [
        "Luxury Italian Dining",
        "Jeddah Walk Tahlia",
        "Sicilian Pizza & Pasta",
        "Chic Ambience"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "premium"
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
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "noto",
          "branch_name_en": "Jeddah Walk",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "Cascade at Jeddah Walk, Tahlia Street, Al Khalidiyyah, Jeddah 23421, Saudi Arabia",
          "latitude": 21.548520999999997,
          "longitude": 39.1382562,
          "maps_business_name": "Noto",
          "google_place_id": "ChIJUyfUUtHFwxURvBANkV2JDck",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUyfUUtHFwxURvBANkV2JDck",
          "google_rating": 4.7,
          "google_review_count": 3321,
          "operating_status": "open",
          "hours": "Sun–Wed 13:00–01:00; Thu–Sat 13:00–01:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Truffle Tubetti Pasta",
          "name_ar": "Truffle Tubetti Pasta",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Neapolitan Pizza",
          "name_ar": "Neapolitan Pizza",
          "is_signature": false,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "san_carlo_cicchetti",
      "canonical_name": "San Carlo Cicchetti",
      "arabic_name": "سان كارلو تشيكيتّي",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Tartufo Pizza",
      "signature_dish_en": "Tartufo Pizza",
      "vibe_tags_ar": [
        "سلسلة إيطالية عالمية فاخرة",
        "أطباق تشيكيتّي فينيسية",
        "أجواء راقية ومميزة",
        "شارع التحلية"
      ],
      "vibe_tags_en": [
        "World Renowned Italian",
        "Venetian Cicchetti Plates",
        "Fine Dining Elegance",
        "Tahlia Street"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "dine_in_strong",
        "premium"
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
      "official_website": "https://sancarlocicchetti.sa/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "san_carlo_cicchetti",
          "branch_name_en": "Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Ar Rawdah, Jeddah 23431, Saudi Arabia",
          "latitude": 21.550590099999997,
          "longitude": 39.1541522,
          "maps_business_name": "San Carlo Cicchetti",
          "google_place_id": "ChIJDf-YJh7bwxURl0MqeLVAWhw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJDf-YJh7bwxURl0MqeLVAWhw",
          "google_rating": 4.2,
          "google_review_count": 4000,
          "operating_status": "open",
          "hours": "Sun–Tue 13:00–00:00; Wed–Fri 13:00–01:30; Sat 13:00–00:00",
          "phone": "09200 04060",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Tartufo Pizza",
          "name_ar": "Tartufo Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Burrata Pizza",
          "name_ar": "Burrata Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Truffle Ravioli",
          "name_ar": "Truffle Ravioli",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Lobster Risotto",
          "name_ar": "Lobster Risotto",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "piatto",
      "canonical_name": "Piatto",
      "arabic_name": "بياتو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Fettuccine Alfredo",
      "signature_dish_en": "Fettuccine Alfredo",
      "vibe_tags_ar": [
        "مطعم إيطالي عائلي",
        "أطباق باستا وبيتزا شهيرة",
        "أجواء مريحة ولمات",
        "فروع متعددة"
      ],
      "vibe_tags_en": [
        "Family Italian Classic",
        "Famous Pasta & Pizza",
        "Comfortable Ambience",
        "Multiple Locations"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "casual_hangout",
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
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_zahra",
        "al_mohammadiyyah",
        "al_faiha",
        "an_nuzhah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.alfaco.com.sa/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "piatto",
          "branch_name_en": "Etoile / Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "Etoile Center Next to Stars Avenue Mall, King Abdulaziz Rd, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5758945,
          "longitude": 39.127302,
          "maps_business_name": "Piatto",
          "google_place_id": "ChIJv0Uh5unawxURKQlZ_jaEdTY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJv0Uh5unawxURKQlZ_jaEdTY",
          "google_rating": 4.3,
          "google_review_count": 8870,
          "operating_status": "open",
          "hours": "Sun–Wed 11:00–02:00; Thu 11:00–03:00; Fri 13:00–03:00; Sat 11:00–02:00",
          "phone": "012 692 2501",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "piatto",
          "branch_name_en": "Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Al-Gathmi Center, 7639 Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23621, Saudi Arabia",
          "latitude": 21.6379421,
          "longitude": 39.1319386,
          "maps_business_name": "Piatto",
          "google_place_id": "ChIJCbBXZovZwxURLTahf-whPQo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCbBXZovZwxURLTahf-whPQo",
          "google_rating": 4.3,
          "google_review_count": 6833,
          "operating_status": "open",
          "hours": "Sun–Wed 11:00–01:00; Thu–Fri 11:00–02:00; Sat 11:00–01:00",
          "phone": "012 622 3464",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "piatto",
          "branch_name_en": "Emaar Square",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "Emaar Square, Building 45, Al Fayha, Jeddah 22241, Saudi Arabia",
          "latitude": 21.5103848,
          "longitude": 39.202632699999995,
          "maps_business_name": "Piatto",
          "google_place_id": "ChIJZb0FIa7PwxURV0LcamCcdhA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJZb0FIa7PwxURV0LcamCcdhA",
          "google_rating": 4.3,
          "google_review_count": 4033,
          "operating_status": "open",
          "hours": "Sun–Wed 11:00–01:00; Thu–Fri 11:00–02:00; Sat 11:00–01:00",
          "phone": "012 606 0092",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "piatto",
          "branch_name_en": "The Village",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "The Village Mall, Prince Talal Bin Mansour Rd, Al Asalah, Jeddah 23738, Saudi Arabia",
          "latitude": 21.773612999999997,
          "longitude": 39.167837899999995,
          "maps_business_name": "Piatto",
          "google_place_id": "ChIJyweiP5h9wRURge_HLN6pGWk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJyweiP5h9wRURge_HLN6pGWk",
          "google_rating": 4.5,
          "google_review_count": 801,
          "operating_status": "open",
          "hours": "Sun–Wed 11:00–00:00; Thu–Sat 11:00–01:00",
          "phone": "012 212 0184",
          "geographic_notes": "Located in outer Jeddah district Al Asalah (The Village Mall), outside the 30 canonical districts; retained with usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "piatto",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, Second Floor, Madinah Rd, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6324683,
          "longitude": 39.1561302,
          "maps_business_name": "Piatto",
          "google_place_id": "ChIJca-CWSrXwxURgh2LAWQ2AZE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJca-CWSrXwxURgh2LAWQ2AZE",
          "google_rating": 4.6,
          "google_review_count": 3141,
          "operating_status": "open",
          "hours": "Sun–Thu 11:00–00:00; Fri–Sat 11:00–01:00",
          "phone": "012 612 2220",
          "geographic_notes": "Located in canonical district an_nuzhah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Fettuccine Alfredo",
          "name_ar": "Fettuccine Alfredo",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Chicken Parmigiana",
          "name_ar": "Chicken Parmigiana",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Lasagna",
          "name_ar": "Lasagna",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Margherita Pizza",
          "name_ar": "Margherita Pizza",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "olive_garden",
      "canonical_name": "Olive Garden",
      "arabic_name": "أوليف جاردن",
      "categories": [
        "italian",
        "italian_american",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "italian_american",
        "pasta"
      ],
      "subcategories": [
        "italian_american",
        "pasta"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "أشهر سلسلة إيطالية أمريكية",
        "أتيلييه لافي طريق الملك",
        "شوربات وسلطات لا محدودة",
        "أجواء عائلية"
      ],
      "vibe_tags_en": [
        "Famous Italian-American Chain",
        "Atelier LaVie King Road",
        "Unlimited Soup & Salad",
        "Family Friendly"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "casual_hangout",
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
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.olivegarden.com/international",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "olive_garden",
          "branch_name_en": "Atelier LaVie",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Atelier LaVie, 23514 King Abdulaziz Branch Rd, Al Shati, Jeddah 23514, Saudi Arabia",
          "latitude": 21.613484099999997,
          "longitude": 39.1179079,
          "maps_business_name": "Olive Garden",
          "google_place_id": "ChIJt5tYPPHbwxURUUbPlY7uzWo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJt5tYPPHbwxURUUbPlY7uzWo",
          "google_rating": 4.8,
          "google_review_count": 13269,
          "operating_status": "open",
          "hours": "Daily 12:00–02:00",
          "phone": "059 748 5555",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "eataly",
      "canonical_name": "Eataly",
      "arabic_name": "إيتالي",
      "categories": [
        "italian",
        "pizza",
        "pasta",
        "breakfast"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta",
        "breakfast"
      ],
      "subcategories": [
        "pizza",
        "pasta",
        "breakfast"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "سوق ومطعم إيطالي عالمي",
        "فطور وإفطار إيطالي راقي",
        "مخبوزات وباستا طازجة",
        "فايبز الأندلس"
      ],
      "vibe_tags_en": [
        "Global Italian Food Market",
        "Artisan Breakfast & Bakery",
        "Fresh Pasta & Pizza",
        "Vibes Al Andalus"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "dine_in_strong",
        "casual_hangout"
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
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_andalus"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://www.eatalyarabia.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "eataly",
          "branch_name_en": "Jeddah Vibes",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "Ground Floor, Vibes, 9144 Prince Mohammed Bin Abdulaziz St, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5516725,
          "longitude": 39.1602751,
          "maps_business_name": "Eataly",
          "google_place_id": "ChIJkR0wGgDRwxURbuskasl50nU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkR0wGgDRwxURbuskasl50nU",
          "google_rating": 4.6,
          "google_review_count": 1480,
          "operating_status": "open",
          "hours": "Daily 09:00–00:00",
          "phone": "054 702 9337",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "il_vero",
      "canonical_name": "IL Vero",
      "arabic_name": "إل فيرو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "بيتزا نابولية أصلية",
        "سهرات حتى وقت متأخر",
        "حي الأندلس",
        "أجواء إيطالية دافئة"
      ],
      "vibe_tags_en": [
        "Authentic Neapolitan Pizza",
        "Late Night Dining",
        "Al Andalus Neighborhood",
        "Cozy Italian Vibe"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "late_night",
        "casual_hangout",
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
        "al_andalus"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "il_vero",
          "branch_name_en": "Al Andalus",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_andalus",
          "address_en": "3139 Al Bouraidi, Al Andalus, Jeddah 23326, Saudi Arabia",
          "latitude": 21.5486041,
          "longitude": 39.1636355,
          "maps_business_name": "IL Vero",
          "google_place_id": "ChIJAwP2aQPQwxURGYkUSLA8hk0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAwP2aQPQwxURGYkUSLA8hk0",
          "google_rating": 4.4,
          "google_review_count": 716,
          "operating_status": "open",
          "hours": "Sun 13:00–03:00; Mon–Sat 12:00–03:00",
          "phone": "054 971 4040",
          "geographic_notes": "Located in canonical district al_andalus.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "portofino",
      "canonical_name": "Portofino",
      "arabic_name": "بورتوفينو",
      "categories": [
        "italian",
        "seafood",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "seafood",
        "pasta"
      ],
      "subcategories": [
        "seafood",
        "pasta"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Seafood Risotto",
      "signature_dish_en": "Seafood Risotto",
      "vibe_tags_ar": [
        "مطعم إيطالي وبحري عريق",
        "ريزوتو وثمار بحر كلاسيك",
        "حي الروضة",
        "أجواء كلاسيكية هادئة"
      ],
      "vibe_tags_en": [
        "Heritage Italian & Seafood",
        "Classic Risotto & Calamari",
        "Ar Rawdah District",
        "Classic Quiet Dining"
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
          "restaurant_id": "portofino",
          "branch_name_en": "Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "7096 2307 Prince Saud Al Faisal St, Ar Rawdah, Jeddah 23431, Saudi Arabia",
          "latitude": 21.5584541,
          "longitude": 39.145452899999995,
          "maps_business_name": "Portofino",
          "google_place_id": "ChIJnSdklK_awxURiwMU9F2xN6M",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJnSdklK_awxURiwMU9F2xN6M",
          "google_rating": 4.2,
          "google_review_count": 1351,
          "operating_status": "open",
          "hours": "Sun–Thu 13:00–16:00, 19:30–00:00; Fri 14:00–00:30; Sat 13:00–16:00, 19:30–00:00",
          "phone": "012 665 5855",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Seafood Risotto",
          "name_ar": "Seafood Risotto",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Olio Pasta",
          "name_ar": "Olio Pasta",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Fried Calamari",
          "name_ar": "Fried Calamari",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Milanese Veal",
          "name_ar": "Milanese Veal",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "vivaci",
      "canonical_name": "Vivaci",
      "arabic_name": "فيفاتشي",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "premium",
      "price_tier": "$$$",
      "estimated_spend_min_sar": 75,
      "estimated_spend_max_sar": 180,
      "signature_dish_ar": "Margherita Pizza",
      "signature_dish_en": "Margherita Pizza",
      "vibe_tags_ar": [
        "إيطالي راقي وعصري",
        "بيتزا حطب وباستا مميزة",
        "حي الزهراء",
        "أجواء حيوية رايقة"
      ],
      "vibe_tags_en": [
        "Artisan Italian Craft",
        "Wood-Fired Pizza & Pasta",
        "Al Zahra District",
        "Vibrant Trendy Ambience"
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
          "restaurant_id": "vivaci",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "7100 2537 Ahmad Al Khatib, Al Zahra, Jeddah 23425, Saudi Arabia",
          "latitude": 21.582274599999998,
          "longitude": 39.1300688,
          "maps_business_name": "Vivaci",
          "google_place_id": "ChIJDYKLVhrbwxURavlhB-QeaGQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJDYKLVhrbwxURavlhB-QeaGQ",
          "google_rating": 4.7,
          "google_review_count": 2485,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": "055 103 1177",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Margherita Pizza",
          "name_ar": "Margherita Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Risotto",
          "name_ar": "Risotto",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Lasagna",
          "name_ar": "Lasagna",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Burrata Pizza",
          "name_ar": "Burrata Pizza",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "napoli_blu",
      "canonical_name": "Napoli Blu",
      "arabic_name": "نابولي بلو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "بيتزا نابولية",
        "حطب ومختصة",
        "سهرات حتى الفجر",
        "جلسات شبابية"
      ],
      "vibe_tags_en": [
        "Neapolitan Style",
        "Artisan Oven",
        "Late Night Until 4am",
        "Trendy Spot"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "late_night",
        "casual_hangout",
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
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "napoli_blu",
          "branch_name_en": "Ar Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Hamad Al Jaser, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5769558,
          "longitude": 39.156721499999996,
          "maps_business_name": "Napoli Blu",
          "google_place_id": "ChIJM2DnNgDRwxUR2Z5xk02gukQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJM2DnNgDRwxUR2Z5xk02gukQ",
          "google_rating": 4.7,
          "google_review_count": 2926,
          "operating_status": "open",
          "hours": "Sat–Thu 07:00–03:00; Fri 13:00–04:00",
          "phone": "050 803 5530",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "il_postino_pizzeria",
      "canonical_name": "il Postino Pizzeria",
      "arabic_name": "إل بوستينو بيتزاريا",
      "categories": [
        "italian",
        "pizza"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza"
      ],
      "subcategories": [
        "pizza"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Burrata Pizza",
      "signature_dish_en": "Burrata Pizza",
      "vibe_tags_ar": [
        "إيطالي أصيل",
        "بيتزا حطب",
        "أجواء أوروبية",
        "عجينة مخمرة"
      ],
      "vibe_tags_en": [
        "Authentic Italian",
        "Wood-Fired",
        "European Vibe",
        "Fermented Dough"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "late_night",
        "casual_hangout",
        "dine_in_strong",
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
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_khalidiyyah",
        "al_murjan"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "il_postino_pizzeria",
          "branch_name_en": "Al Khalidiyyah / Sari Road",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_khalidiyyah",
          "address_en": "3803 Sari Branch Road, Al Khalidiyyah, Jeddah 23423, Saudi Arabia",
          "latitude": 21.574147600000003,
          "longitude": 39.142584299999996,
          "maps_business_name": "il Postino Pizzeria",
          "google_place_id": "ChIJOd4ucWnbwxUREsfKPgbPHMc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOd4ucWnbwxUREsfKPgbPHMc",
          "google_rating": 4.6,
          "google_review_count": 5278,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": "050 365 0985",
          "geographic_notes": "Located in canonical district al_khalidiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "il_postino_pizzeria",
          "branch_name_en": "Al Murjan / King Abdulaziz Road",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_murjan",
          "address_en": "JEJB6434, 6434 King Abdulaziz Branch Rd, 4299, Al Murjan, Jeddah 23715, Saudi Arabia",
          "latitude": 21.694570199999998,
          "longitude": 39.1081393,
          "maps_business_name": "il Postino Pizzeria",
          "google_place_id": "ChIJhfNya6HZwxURtxSMFrcWVnE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhfNya6HZwxURtxSMFrcWVnE",
          "google_rating": 4.7,
          "google_review_count": 5343,
          "operating_status": "open",
          "hours": "Daily 13:00–01:00",
          "phone": "053 030 3979",
          "geographic_notes": "Located in canonical district al_murjan.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Burrata Pizza",
          "name_ar": "Burrata Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Truffle Pizza",
          "name_ar": "Truffle Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Diavola Pizza",
          "name_ar": "Diavola Pizza",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "wood_fire_pizza_lenuo",
      "canonical_name": "Pizza Lenuo",
      "arabic_name": "بيتزا لينو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Jeddah Special Pizza",
      "signature_dish_en": "Jeddah Special Pizza",
      "vibe_tags_ar": [
        "فرن حطب عريق من ٢٠٠١",
        "بيتزا وباستا طازجة",
        "حي الحمراء",
        "محلي محبوب"
      ],
      "vibe_tags_en": [
        "Wood Fire Oven Since 2001",
        "Fresh Pizza & Pasta",
        "Al Hamra District",
        "Local Favorite"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
        "al_hamra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": "https://pizzalenuo.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "wood_fire_pizza_lenuo",
          "branch_name_en": "Al Hamra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamra",
          "address_en": "2916 Al Maadi, Al Hamra, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5138481,
          "longitude": 39.161190100000006,
          "maps_business_name": "Pizza Lenuo",
          "google_place_id": "ChIJwyXLvoXPwxURmPwwIPOhNPk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwyXLvoXPwxURmPwwIPOhNPk",
          "google_rating": 4.4,
          "google_review_count": 4040,
          "operating_status": "open",
          "hours": "Sat–Wed 12:00–00:45; Thu 12:00–01:45; Fri 13:00–01:45",
          "phone": "012 614 0663",
          "geographic_notes": "Located in canonical district al_hamra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Jeddah Special Pizza",
          "name_ar": "Jeddah Special Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Friends Pizza",
          "name_ar": "Friends Pizza",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Truffle Pizza",
          "name_ar": "Truffle Pizza",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Homemade Pasta",
          "name_ar": "Homemade Pasta",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "verra_pizza",
      "canonical_name": "Vera Pizza",
      "arabic_name": "ڤيرا",
      "categories": [
        "italian",
        "pizza",
        "wood_fired"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "wood_fired"
      ],
      "subcategories": [
        "pizza",
        "wood_fired"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "بيتزا حطب نابولية",
        "مكونات إيطالية مستوردة",
        "فروع الزهراء وأبحر",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Wood-Fired Pizza",
        "True Neapolitan",
        "Imported Italian",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "delivery_strong",
        "late_night",
        "casual_hangout",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_zahra",
        "abhur_al_shamaliyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "verra_pizza",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "4144, 6849 Batterjie Street, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.5979474,
          "longitude": 39.138719699999996,
          "maps_business_name": "Vera Pizza",
          "google_place_id": "ChIJc_9rnWbawxURdqShiels-ow",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc_9rnWbawxURdqShiels-ow",
          "google_rating": 4.5,
          "google_review_count": 4060,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": "9200 03213",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "verra_pizza",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al Shamaliyah, Jeddah 23826, Saudi Arabia",
          "latitude": 21.7608222,
          "longitude": 39.117422499999996,
          "maps_business_name": "Vera Pizza",
          "google_place_id": "ChIJUyizioNjwRURBwf0xqdZ0P4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUyizioNjwRURBwf0xqdZ0P4",
          "google_rating": 4.7,
          "google_review_count": 918,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 13:00–02:00",
          "phone": "9200 03213",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "salernoo",
      "canonical_name": "Salernoo",
      "arabic_name": "ساليرنو",
      "categories": [
        "italian",
        "pizza",
        "pasta"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "pasta"
      ],
      "subcategories": [
        "pizza",
        "pasta"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "Truffle Pizza",
      "signature_dish_en": "Truffle Pizza",
      "vibe_tags_ar": [
        "جوهرة إيطالية مخفية",
        "باستا تروفل وريزوتو",
        "حي الزهراء",
        "جلسات دافئة وهادئة"
      ],
      "vibe_tags_en": [
        "Italian Hidden Gem",
        "Truffle Pasta & Risotto",
        "Al Zahra District",
        "Intimate Cozy Dining"
      ],
      "reputation_tags": [
        "hidden_gem"
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
          "restaurant_id": "salernoo",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "3498 7798 Fahed Bei Zouair, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.606474499999997,
          "longitude": 39.1320943,
          "maps_business_name": "Salernoo",
          "google_place_id": "ChIJCTcptgHbwxURPbuWt4KeAi8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCTcptgHbwxURPbuWt4KeAi8",
          "google_rating": 4.6,
          "google_review_count": 1862,
          "operating_status": "open",
          "hours": "Sun 16:00–01:00; Mon–Sat 13:00–01:00",
          "phone": "054 928 3842",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Truffle Pizza",
          "name_ar": "Truffle Pizza",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Truffle Fettuccine",
          "name_ar": "Truffle Fettuccine",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Mushroom Risotto",
          "name_ar": "Mushroom Risotto",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "Caprese",
          "name_ar": "Caprese",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "il_castello",
      "canonical_name": "IL Castello",
      "arabic_name": "إل كاستيلو",
      "categories": [
        "italian",
        "pasta",
        "pizza"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pasta",
        "pizza"
      ],
      "subcategories": [
        "pasta",
        "pizza"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 45,
      "estimated_spend_max_sar": 95,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "مطعم إيطالي كلاسيك عريق",
        "باستا وبيكاتا تقليدية",
        "حي الشرفية",
        "أجواء هادئة وأصيلة"
      ],
      "vibe_tags_en": [
        "Heritage Italian Trattoria",
        "Traditional Pasta & Veal",
        "Al Sharafeyah District",
        "Authentic Classic Charm"
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
        "al_sharafeyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "il_castello",
          "branch_name_en": "Al Sharafeyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sharafeyah",
          "address_en": "G5CP+R2G, Asad Allah, Al Sharafeyah, Jeddah 23218, Saudi Arabia",
          "latitude": 21.5220689,
          "longitude": 39.1850739,
          "maps_business_name": "IL Castello",
          "google_place_id": "ChIJQW4PGMbPwxUR-OfJcYLfYLg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQW4PGMbPwxUR-OfJcYLfYLg",
          "google_rating": 3.9,
          "google_review_count": 1477,
          "operating_status": "open",
          "hours": "Sun–Thu 13:00–15:30, 18:00–00:00; Fri 13:00–15:30, 18:00–00:00; Sat 13:00–15:30, 17:30–00:00",
          "phone": "012 660 6119",
          "geographic_notes": "Located in canonical district al_sharafeyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    },
    {
      "brand_id": "pizzalio",
      "canonical_name": "Pizzalio",
      "arabic_name": "بيتزاليو",
      "categories": [
        "italian",
        "pizza",
        "local_pizzeria"
      ],
      "primary_category": "italian",
      "secondary_categories": [
        "pizza",
        "local_pizzeria"
      ],
      "subcategories": [
        "pizza",
        "local_pizzeria"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "تشكيلة الباستا والبيتزا الإيطالية",
      "signature_dish_en": "Pasta & Pizza Specialties",
      "vibe_tags_ar": [
        "بيتزا إيطالية سريعة",
        "أسعار اقتصادية",
        "حي السلامة",
        "سريع وسفري"
      ],
      "vibe_tags_en": [
        "Fast Italian Pizza",
        "Value & Budget Friendly",
        "As Salamah District",
        "Quick Bite & Takeaway"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout",
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
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "pizzalio",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Rami Street, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5823848,
          "longitude": 39.1542442,
          "maps_business_name": "Pizzalio",
          "google_place_id": "ChIJc-aQA9PbwxUR2cOZdM6POTE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc-aQA9PbwxUR2cOZdM6POTE",
          "google_rating": 4.7,
          "google_review_count": 709,
          "operating_status": "open",
          "hours": "Sat–Wed 13:00–01:00; Thu–Fri 14:00–02:00",
          "phone": "057 399 4170",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Pasta & Pizza Specialties",
          "name_ar": "تشكيلة الباستا والبيتزا الإيطالية",
          "is_signature": true,
          "sort_order": 0
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 1. Upsert public.restaurants
-- Reuses existing restaurant identities for Pizza overlaps and adds 'italian' to categories
WITH catalog AS (SELECT payload FROM _italian_catalog), brands AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  -- Merge category memberships (adds 'italian' while preserving existing pizza/grills/etc.)
  categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.categories, EXCLUDED.categories)) item),
  secondary_categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.secondary_categories, EXCLUDED.secondary_categories)) item),
  subcategories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.subcategories, EXCLUDED.subcategories)) item),
  -- Preserve existing primary_category if already defined (e.g. pizza stays pizza)
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
DELETE FROM public.restaurant_best_sellers s USING _italian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
);

DELETE FROM public.restaurant_sources s USING _italian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _italian_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _italian_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
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
  'Certified Italian Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _italian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL
    AND b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
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
WITH catalog AS (SELECT payload FROM _italian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
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
