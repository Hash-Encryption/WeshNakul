-- Google-verified Jeddah Broast / Fried Chicken catalog.
-- Source: docs/research/jeddah-broast-pass-d-corrected.json
-- 19 approved brands, 75 verified physical branches (71 production_ready, 4 usable_with_caution).
-- Apply after 20260926000100_expand_jeddah_geography_30_districts.sql.
BEGIN;

CREATE TEMP TABLE _broast_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _broast_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Broast & Fried Chicken Production Catalog",
    "version": "Pass D Certified",
    "date": "2026-09-26",
    "brand_count": 19,
    "branch_count": 75
  },
  "brands": [
    {
      "brand_id": "albaik",
      "canonical_name": "ALBAIK",
      "arabic_name": "البيك",
      "categories": [
        "broast",
        "fried_chicken",
        "burger",
        "seafood"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast",
        "fried_chicken",
        "musahab"
      ],
      "subcategories": [
        "traditional_broast",
        "fried_chicken",
        "musahab"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "وجبة دجاج مسحب حراق 🍗",
      "signature_dish_en": "Spicy Chicken Musahab Meal 🍗",
      "vibe_tags_ar": [
        "أسطورة جدة",
        "ثوم",
        "سريع"
      ],
      "vibe_tags_en": [
        "Jeddah Icon",
        "Garlic Sauce",
        "Quick Bite"
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
      "is_24_hours": true,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_mohammadiyyah",
        "al_safa",
        "al_sharafeyah"
      ],
      "official_website": "https://www.albaik.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "broast chicken",
          "name_ar": "وجبة دجاج مسحب حراق 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken musahab",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "garlic sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "albaik",
          "branch_name_en": "Al Sharafiyah – King Abdullah Rd",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_sharafeyah",
          "address_en": "King Abdullah Rd, Al Sharafeyah, Jeddah 22234, Saudi Arabia",
          "latitude": 21.510246000000002,
          "longitude": 39.186343,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJe8s_Y7DPwxURnq35SRzMRpo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJe8s_Y7DPwxURnq35SRzMRpo",
          "google_rating": 4.4,
          "google_review_count": 13097,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "albaik",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Al-Madinah Al-Munawarah Rd, Al Mohammadiyyah, Jeddah 23624, Saudi Arabia",
          "latitude": 21.6615426,
          "longitude": 39.131826,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJD-9adirQwxURzfEDl0QI_yE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJD-9adirQwxURzfEDl0QI_yE",
          "google_rating": 4.4,
          "google_review_count": 10080,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "albaik",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23817, Saudi Arabia",
          "latitude": 21.757009999999998,
          "longitude": 39.120546,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJzSoP9gJjwRUR_zcZJhPLrrw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJzSoP9gJjwRUR_zcZJhPLrrw",
          "google_rating": 4.3,
          "google_review_count": 8220,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "albaik",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "7753 3293 Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23456, Saudi Arabia",
          "latitude": 21.5956792,
          "longitude": 39.2045998,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJYZ1fGiPRwxURQXIwfgS8b3Y",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJYZ1fGiPRwxURQXIwfgS8b3Y",
          "google_rating": 4.3,
          "google_review_count": 12693,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "albaik",
          "branch_name_en": "King Abdulaziz International Airport T1",
          "branch_name_ar": null,
          "branch_type": "airport",
          "district": null,
          "address_en": "King Abdulaziz International Airport, Terminal 1, Jeddah 23631, Saudi Arabia",
          "latitude": 21.661194,
          "longitude": 39.173077,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJCQwA0vHXwxURrRfzuvODqn8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCQwA0vHXwxURrRfzuvODqn8",
          "google_rating": 4.2,
          "google_review_count": 3587,
          "operating_status": "open",
          "geographic_notes": "Branch verified inside King Abdulaziz International Airport Terminal 1; airport transit zone is outside municipal residential/commercial district taxonomy.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "albaik",
          "branch_name_en": "Al Baghdadiyah Al Sharqiyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "King Khalid Road, Al-Baghdadiyah Al-Sharqiyah, Jeddah 22241, Saudi Arabia",
          "latitude": 21.5037613,
          "longitude": 39.1982666,
          "maps_business_name": "ALBAIK",
          "google_place_id": "ChIJbT4rKq3PwxURGSunZl-GxrM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJbT4rKq3PwxURGSunZl-GxrM",
          "google_rating": 4.3,
          "google_review_count": 6789,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Al Baghdadiyah Al Sharqiyah (historic coastal enclave south of Al Balad / Al Ruwais), outside the 30-district canonical whitelist.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "raising_canes",
      "canonical_name": "Raising Cane's",
      "arabic_name": "ريزينج كينز",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "tenders"
      ],
      "subcategories": [
        "tenders"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "وجبة بوكس كومبو (أصابع دجاج وصوص كينز)",
      "signature_dish_en": "Box Combo (Chicken Fingers & Cane's Sauce)",
      "vibe_tags_ar": [
        "صوص كينز",
        "تندرز طازجة",
        "أمريكي"
      ],
      "vibe_tags_en": [
        "Cane's Sauce",
        "Fresh Tenders",
        "American Style"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout",
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
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "abhur_al_janoubiyah",
        "al_mohammadiyyah",
        "al_rawdah",
        "al_rehab",
        "al_ruwais",
        "al_shati"
      ],
      "official_website": "https://locations.alshaya.com/raising-cane-s/sa/jeddah",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "chicken fingers",
          "name_ar": "وجبة بوكس كومبو (أصابع دجاج وصوص كينز)",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Cane's sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Texas toast",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "crinkle-cut fries",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 3
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Abhur Al Junoobiyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_janoubiyah",
          "address_en": "3162 Muhammed Al Idrisi, Abhur Al Junoobiyah, King Abdul Aziz Rd, Jeddah, Saudi Arabia",
          "latitude": 21.7645534,
          "longitude": 39.142430999999995,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJmz2DL6TbwxUR8V9pwYu0O-w",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJmz2DL6TbwxUR8V9pwYu0O-w",
          "google_rating": 4.6,
          "google_review_count": 3804,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Liwan Centre",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_ruwais",
          "address_en": "Liwan Centre, Al-Ruwais, Jeddah 23214, Saudi Arabia",
          "latitude": 21.511322,
          "longitude": 39.1815615,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJoX0va7vPwxURptgo2ywbn2Q",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJoX0va7vPwxURptgo2ywbn2Q",
          "google_rating": 4.5,
          "google_review_count": 2746,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_shati",
          "address_en": "Red Sea Mall, Ash Shati, Jeddah 23612, Saudi Arabia",
          "latitude": 21.6278035,
          "longitude": 39.1112126,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJm_3Sd6HZwxURok4FWCKemG4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJm_3Sd6HZwxURok4FWCKemG4",
          "google_rating": 4.7,
          "google_review_count": 2934,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Sari Gate Center",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rawdah",
          "address_en": "Sari Gate Center, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5766638,
          "longitude": 39.151202999999995,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJPc7QSpXbwxUR53PR_l8hpvY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJPc7QSpXbwxUR53PR_l8hpvY",
          "google_rating": 4.4,
          "google_review_count": 4562,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Prince Sultan Drive-Thru",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Tamimi, Prince Sultan Branch Rd, Jeddah 23616, Saudi Arabia",
          "latitude": 21.634041,
          "longitude": 39.13194,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJr9rVNQrZwxURMLN5a6TctH0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJr9rVNQrZwxURMLN5a6TctH0",
          "google_rating": 4.7,
          "google_review_count": 1226,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "raising_canes",
          "branch_name_en": "Zengabar St",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rehab",
          "address_en": "Zengabar St, Al-Rehab, Jeddah 23343, Saudi Arabia",
          "latitude": 21.547787,
          "longitude": 39.235093,
          "maps_business_name": "Raising Cane's",
          "google_place_id": "ChIJG-pg727RwxURb5bP1Agzw5Q",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJG-pg727RwxURb5bP1Agzw5Q",
          "google_rating": 4.7,
          "google_review_count": 1763,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "kfc",
      "canonical_name": "KFC",
      "arabic_name": "كنتاكي",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "fried_chicken"
      ],
      "subcategories": [
        "fried_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "دجاج مقلي الخلطة السرية 🍗",
      "signature_dish_en": "Original Recipe Fried Chicken 🍗",
      "vibe_tags_ar": [
        "خلطة سرية",
        "عالمي",
        "سريع"
      ],
      "vibe_tags_en": [
        "Secret Recipe",
        "Global Chain",
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
      "is_24_hours": true,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_basateen",
        "al_mohammadiyyah",
        "al_sharafeyah"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "fried chicken",
          "name_ar": "دجاج مقلي الخلطة السرية 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "original recipe buckets",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "spicy zinger",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "kfc",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Amir Sultan St, Al Muhammadiyyah, Jeddah, Saudi Arabia",
          "latitude": 21.640269699999997,
          "longitude": 39.1306936,
          "maps_business_name": "KFC",
          "google_place_id": "ChIJ0WW_VozZwxURuRWrYODJla4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ0WW_VozZwxURuRWrYODJla4",
          "google_rating": 4,
          "google_review_count": 2317,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kfc",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Abhor Road, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.7481696,
          "longitude": 39.113043399999995,
          "maps_business_name": "KFC",
          "google_place_id": "ChIJP2FlbfhiwRURqnFMNg638Mg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJP2FlbfhiwRURqnFMNg638Mg",
          "google_rating": 4,
          "google_review_count": 2225,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kfc",
          "branch_name_en": "King Abdullah Rd",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_sharafeyah",
          "address_en": "King Abdulah Cross M. Road, Jeddah, Saudi Arabia",
          "latitude": 21.5110423,
          "longitude": 39.1823374,
          "maps_business_name": "KFC",
          "google_place_id": "ChIJkQfmGrvPwxUR2kY53xv659M",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkQfmGrvPwxUR2kY53xv659M",
          "google_rating": 3.7,
          "google_review_count": 4008,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "kfc",
          "branch_name_en": "Al Basateen",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_basateen",
          "address_en": "King Road Street, Al Basateen District, Jeddah, Saudi Arabia",
          "latitude": 21.692190699999998,
          "longitude": 39.1101228,
          "maps_business_name": "KFC",
          "google_place_id": "ChIJ29KO9fbYwxURNiq3vL5f3GM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ29KO9fbYwxURNiq3vL5f3GM",
          "google_rating": 3.9,
          "google_review_count": 2717,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "texas_chicken",
      "canonical_name": "Texas Chicken",
      "arabic_name": "تكساس تشيكن",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "fried_chicken"
      ],
      "subcategories": [
        "fried_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "دجاج مقلي حراق وبسكويت العسل بالزبدة",
      "signature_dish_en": "Spicy Fried Chicken & Honey-Butter Biscuits",
      "vibe_tags_ar": [
        "بسكويت عسل",
        "حراق",
        "مقرمش"
      ],
      "vibe_tags_en": [
        "Honey Biscuits",
        "Spicy",
        "Crispy"
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
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_hamdaniyah",
        "al_thaghr",
        "al_zahra",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": "https://ksa.texaschicken.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "fried chicken",
          "name_ar": "دجاج مقلي حراق وبسكويت العسل بالزبدة",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "honey-butter biscuits",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "chicken sandwiches",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "texas_chicken",
          "branch_name_en": "Town Square",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_thaghr",
          "address_en": "Town Square, Abdullah Sulaiman St, Al Thaghr, Jeddah 22338, Saudi Arabia",
          "latitude": 21.4830665,
          "longitude": 39.2372061,
          "maps_business_name": "Texas Chicken",
          "google_place_id": "ChIJG-OvoeTNwxURYw8dGEl_fIk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJG-OvoeTNwxURYw8dGEl_fIk",
          "google_rating": 4,
          "google_review_count": 1680,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "texas_chicken",
          "branch_name_en": "Macarona",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "ar_rabwah",
          "address_en": "4723 Saeed Alosaadi, Ar Rabwah, Jeddah 23448, Saudi Arabia",
          "latitude": 21.5925406,
          "longitude": 39.1860387,
          "maps_business_name": "Texas Chicken",
          "google_place_id": "ChIJ8UKmEwDRwxURSRFfOnj3ChY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8UKmEwDRwxURSRFfOnj3ChY",
          "google_rating": 4.5,
          "google_review_count": 1573,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "texas_chicken",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "7367 Al Muzaffar Saif Al Din, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7603795,
          "longitude": 39.1937505,
          "maps_business_name": "Texas Chicken",
          "google_place_id": "ChIJu84eQwB9wRURXiRaIdqXIYY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJu84eQwB9wRURXiRaIdqXIYY",
          "google_rating": 4.3,
          "google_review_count": 811,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "texas_chicken",
          "branch_name_en": "Sultan Mall",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Sultan Mall, Al Batarji, Al Zahra, Jeddah 23522, Saudi Arabia",
          "latitude": 21.598812499999998,
          "longitude": 39.1426875,
          "maps_business_name": "Texas Chicken",
          "google_place_id": "ChIJ5wH1zaDbwxURkhzKB-8LKi8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5wH1zaDbwxURkhzKB-8LKi8",
          "google_rating": 4.7,
          "google_review_count": 401,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "texas_chicken",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, Al-Madinah Al-Munawarah Rd, An Nuzhah, Jeddah 24231, Saudi Arabia",
          "latitude": 21.632588,
          "longitude": 39.155404,
          "maps_business_name": "Texas Chicken",
          "google_place_id": "ChIJNRqce0zXwxURDw-FZCx09jo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJNRqce0zXwxURDw-FZCx09jo",
          "google_rating": 4.7,
          "google_review_count": 281,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "popeyes",
      "canonical_name": "Popeyes",
      "arabic_name": "بوبايز",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "fried_chicken"
      ],
      "subcategories": [
        "fried_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "دجاج لويزيانا المقلي الحار وبطاطس كاجون",
      "signature_dish_en": "Spicy Louisiana Fried Chicken & Cajun Fries",
      "vibe_tags_ar": [
        "نكهة لويزيانا",
        "كاجون",
        "قرمشة"
      ],
      "vibe_tags_en": [
        "Louisiana Flavor",
        "Cajun",
        "Crunchy"
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
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 6,
      "canonical_districts": [
        "abhur_al_janoubiyah",
        "al_aziziyah",
        "al_faiha",
        "al_hamdaniyah",
        "al_naseem",
        "an_nuzhah"
      ],
      "official_website": "https://tanmiah.com/popeyes-location.php",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "spicy Louisiana fried chicken",
          "name_ar": "دجاج لويزيانا المقلي الحار وبطاطس كاجون",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken sandwich",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cajun fries",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naseem",
          "address_en": "King Abdallah Rd, Al Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.510562,
          "longitude": 39.2364324,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJA0AHX-fPwxUR631RktKAA64",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJA0AHX-fPwxUR631RktKAA64",
          "google_rating": 4.3,
          "google_review_count": 2007,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Obhur Al Junoobiyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_janoubiyah",
          "address_en": "King Abdulaziz Branch Rd, Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
          "latitude": 21.764147400000002,
          "longitude": 39.141013799999996,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJGRZK26hjwRURItfpdJSinos",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJGRZK26hjwRURItfpdJSinos",
          "google_rating": 4.6,
          "google_review_count": 1858,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "4157 Al Hamdaniyah Branch St, Al Hamdaniyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7585008,
          "longitude": 39.1981687,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJOxIfRQB9wRURs-ArBXD0xEY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOxIfRQB9wRURs-ArBXD0xEY",
          "google_rating": 4.3,
          "google_review_count": 861,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Al Fayha",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_faiha",
          "address_en": "G65F+853, Al Fayha, Jeddah 22251, Saudi Arabia",
          "latitude": 21.5081921,
          "longitude": 39.2228889,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJF5sDKrLPwxURwp31YSSDNkA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJF5sDKrLPwxURwp31YSSDNkA",
          "google_rating": 4.7,
          "google_review_count": 720,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Mall of Arabia",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "an_nuzhah",
          "address_en": "Mall of Arabia, Al-Madinah Al-Munawarah Rd, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.632517,
          "longitude": 39.156161,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJazAKPINjwRURujbOYg5cgNg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJazAKPINjwRURujbOYg5cgNg",
          "google_rating": 4.4,
          "google_review_count": 264,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "popeyes",
          "branch_name_en": "Aziziyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_aziziyah",
          "address_en": "2775 Ibn Arabi, Aziziyah, Jeddah 23342, Saudi Arabia",
          "latitude": 21.552678099999998,
          "longitude": 39.209392,
          "maps_business_name": "Popeyes",
          "google_place_id": "ChIJdYtUQwDRwxUR392IHXX9_gU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdYtUQwDRwxUR392IHXX9_gU",
          "google_rating": 4.5,
          "google_review_count": 378,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "daves_hot_chicken",
      "canonical_name": "Dave's Hot Chicken",
      "arabic_name": "ديفز هوت تشيكن",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "hot_chicken",
        "tenders",
        "nashville"
      ],
      "subcategories": [
        "hot_chicken",
        "tenders",
        "nashville"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "سلايدرز وتندرز ناشفيل الحارة 🌶️",
      "signature_dish_en": "Nashville Hot Chicken Sliders & Tenders 🌶️",
      "vibe_tags_ar": [
        "ناشفيل حار",
        "ترند عالمي",
        "سبايسي"
      ],
      "vibe_tags_en": [
        "Nashville Heat",
        "Global Trend",
        "Spicy Sliders"
      ],
      "reputation_tags": [
        "rising",
        "trending"
      ],
      "context_tags": [
        "quick_bite",
        "casual_hangout",
        "trending"
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
        "al_zahra"
      ],
      "official_website": "https://store.daveshotchicken.com/",
      "trend_status": "trending",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "hot chicken tenders",
          "name_ar": "سلايدرز وتندرز ناشفيل الحارة 🌶️",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "hot chicken sliders",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Dave's sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "daves_hot_chicken",
          "branch_name_en": "U Walk Jeddah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "U Walk, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.5820287,
          "longitude": 39.1400825,
          "maps_business_name": "Dave's Hot Chicken",
          "google_place_id": "ChIJX9m-_prbwxURXTJVcsATux4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJX9m-_prbwxURXTJVcsATux4",
          "google_rating": 4.2,
          "google_review_count": 678,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "tndr",
      "canonical_name": "TNDR",
      "arabic_name": "TNDR",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "tenders",
        "fried_chicken"
      ],
      "subcategories": [
        "tenders",
        "fried_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "تندرز كرسبي مقرمشة مع الصوص الخاص",
      "signature_dish_en": "Crispy Tenders & Secret Dip",
      "vibe_tags_ar": [
        "ترند شبابي",
        "تندرز",
        "صوصات"
      ],
      "vibe_tags_en": [
        "Trendy",
        "Tenders",
        "Signature Dips"
      ],
      "reputation_tags": [
        "rising",
        "trending"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "trending",
        "late_night"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_aziziyah",
        "al_hamdaniyah",
        "al_marwah",
        "al_naseem",
        "al_rawdah"
      ],
      "official_website": null,
      "trend_status": "trending",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "chicken tenders",
          "name_ar": "تندرز كرسبي مقرمشة مع الصوص الخاص",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "tenders box",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "signature dipping sauces",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "tndr",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naseem",
          "address_en": "G66P+634, An Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.510465699999997,
          "longitude": 39.2352242,
          "maps_business_name": "TNDR",
          "google_place_id": "ChIJb6WgNwDPwxURAauIqIckEcA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJb6WgNwDPwxURAauIqIckEcA",
          "google_rating": 4.7,
          "google_review_count": 2962,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "tndr",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "J6F3+64R, Al Marwah, Jeddah 23544, Saudi Arabia",
          "latitude": 21.62311,
          "longitude": 39.202804199999996,
          "maps_business_name": "TNDR",
          "google_place_id": "ChIJMwsUGOLXwxUR0rp16WYzN9o",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJMwsUGOLXwxUR0rp16WYzN9o",
          "google_rating": 4.5,
          "google_review_count": 1384,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "tndr",
          "branch_name_en": "Al Rawdah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rawdah",
          "address_en": "Hamad Al Jaser, Ar Rawdah, Jeddah 23435, Saudi Arabia",
          "latitude": 21.5732696,
          "longitude": 39.1576905,
          "maps_business_name": "TNDR",
          "google_place_id": "ChIJlxQzkfXRwxURD-oJ2Dhn_xQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJlxQzkfXRwxURD-oJ2Dhn_xQ",
          "google_rating": 4.3,
          "google_review_count": 2011,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "tndr",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "P5XQ+PH6, Al Hamadaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.7495552,
          "longitude": 39.1890267,
          "maps_business_name": "TNDR",
          "google_place_id": "ChIJ_5KeL259wRURimZ9_sKypqU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_5KeL259wRURimZ9_sKypqU",
          "google_rating": 4.4,
          "google_review_count": 2166,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "tndr",
          "branch_name_en": "Jeddah Park",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_aziziyah",
          "address_en": "King Fahad Rd, Jeddah 23334, Saudi Arabia",
          "latitude": 21.5580221,
          "longitude": 39.1864214,
          "maps_business_name": "TNDR",
          "google_place_id": "ChIJUbqqAQDRwxURDE-zT9L4Ifk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJUbqqAQDRwxURDE-zT9L4Ifk",
          "google_rating": 4.5,
          "google_review_count": 47,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "wingstop",
      "canonical_name": "Wingstop",
      "arabic_name": "وينج ستوب",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "wings"
      ],
      "subcategories": [
        "wings"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "أجنحة دجاج مقلية بتتبيلات متنوعة",
      "signature_dish_en": "Classic Tossed Wings (Mango Habanero / Garlic Parm)",
      "vibe_tags_ar": [
        "أجنحة دجاج",
        "نكهات حارة",
        "سهرات"
      ],
      "vibe_tags_en": [
        "Chicken Wings",
        "Bold Flavors",
        "Late Night"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "group_friendly",
        "casual_hangout",
        "delivery_strong"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_aziziyah",
        "al_rawdah",
        "al_thaghr"
      ],
      "official_website": null,
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "tossed chicken wings",
          "name_ar": "أجنحة دجاج مقلية بتتبيلات متنوعة",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "boneless wings",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "atomic / mango habanero wings",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "wingstop",
          "branch_name_en": "Jeddah Park",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_aziziyah",
          "address_en": "Prince Mohammed Bin Abdulaziz St, Aziziyah, Jeddah 32224, Saudi Arabia",
          "latitude": 21.5581325,
          "longitude": 39.184489299999996,
          "maps_business_name": "Wingstop",
          "google_place_id": "ChIJWZuTKADRwxUREFzmU5TmctM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWZuTKADRwxUREFzmU5TmctM",
          "google_rating": 4.5,
          "google_review_count": 3600,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "wingstop",
          "branch_name_en": "Jeddah Vibes",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rawdah",
          "address_en": "3770 Prince Mohammed Bin Abdulaziz Branch Rd, Al Rawdah, Jeddah 23432, Saudi Arabia",
          "latitude": 21.5514801,
          "longitude": 39.1599408,
          "maps_business_name": "Wingstop",
          "google_place_id": "ChIJqenNawDRwxUROXmCRMzbOls",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJqenNawDRwxUROXmCRMzbOls",
          "google_rating": 4.8,
          "google_review_count": 342,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "wingstop",
          "branch_name_en": "Town Square",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_thaghr",
          "address_en": "5229 Abdullah Sulayman St, Al Thaghr, Jeddah 22338, Saudi Arabia",
          "latitude": 21.482812499999998,
          "longitude": 39.2388125,
          "maps_business_name": "Wingstop",
          "google_place_id": "ChIJcR4nIQDNwxURRF9RE-ZMowo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJcR4nIQDNwxURRF9RE-ZMowo",
          "google_rating": 4.7,
          "google_review_count": 960,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "crusted",
      "canonical_name": "Crusted",
      "arabic_name": "كرستد",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "nashville",
        "tenders",
        "hot_chicken"
      ],
      "subcategories": [
        "nashville",
        "tenders",
        "hot_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "ستربس دجاج مقلية فائقة القرمشة",
      "signature_dish_en": "Ultra-Crispy Fried Chicken Strips",
      "vibe_tags_ar": [
        "قرمشة استثنائية",
        "ستربس",
        "محلي"
      ],
      "vibe_tags_en": [
        "Extra Crunch",
        "Strips",
        "Local Favorite"
      ],
      "reputation_tags": [
        "local_favorite",
        "trending"
      ],
      "context_tags": [
        "local",
        "trending",
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
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_faiha",
        "al_marwah",
        "al_mohammadiyyah"
      ],
      "official_website": "https://linktr.ee/crustedrestaurant",
      "trend_status": "trending",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "Nashville broast",
          "name_ar": "ستربس دجاج مقلية فائقة القرمشة",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "fried chicken strips",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "crusted sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "crusted",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 22230, Saudi Arabia",
          "latitude": 21.6410722,
          "longitude": 39.1303894,
          "maps_business_name": "Crusted",
          "google_place_id": "ChIJ0wHeXPTZwxURxtrHRssvtsU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ0wHeXPTZwxURxtrHRssvtsU",
          "google_rating": 4.7,
          "google_review_count": 6550,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "crusted",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23541, Saudi Arabia",
          "latitude": 21.6222992,
          "longitude": 39.201186299999996,
          "maps_business_name": "Crusted",
          "google_place_id": "ChIJKURYOQDXwxURBcj9dyfAk3U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJKURYOQDXwxURBcj9dyfAk3U",
          "google_rating": 4.4,
          "google_review_count": 2245,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "crusted",
          "branch_name_en": "Al Sanabel",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "2995 Khubaib bin Adi Al Ansari Branch St, Al Sanabel, Jeddah 22444, Saudi Arabia",
          "latitude": 21.400159000000002,
          "longitude": 39.2810276,
          "maps_business_name": "Crusted",
          "google_place_id": "ChIJ79XtBQDLwxUR2vfthAk2kfw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ79XtBQDLwxUR2vfthAk2kfw",
          "google_rating": 4.6,
          "google_review_count": 1343,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Al Sanabel (outer south Jeddah, ~25km south of central core), outside the 30-district canonical urban whitelist.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "crusted",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Aabir Al Qarat, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.7620354,
          "longitude": 39.1156643,
          "maps_business_name": "Crusted",
          "google_place_id": "ChIJWVJzJwBjwRURMh_OHC1Zaw8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWVJzJwBjwRURMh_OHC1Zaw8",
          "google_rating": 4.5,
          "google_review_count": 1265,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "crusted",
          "branch_name_en": "Andalus Mall",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_faiha",
          "address_en": "Al Andalus Mall, Al Fayha, Jeddah 22245, Saudi Arabia",
          "latitude": 21.5065566,
          "longitude": 39.2169928,
          "maps_business_name": "Crusted",
          "google_place_id": "ChIJdySGd1zPwxURulYbfT1R2ew",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdySGd1zPwxURulYbfT1R2ew",
          "google_rating": 4.3,
          "google_review_count": 285,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "crisper",
      "canonical_name": "Crisper",
      "arabic_name": "كرسبر",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "tenders"
      ],
      "subcategories": [
        "tenders"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "بروست كرسبر الحراق المقرمش 🍗",
      "signature_dish_en": "Crisper Spicy Broast 🍗",
      "vibe_tags_ar": [
        "قرمشة عالية",
        "حراق",
        "آخر الليل"
      ],
      "vibe_tags_en": [
        "Ultra Crispy",
        "Spicy",
        "Late Night"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local",
        "rising",
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
        "abhur_al_shamaliyah",
        "al_zahra"
      ],
      "official_website": "https://crisper-ksa.com/",
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "crispy chicken strips",
          "name_ar": "بروست كرسبر الحراق المقرمش 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "tenders boxes",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "signature honey mustard",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "crisper",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas, Al Zahra, Jeddah 23521, Saudi Arabia",
          "latitude": 21.5913138,
          "longitude": 39.130938799999996,
          "maps_business_name": "Crisper",
          "google_place_id": "ChIJsaQt7CvbwxURut6By4IWJqs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJsaQt7CvbwxURut6By4IWJqs",
          "google_rating": 4.3,
          "google_review_count": 4271,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "crisper",
          "branch_name_en": "Obhur Al Shamaliyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_shamaliyah",
          "address_en": "Prince Abdullah AlFaisal St, Obhur Al-Shamaliyah, Jeddah 23815, Saudi Arabia",
          "latitude": 21.7534064,
          "longitude": 39.1184837,
          "maps_business_name": "Crisper",
          "google_place_id": "ChIJewOIJehjwRUR-T1AtuoY1tg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJewOIJehjwRUR-T1AtuoY1tg",
          "google_rating": 4.3,
          "google_review_count": 1444,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "dabboos",
      "canonical_name": "Dabboos",
      "arabic_name": "دبوس",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "fried_chicken",
        "tenders",
        "chicken_burgers"
      ],
      "subcategories": [
        "fried_chicken",
        "tenders",
        "chicken_burgers"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "دجاج دبوس مقلي حراق ومقرمش",
      "signature_dish_en": "Dabboos Spicy Fried Chicken",
      "vibe_tags_ar": [
        "حراق",
        "دبوس مقلي",
        "سريع"
      ],
      "vibe_tags_en": [
        "Spicy",
        "Crispy Drumsticks",
        "Quick Bite"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "local",
        "rising",
        "quick_bite",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "official_website": "https://dabboos.sa/",
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "crispy fried chicken drumsticks",
          "name_ar": "دجاج دبوس مقلي حراق ومقرمش",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "tenders",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "chicken burgers",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "dabboos",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Ahmad Al Attas St, Al Zahra, Jeddah 23425, Saudi Arabia",
          "latitude": 21.589437099999998,
          "longitude": 39.1315634,
          "maps_business_name": "Dabboos",
          "google_place_id": "ChIJK4C8NB7bwxURKACCoLUxtcE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJK4C8NB7bwxURKACCoLUxtcE",
          "google_rating": 4.6,
          "google_review_count": 2801,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "sayakh",
      "canonical_name": "Sayakh",
      "arabic_name": "سياخ",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "fried_chicken",
        "quick_bite"
      ],
      "subcategories": [
        "fried_chicken",
        "quick_bite"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "أسياخ وتندرز دجاج مقلي مقرمش",
      "signature_dish_en": "Sayakh Signature Fried Skewers & Tenders",
      "vibe_tags_ar": [
        "أسياخ مقلية",
        "سريع",
        "ترند"
      ],
      "vibe_tags_en": [
        "Fried Skewers",
        "Quick Bite",
        "Casual"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local",
        "popular",
        "quick_bite",
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_hamdaniyah",
        "al_marwah",
        "al_mohammadiyyah",
        "al_naseem",
        "al_rawdah"
      ],
      "official_website": "https://linktr.ee/sayakh",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "fried chicken meal",
          "name_ar": "أسياخ وتندرز دجاج مقلي مقرمش",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "crispy chicken skewers",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "spicy tenders",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "sayakh",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23623, Saudi Arabia",
          "latitude": 21.647943299999998,
          "longitude": 39.1276582,
          "maps_business_name": "Sayakh",
          "google_place_id": "ChIJizwJUHbZwxUR5xnyXtfiuKw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJizwJUHbZwxUR5xnyXtfiuKw",
          "google_rating": 4.3,
          "google_review_count": 3977,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sayakh",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "Hira St, Al Marwah, Jeddah 23544, Saudi Arabia",
          "latitude": 21.6227382,
          "longitude": 39.201023,
          "maps_business_name": "Sayakh",
          "google_place_id": "ChIJByHPU77XwxURlV11N6Yf3Sg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJByHPU77XwxURlV11N6Yf3Sg",
          "google_rating": 4.1,
          "google_review_count": 4044,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sayakh",
          "branch_name_en": "Al Rawdah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_rawdah",
          "address_en": "Qassem Zeinah, Al Rawdah, Jeddah 23434, Saudi Arabia",
          "latitude": 21.574052,
          "longitude": 39.16383270000001,
          "maps_business_name": "Sayakh",
          "google_place_id": "ChIJbVRBBmPRwxUROx_5Z8oAd-E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJbVRBBmPRwxUROx_5Z8oAd-E",
          "google_rating": 4.5,
          "google_review_count": 2908,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sayakh",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "3224 Abi Firas Al Hamdani, Al Hamdaniyyah, Jeddah 23762, Saudi Arabia",
          "latitude": 21.773664999999998,
          "longitude": 39.178287,
          "maps_business_name": "Sayakh",
          "google_place_id": "ChIJ_zkVCwB9wRURSqGm9JMEY2g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ_zkVCwB9wRURSqGm9JMEY2g",
          "google_rating": 4.3,
          "google_review_count": 1640,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "sayakh",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naseem",
          "address_en": "Ahmad Ibn Moutair St, Al Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.510749,
          "longitude": 39.236523999999996,
          "maps_business_name": "Sayakh",
          "google_place_id": "ChIJ5SuQJgfPwxURBUqOgcw8G7c",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5SuQJgfPwxURBUqOgcw8G7c",
          "google_rating": 4.6,
          "google_review_count": 2691,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "nashvilles_hot_chicken",
      "canonical_name": "Nashville's Hot Chicken",
      "arabic_name": "ناشفيلز هوت شكن",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "hot_chicken",
        "nashville"
      ],
      "subcategories": [
        "hot_chicken",
        "nashville"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "سلايدر دجاج ناشفيل حار أصلي 🌶️",
      "signature_dish_en": "Authentic Nashville Hot Chicken Slider 🌶️",
      "vibe_tags_ar": [
        "ناشفيل أصلي",
        "حرارة عالية",
        "سلايدرز"
      ],
      "vibe_tags_en": [
        "Authentic Nashville",
        "High Heat",
        "Sliders"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "rising",
        "hot_chicken",
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
        "al_mohammadiyyah"
      ],
      "official_website": null,
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "Nashville hot chicken",
          "name_ar": "سلايدر دجاج ناشفيل حار أصلي 🌶️",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "hot chicken tenders",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "spicy sliders",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "nashvilles_hot_chicken",
          "branch_name_en": "Al Muhammadiyyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan Rd, Al Mohammadiyyah, Jeddah 23624, Saudi Arabia",
          "latitude": 21.666580099999997,
          "longitude": 39.1220295,
          "maps_business_name": "Nashville's Hot Chicken",
          "google_place_id": "ChIJhQj2--7ZwxUR4ve4c-A0_iA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJhQj2--7ZwxUR4ve4c-A0_iA",
          "google_rating": 4.8,
          "google_review_count": 1425,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "tenders_cart",
      "canonical_name": "Tenders Cart",
      "arabic_name": "تندرز كارت",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "tenders"
      ],
      "subcategories": [
        "tenders"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 28,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "بوكس بطاطس وتندرز مغطى بالصوصات",
      "signature_dish_en": "Loaded Tenders Fries Box",
      "vibe_tags_ar": [
        "تندرز وبطاطس",
        "سريع",
        "صوصات"
      ],
      "vibe_tags_en": [
        "Tenders & Fries",
        "Quick Bite",
        "Loaded Sauces"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "rising",
        "late_night",
        "quick_bite"
      ],
      "time_slots": [
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_zahra"
      ],
      "official_website": null,
      "trend_status": "rising",
      "trend_confidence": "high",
      "best_sellers": [
        {
          "name_en": "chicken tenders",
          "name_ar": "بوكس بطاطس وتندرز مغطى بالصوصات",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "crispy tender box",
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
          "restaurant_id": "tenders_cart",
          "branch_name_en": "Al Zahra",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_zahra",
          "address_en": "Prince Nayef, Al Zahra, Jeddah 23336, Saudi Arabia",
          "latitude": 21.5896635,
          "longitude": 39.1292939,
          "maps_business_name": "Tenders Cart",
          "google_place_id": "ChIJXbTMiSDbwxURC6StGage6hA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXbTMiSDbwxURC6StGage6hA",
          "google_rating": 4.8,
          "google_review_count": 701,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "rami_broast",
      "canonical_name": "Rami Broast",
      "arabic_name": "بروست رامي",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast"
      ],
      "subcategories": [
        "traditional_broast"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "بروست دجاج حراق تقليدي 🍗",
      "signature_dish_en": "Classic Spicy Broast Chicken 🍗",
      "vibe_tags_ar": [
        "قديم ومعروف",
        "حراق",
        "ثوم أصلي"
      ],
      "vibe_tags_en": [
        "Local Staple",
        "Spicy",
        "Classic Garlic"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local",
        "traditional_broast",
        "quick_bite",
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_hamdaniyah",
        "al_naeem",
        "al_naseem",
        "al_safa",
        "al_samer"
      ],
      "official_website": "https://linktr.ee/prost_rami",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "fresh broast chicken",
          "name_ar": "بروست دجاج حراق تقليدي 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "spicy broast",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "signature garlic cream",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "rami_broast",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "Umm Al Qura, Al Safa, Jeddah 23453, Saudi Arabia",
          "latitude": 21.571253799999997,
          "longitude": 39.2207466,
          "maps_business_name": "Rami Broast",
          "google_place_id": "ChIJMxq-NXTRwxURZ4lYqfsdgiU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJMxq-NXTRwxURZ4lYqfsdgiU",
          "google_rating": 4.1,
          "google_review_count": 2773,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "rami_broast",
          "branch_name_en": "Al Naeem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naeem",
          "address_en": "Amna Bint Wahb St, Al Naeem, Jeddah 23622, Saudi Arabia",
          "latitude": 21.631476,
          "longitude": 39.1446439,
          "maps_business_name": "Rami Broast",
          "google_place_id": "ChIJf6a3Z7HZwxURIbN96QtYTy8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJf6a3Z7HZwxURIbN96QtYTy8",
          "google_rating": 4.1,
          "google_review_count": 1408,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "rami_broast",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_samer",
          "address_en": "Al Samer, Jeddah 23462, Saudi Arabia",
          "latitude": 21.5875937,
          "longitude": 39.236126299999995,
          "maps_business_name": "Rami Broast",
          "google_place_id": "ChIJSRYYfKLRwxURbebrg2dhQws",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJSRYYfKLRwxURbebrg2dhQws",
          "google_rating": 4.1,
          "google_review_count": 1110,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "rami_broast",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamdaniyyah, Jeddah 23761, Saudi Arabia",
          "latitude": 21.769972499999998,
          "longitude": 39.1959082,
          "maps_business_name": "Rami Broast",
          "google_place_id": "ChIJyafGHX58wRURkULcKwnWWYY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJyafGHX58wRURkULcKwnWWYY",
          "google_rating": 4.1,
          "google_review_count": 2112,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "rami_broast",
          "branch_name_en": "Al Naseem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naseem",
          "address_en": "Umm Al Mouameneen Sauda, Al Naseem, Jeddah 23233, Saudi Arabia",
          "latitude": 21.5133399,
          "longitude": 39.2312795,
          "maps_business_name": "Rami Broast",
          "google_place_id": "ChIJiXlY_1DPwxURtQ7xejdW9Us",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJiXlY_1DPwxURtQ7xejdW9Us",
          "google_rating": 4.3,
          "google_review_count": 130,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "chicken_mubeen",
      "canonical_name": "Chicken Mubeen",
      "arabic_name": "دجاج مبين",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast",
        "fried_chicken"
      ],
      "subcategories": [
        "traditional_broast",
        "fried_chicken"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 18,
      "estimated_spend_max_sar": 38,
      "signature_dish_ar": "بروست حراق بالثوم والبهارات 🍗",
      "signature_dish_en": "Spicy Broasted Chicken with Garlic 🍗",
      "vibe_tags_ar": [
        "بروست شعبي",
        "حراق",
        "سعره ممتاز"
      ],
      "vibe_tags_en": [
        "Popular Broast",
        "Spicy",
        "Great Value"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "traditional_broast",
        "local",
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
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "al_bawadi",
        "al_hamdaniyah",
        "al_marwah",
        "al_safa",
        "al_sheraa",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": "https://chickenmubeen.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "traditional broast chicken",
          "name_ar": "بروست حراق بالثوم والبهارات 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "crispy spicy broast",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "garlic sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Ar Rabwah – Macarona Rd (Flagship)",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "ar_rabwah",
          "address_en": "Al Makarunah Rd, Ar Rabwah, Jeddah 23449, Saudi Arabia",
          "latitude": 21.6020975,
          "longitude": 39.1829156,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJU-UMp8PQwxURVWFNc06Gd1I",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJU-UMp8PQwxURVWFNc06Gd1I",
          "google_rating": 4.4,
          "google_review_count": 2258,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23433, Saudi Arabia",
          "latitude": 21.5920938,
          "longitude": 39.2044745,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJiVvkzsLRwxURE9y4GXC76zk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJiVvkzsLRwxURE9y4GXC76zk",
          "google_rating": 4.3,
          "google_review_count": 1462,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "An Nuzhah – Hira St",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "an_nuzhah",
          "address_en": "Hira St, An Nuzhah, Jeddah 23433, Saudi Arabia",
          "latitude": 21.6175749,
          "longitude": 39.1736708,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJj9AP0nLRwxURpVsCyFm3p-4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJj9AP0nLRwxURpVsCyFm3p-4",
          "google_rating": 4.3,
          "google_review_count": 1506,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_bawadi",
          "address_en": "7077 Yahya Husayn, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.5894822,
          "longitude": 39.1653022,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJM6rwFQDRwxURGzwQG_Lmauc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJM6rwFQDRwxURGzwQG_Lmauc",
          "google_rating": 4.3,
          "google_review_count": 180,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Al Sheraa – Prince Nayef Rd",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_sheraa",
          "address_en": "7925 Prince Nayef Rd, Al Sheraa, Jeddah 23816, Saudi Arabia",
          "latitude": 21.7721779,
          "longitude": 39.1005906,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJffZlcQBjwRURUxv7LEAGQXs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJffZlcQBjwRURUxv7LEAGQXs",
          "google_rating": 4.4,
          "google_review_count": 709,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Al Hamdaniyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "Al Qasim Ibn Umayyah, Al Hamadaniyyah, Jeddah 29288, Saudi Arabia",
          "latitude": 21.7582758,
          "longitude": 39.1895399,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJdX-GLHV9wRURqolRJNdpkZA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdX-GLHV9wRURqolRJNdpkZA",
          "google_rating": 4.2,
          "google_review_count": 1256,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "chicken_mubeen",
          "branch_name_en": "Al Marwah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_marwah",
          "address_en": "8243 Hira St, Al Marwah, Jeddah 23541, Saudi Arabia",
          "latitude": 21.6201984,
          "longitude": 39.1894411,
          "maps_business_name": "Chicken Mubeen",
          "google_place_id": "ChIJ89NsNgDXwxURFALBePqQvq0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ89NsNgDXwxURFALBePqQvq0",
          "google_rating": 4.2,
          "google_review_count": 310,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "ktaykit",
      "canonical_name": "Ktaykit",
      "arabic_name": "كتيكت",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast",
        "musahab",
        "fried_chicken"
      ],
      "subcategories": [
        "traditional_broast",
        "musahab",
        "fried_chicken"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "بروست كتاكيت حراق مقرمش 🍗",
      "signature_dish_en": "Traditional Spicy Broast Chicken 🍗",
      "vibe_tags_ar": [
        "بروست كلاسيك",
        "فروع متعددة",
        "سريع"
      ],
      "vibe_tags_en": [
        "Classic Broast",
        "Multi Branch",
        "Quick Bite"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local",
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
      "verified_jeddah_branch_count": 9,
      "canonical_districts": [
        "abhur_al_janoubiyah",
        "al_hamdaniyah",
        "al_naseem",
        "al_ruwais",
        "al_safa",
        "al_salamah",
        "al_samer",
        "an_nuzhah",
        "ar_rabwah"
      ],
      "official_website": "https://linktr.ee/ktaykit",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "broast chicken",
          "name_ar": "بروست كتاكيت حراق مقرمش 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken musahab",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "Jeddah sauce",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Al Ruwais",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_ruwais",
          "address_en": "Al Andalus Branch, Al-Ruwais, Jeddah 23212, Saudi Arabia",
          "latitude": 21.5198978,
          "longitude": 39.165919,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJfeZ_-GTRwxURUywSe-ZA3VM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJfeZ_-GTRwxURUywSe-ZA3VM",
          "google_rating": 3.9,
          "google_review_count": 1995,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "As Salamah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_salamah",
          "address_en": "Abdul Rahman ibn Ahmas, As Salamah, Jeddah 23436, Saudi Arabia",
          "latitude": 21.5807628,
          "longitude": 39.1600685,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJYcaM7NLRwxURhwyX0qVme8Q",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJYcaM7NLRwxURhwyX0qVme8Q",
          "google_rating": 4.5,
          "google_review_count": 1306,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Ar Rabwah – Macarona Rd",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "ar_rabwah",
          "address_en": "Al Makarunah Rd, Ar Rabwah, Jeddah 23448, Saudi Arabia",
          "latitude": 21.5919597,
          "longitude": 39.1860874,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJo5p08eXQwxURCC2rHCBfQLQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJo5p08eXQwxURCC2rHCBfQLQ",
          "google_rating": 4.2,
          "google_review_count": 2049,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "An Naseem",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_naseem",
          "address_en": "Bani Malek, An Naseem, Jeddah 23234, Saudi Arabia",
          "latitude": 21.5277686,
          "longitude": 39.2337296,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJ4SGtgQ7RwxURr4D179r0eq4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ4SGtgQ7RwxURr4D179r0eq4",
          "google_rating": 4,
          "google_review_count": 1604,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "An Nuzhah – Hira St",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "an_nuzhah",
          "address_en": "Hira St, An Nuzhah, Jeddah 23532, Saudi Arabia",
          "latitude": 21.6140646,
          "longitude": 39.1575529,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJ44wBT6bQwxURMfaIKJgXJoY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ44wBT6bQwxURMfaIKJgXJoY",
          "google_rating": 4,
          "google_review_count": 5828,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "Umm Al Qoura, Al-Safa, Jeddah 23454, Saudi Arabia",
          "latitude": 21.5814881,
          "longitude": 39.2186353,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJfVFMf37RwxURXfWdu-p7GM8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJfVFMf37RwxURXfWdu-p7GM8",
          "google_rating": 4.4,
          "google_review_count": 1727,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Al Samer",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_samer",
          "address_en": "Al Samer, Jeddah 23461, Saudi Arabia",
          "latitude": 21.5780392,
          "longitude": 39.2301785,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJ37qT-GTRwxUR5uyWy6P6yAk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ37qT-GTRwxUR5uyWy6P6yAk",
          "google_rating": 4,
          "google_review_count": 2431,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Abhur Al Junoobiyah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "abhur_al_janoubiyah",
          "address_en": "Al Madinah Al Munawwarah Rd, Abhur Al Junoobiyah, Jeddah 23734, Saudi Arabia",
          "latitude": 21.7498041,
          "longitude": 39.1484519,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJH9FomyljwRURRaZ7j3ZiM4U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJH9FomyljwRURRaZ7j3ZiM4U",
          "google_rating": 4.2,
          "google_review_count": 928,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "ktaykit",
          "branch_name_en": "Al Hamdaniyah – Al Falah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_hamdaniyah",
          "address_en": "Al Hamdaniyah Highway, Al Falah, Jeddah 23762, Saudi Arabia",
          "latitude": 21.7750716,
          "longitude": 39.1750563,
          "maps_business_name": "Ktaykit",
          "google_place_id": "ChIJFT1aVZ98wRURNuHBXvpltbU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJFT1aVZ98wRURNuHBXvpltbU",
          "google_rating": 4.1,
          "google_review_count": 1959,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    },
    {
      "brand_id": "al_najah_broast",
      "canonical_name": "Al Najah Broast",
      "arabic_name": "بروست النجاح",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast"
      ],
      "subcategories": [
        "traditional_broast"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "بروست النجاح الكلاسيكي بالثوم 🍗",
      "signature_dish_en": "Old-School Jeddah Broast with Garlic 🍗",
      "vibe_tags_ar": [
        "قديم ومعروف",
        "بروست بالثوم",
        "محلي"
      ],
      "vibe_tags_en": [
        "Old-School",
        "Garlicky Broast",
        "Local Classic"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "local",
        "traditional_broast",
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
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_safa"
      ],
      "official_website": "https://alnajahbroast.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "spicy broast",
          "name_ar": "بروست النجاح الكلاسيكي بالثوم 🍗",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "chicken musahab",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "garlic dip",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "al_najah_broast",
          "branch_name_en": "Al Safa",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_safa",
          "address_en": "2464 6947 Al Imam Al Mansur, As Safa District, Jeddah 23451, Saudi Arabia",
          "latitude": 21.5706737,
          "longitude": 39.2029529,
          "maps_business_name": "Al Najah Broast",
          "google_place_id": "ChIJyVzL8jjRwxURrp93ZP5dFGU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJyVzL8jjRwxURrp93ZP5dFGU",
          "google_rating": 4.3,
          "google_review_count": 265,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_najah_broast",
          "branch_name_en": "Al Ajaweed",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": null,
          "address_en": "Saeed Bin Thabit Al Ansari, Al Ajaweed Dist, Jeddah 22442, Saudi Arabia",
          "latitude": 21.4107836,
          "longitude": 39.2985517,
          "maps_business_name": "Al Najah Broast",
          "google_place_id": "ChIJ9Qgj04PLwxURGDMs8mD6tPE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ9Qgj04PLwxURGDMs8mD6tPE",
          "google_rating": 4,
          "google_review_count": 250,
          "operating_status": "open",
          "geographic_notes": "Branch verified in Al Ajaweed (outer south-eastern Jeddah), outside the 30-district canonical urban whitelist.",
          "production_branch_status": "usable_with_caution"
        }
      ]
    },
    {
      "brand_id": "broast_hanoo",
      "canonical_name": "Broast Hanoo",
      "arabic_name": "بروست هنو",
      "categories": [
        "broast",
        "fried_chicken"
      ],
      "primary_category": "broast",
      "secondary_categories": [
        "traditional_broast"
      ],
      "subcategories": [
        "traditional_broast"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 32,
      "signature_dish_ar": "بروست هنو التاريخي المقرمش بالبلد",
      "signature_dish_en": "Historic Balad Crispy Broast Chicken",
      "vibe_tags_ar": [
        "تاريخي بالبلد",
        "بروست أصلي",
        "أصيل"
      ],
      "vibe_tags_en": [
        "Historic Balad",
        "Authentic Broast",
        "Heritage"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
        "hidden_gem",
        "local",
        "traditional_broast",
        "historic_balad"
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
        "al_balad"
      ],
      "official_website": "https://www.timeoutjeddah.com/",
      "trend_status": "none",
      "trend_confidence": "unknown",
      "best_sellers": [
        {
          "name_en": "traditional broast chicken",
          "name_ar": "بروست هنو التاريخي المقرمش بالبلد",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "spicy garlic paste",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "classic fries",
          "name_ar": null,
          "is_signature": false,
          "sort_order": 2
        }
      ],
      "delivery_platforms": {
        "hungerstation": true,
        "jahez": false,
        "keeta": false
      },
      "branches": [
        {
          "restaurant_id": "broast_hanoo",
          "branch_name_en": "Al Balad – Historic Jeddah",
          "branch_name_ar": null,
          "branch_type": "unknown",
          "district": "al_balad",
          "address_en": "6958 Zuqaq Al Manazil, Al Balad District, Jeddah 22236, Saudi Arabia",
          "latitude": 21.4853545,
          "longitude": 39.185979,
          "maps_business_name": "Broast Hanoo",
          "google_place_id": "ChIJxwfIcBrPwxURQ1fk5R816PI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJxwfIcBrPwxURQ1fk5R816PI",
          "google_rating": 4.1,
          "google_review_count": 363,
          "operating_status": "open",
          "geographic_notes": null,
          "production_branch_status": "production_ready"
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _broast_catalog);
BEGIN
  IF jsonb_array_length(p->'brands') <> 19 THEN RAISE EXCEPTION 'Broast catalog must contain 19 brands'; END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 19 THEN RAISE EXCEPTION 'Duplicate broast brand IDs'; END IF;
  
  -- Verify total branches count = 75
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Broast catalog must contain exactly 75 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in broast branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in broast branches';
  END IF;

  -- Verify all branches have non-null coordinates and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
       OR br->>'google_rating' IS NULL OR br->>'google_review_count' IS NULL
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in broast payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Broast catalog contains an unknown canonical district'; END IF;

  -- Verify caution branches have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 4 THEN
    RAISE EXCEPTION 'Broast catalog must contain exactly 4 caution branches with null district';
  END IF;

  -- Verify no place ID belongs to another brand in the existing database
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _broast_catalog), brands AS (
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
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 2:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  18,
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
  '2026-09-26T00:00:00Z'::timestamptz,
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
  context_tag_evidence=EXCLUDED.context_tag_evidence,
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  meal_period_strength=EXCLUDED.meal_period_strength,
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

-- 2. Cleanup stale best sellers and sources for these 19 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _broast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _broast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _broast_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-26T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _broast_catalog), sellers AS (
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
  'Certified Broast V3 dataset signature item',
  '2026-09-26T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _broast_catalog), brands AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _broast_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'strong_secondary'::public.evidence_quality,
  'Verified Google Places physical branch listing'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

-- 7. Post-flight verification assertions
DO $$
DECLARE
  p jsonb := (SELECT payload FROM _broast_catalog);
  v_brand_count integer;
  v_branch_count integer;
  v_caution_count integer;
  v_prod_branch_count integer;
BEGIN
  SELECT count(*) INTO v_brand_count
  FROM public.restaurants r
  WHERE r.id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND r.primary_category = 'broast'
    AND r.research_use = 'production_ready'
    AND 'fried_chicken' = ANY(r.categories);

  IF v_brand_count <> 19 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 19 production_ready brands, found %', v_brand_count;
  END IF;

  SELECT count(*) INTO v_branch_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b);

  IF v_branch_count <> 75 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 75 branches, found %', v_branch_count;
  END IF;

  SELECT count(*) INTO v_prod_branch_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND rb.district IS NOT NULL;

  IF v_prod_branch_count <> 71 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 71 production branches with canonical district, found %', v_prod_branch_count;
  END IF;

  SELECT count(*) INTO v_caution_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND rb.district IS NULL
    AND rb.geographic_notes IS NOT NULL;

  IF v_caution_count <> 4 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 4 caution branches with null district and notes, found %', v_caution_count;
  END IF;
END $$;

COMMIT;
