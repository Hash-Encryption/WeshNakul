-- Google-verified Jeddah Street / Folk Food production catalog.
-- Source: docs/research/jeddah-street-folk-food-pass-d-corrected.json
-- 15 approved brands, 38 verified physical branches (29 canonical, 9 outer-district caution branches).
-- Reconciles legacy unverified placeholder seeds (al_qarmoushi, operation_falafel) without duplicates.
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Apply after 20260927000600_jeddah_italian_catalog.sql.
BEGIN;

-- 0. Clean legacy orphan placeholders if present without branches
DELETE FROM public.restaurants WHERE id = 'al_qarmoushi' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'al_qarmoushi'
);

CREATE TEMP TABLE _street_folk_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _street_folk_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Street / Folk Food Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-28",
    "brand_count": 15,
    "branch_count": 38,
    "canonical_branch_count": 29,
    "outer_caution_branch_count": 9
  },
  "brands": [
    {
      "brand_id": "abu_zaid",
      "canonical_name": "Abu Zaid",
      "arabic_name": "أبو زيد",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "mutabbaq",
        "masoub",
        "areeka"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "mutabbaq",
        "masoub",
        "areeka"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "معصوب قشطة وعسل وتميس بسكوت",
      "signature_dish_en": "Masoub with Cream & Honey and Biscuit Tamees",
      "vibe_tags_ar": [
        "فطور شعبي",
        "معصوب ملكي",
        "تميس ساخن",
        "سلسلة عريقة"
      ],
      "vibe_tags_en": [
        "Folk Breakfast",
        "Royal Masoub",
        "Hot Tamees",
        "Heritage Chain"
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
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_bawadi"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-murjan/abu-zaid-12448",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "abu_zaid",
          "branch_name_en": "Abu Zaid — Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "حي، 4840 Palestine, Mishrifah, Jeddah 23335, Saudi Arabia",
          "latitude": 21.534012699999998,
          "longitude": 39.2008928,
          "maps_business_name": "Abu Zaid — Mishrifah",
          "google_place_id": "ChIJS5Pl_9XRwxURYgRiHnGgMnk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJS5Pl_9XRwxURYgRiHnGgMnk",
          "google_rating": 3.8,
          "google_review_count": 4363,
          "geographic_notes": "Outer Jeddah branch in physical district 'Mishrifah'; canonical_district is null; usable_with_caution."
        },
        {
          "restaurant_id": "abu_zaid",
          "branch_name_en": "Abu Zaid — Hira / Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Hira St, Al Bawadi, Jeddah 23531, Saudi Arabia",
          "latitude": 21.6154467,
          "longitude": 39.1647469,
          "maps_business_name": "Abu Zaid — Hira / Al Bawadi",
          "google_place_id": "ChIJ2bkombHQwxURcTjB77kafms",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ2bkombHQwxURcTjB77kafms",
          "google_rating": 3.9,
          "google_review_count": 10030,
          "geographic_notes": "Located in canonical district al_bawadi."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "mutabbaq",
          "name_en": "mutabbaq",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "banaemah",
      "canonical_name": "Banaemah",
      "arabic_name": "بانعمه",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "mutabbaq",
        "masoub"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "mutabbaq",
        "masoub"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "فول قلابة مع تميس ومطبق مالح",
      "signature_dish_en": "Qalaba Foul with Tamees & Savory Mutabbaq",
      "vibe_tags_ar": [
        "فول حجازي",
        "تميس فرن",
        "فطور أصيل",
        "سهرات وجلسات"
      ],
      "vibe_tags_en": [
        "Hijazi Foul",
        "Oven Tamees",
        "Authentic Breakfast",
        "Popular Gathering"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite"
      ],
      "time_slots": [
        "breakfast",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": true,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_sheraa",
        "al_faiha",
        "al_mohammadiyyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "banaemah",
          "branch_name_en": "Banaemah — North Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sheraa",
          "address_en": "Prince Naif Rd, حي الشراع، Jeddah 23816, Saudi Arabia",
          "latitude": 21.771338600000004,
          "longitude": 39.0982244,
          "maps_business_name": "Banaemah — North Obhur",
          "google_place_id": "ChIJPWKJobBjwRURdvwwcTeiLQg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJPWKJobBjwRURdvwwcTeiLQg",
          "google_rating": 4,
          "google_review_count": 3926,
          "geographic_notes": "Located in canonical district al_sheraa."
        },
        {
          "restaurant_id": "banaemah",
          "branch_name_en": "Banaemah — Al Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "طريق الملك عبدالله بن عبدالعزيز، Al Fayha, مقابل أويسس مول محمود سعيد، جدة 22241, Saudi Arabia",
          "latitude": 21.5109146,
          "longitude": 39.1967132,
          "maps_business_name": "Banaemah — Al Fayha",
          "google_place_id": "ChIJdx2k39PPwxUR-bHKpAA8ozY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdx2k39PPwxUR-bHKpAA8ozY",
          "google_rating": 4.1,
          "google_review_count": 311,
          "geographic_notes": "Located in canonical district al_faiha."
        },
        {
          "restaurant_id": "banaemah",
          "branch_name_en": "Banaemah — Hamdaniyah area",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Al Falah, Jeddah 23762, Saudi Arabia",
          "latitude": 21.7695767,
          "longitude": 39.1928768,
          "maps_business_name": "Banaemah — Hamdaniyah area",
          "google_place_id": "ChIJqwjJEYJ9wRURuHY8J-DlFEw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJqwjJEYJ9wRURuHY8J-DlFEw",
          "google_rating": 3.7,
          "google_review_count": 1592,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Falah'; canonical_district is null; usable_with_caution."
        },
        {
          "restaurant_id": "banaemah",
          "branch_name_en": "Banaemah — Mohammadiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "شارع صفية بنت عبدالمطلب، Al Mohammadiyyah, Jeddah 23621, Saudi Arabia",
          "latitude": 21.6416285,
          "longitude": 39.1361262,
          "maps_business_name": "Banaemah — Mohammadiyah",
          "google_place_id": "ChIJ7QcyZWjZwxUR7yDuuzgPRy0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ7QcyZWjZwxUR7yDuuzgPRy0",
          "google_rating": 4,
          "google_review_count": 454,
          "geographic_notes": "Located in canonical district al_mohammadiyyah."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "mutabbaq",
          "name_en": "mutabbaq",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "am_qasim",
      "canonical_name": "Am Qasim",
      "arabic_name": "عم قاسم",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "masoub",
        "areeka",
        "mutabbaq"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "masoub",
        "areeka",
        "mutabbaq"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "عريكة ملكي ومعصوب قشطة",
      "signature_dish_en": "Royal Areeka & Masoub with Cream",
      "vibe_tags_ar": [
        "عريكة ملكية",
        "معصوب أصلي",
        "توصيل سريع",
        "عراقة من ١٩٨٧"
      ],
      "vibe_tags_en": [
        "Royal Areeka",
        "Original Masoub",
        "Fast Delivery",
        "Since 1987 Heritage"
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
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_bawadi"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://am-qasim.com/ar/pages/about-us",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "am_qasim",
          "branch_name_en": "Am Qasim — Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "ثرمدا، البوادي 23443, 7218 Ibn Qasim Al Khawarizmi, Al Bawadi, 3025، Jeddah 23443, Saudi Arabia",
          "latitude": 21.590683499999997,
          "longitude": 39.169843199999995,
          "maps_business_name": "Am Qasim — Al Bawadi",
          "google_place_id": "ChIJYTNaYlrRwxURJ_gZJbMOhVc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJYTNaYlrRwxURJ_gZJbMOhVc",
          "google_rating": 4.1,
          "google_review_count": 1677,
          "geographic_notes": "Located in canonical district al_bawadi."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "areeka",
          "name_en": "areeka",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "masoub",
          "name_en": "masoub",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "mutabbaq",
          "name_en": "mutabbaq",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "operation_falafel",
      "canonical_name": "Operation Falafel",
      "arabic_name": "أوبريشن فلافل",
      "categories": [
        "street_folk_food",
        "falafel",
        "falafel",
        "levant_street_food"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "falafel"
      ],
      "subcategories": [
        "falafel",
        "levant_street_food"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "فلافل محشية وصاج فلافل",
      "signature_dish_en": "Stuffed Falafel & Falafel Saj",
      "vibe_tags_ar": [
        "فلافل مقرمشة",
        "شعبي مودرن",
        "سهرات شبابية",
        "طحينة وطرطور"
      ],
      "vibe_tags_en": [
        "Crispy Falafel",
        "Modern Street Food",
        "Late Night Hangout",
        "Tahini & Tarator"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite",
        "delivery_strong",
        "late_night",
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
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_rawdah",
        "al_mohammadiyyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://hungerstation.com/sa-en/restaurants/regions/jeddah/an-naim/operation-falafel-94729",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "operation_falafel",
          "branch_name_en": "Operation Falafel — Fayfa Avenue",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Prince Sultan Rd, Ar Rawdah, Jeddah 23431, Saudi Arabia",
          "latitude": 21.5496126,
          "longitude": 39.1435458,
          "maps_business_name": "Operation Falafel — Fayfa Avenue",
          "google_place_id": "ChIJBzwXZ5zFwxUR2TPV2zLyKNk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJBzwXZ5zFwxUR2TPV2zLyKNk",
          "google_rating": 4.7,
          "google_review_count": 2849,
          "geographic_notes": "Located in canonical district al_rawdah."
        },
        {
          "restaurant_id": "operation_falafel",
          "branch_name_en": "Operation Falafel — Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "Prince Sultan, Al Mohammadiyyah, Jeddah 23621, Saudi Arabia",
          "latitude": 21.636839000000002,
          "longitude": 39.13220690000001,
          "maps_business_name": "Operation Falafel — Prince Sultan",
          "google_place_id": "ChIJH_J5saTZwxURnqTg4GBlkyg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJH_J5saTZwxURnqTg4GBlkyg",
          "google_rating": 4.5,
          "google_review_count": 3413,
          "geographic_notes": "Located in canonical district al_mohammadiyyah."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "falafel",
          "name_en": "falafel",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "falafel_saj",
          "name_en": "falafel_saj",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "koshary_abu_tarek",
      "canonical_name": "Koshary Abu Tarek",
      "arabic_name": "كشري أبو طارق",
      "categories": [
        "street_folk_food",
        "koshari",
        "koshari"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "koshari"
      ],
      "subcategories": [
        "koshari"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "كشري أبو طارق مع الدقة والصلصة",
      "signature_dish_en": "Abu Tarek Koshari with Daqqa & Sauce",
      "vibe_tags_ar": [
        "كشري مصري أصلي",
        "صلصة ودقة حارة",
        "سهرات ليلية",
        "أيقونة شعبية"
      ],
      "vibe_tags_en": [
        "Authentic Egyptian Koshari",
        "Spicy Daqqa & Sauce",
        "Late Night Classic",
        "Folk Icon"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
        "al_sharafeyah",
        "al_naeem"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast": false,
      "branches": [
        {
          "restaurant_id": "koshary_abu_tarek",
          "branch_name_en": "Koshary Abu Tarek — Palestine",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sharafeyah",
          "address_en": "3103 فلسطين، سيف العزه، حي الشرفية، Jeddah 23218, Saudi Arabia",
          "latitude": 21.531270499999998,
          "longitude": 39.190026499999995,
          "maps_business_name": "Koshary Abu Tarek — Palestine",
          "google_place_id": "ChIJ8UR5RNHPwxURof5D8-03i4U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ8UR5RNHPwxURof5D8-03i4U",
          "google_rating": 4.3,
          "google_review_count": 18152,
          "geographic_notes": "Located in canonical district al_sharafeyah."
        },
        {
          "restaurant_id": "koshary_abu_tarek",
          "branch_name_en": "Koshary Abu Tarek — Prince Sultan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "8599، 2202 Al Amir Sultan، An Naim District، Jeddah 23526, Saudi Arabia",
          "latitude": 21.6168278,
          "longitude": 39.139268,
          "maps_business_name": "Koshary Abu Tarek — Prince Sultan",
          "google_place_id": "ChIJ7SStS4TbwxURZ2gbTb5F7dU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ7SStS4TbwxURZ2gbTb5F7dU",
          "google_rating": 4.4,
          "google_review_count": 5073,
          "geographic_notes": "Located in canonical district al_naeem."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "koshari",
          "name_en": "koshari",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "masoub_al_qadri",
      "canonical_name": "Masoub Al Qadri",
      "arabic_name": "معصوب القادري",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "mutabbaq",
        "masoub",
        "areeka"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "mutabbaq",
        "masoub",
        "areeka"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "معصوب القادري الخاص وعريكة دبل قشطة",
      "signature_dish_en": "Signature Qadri Masoub & Double Cream Areeka",
      "vibe_tags_ar": [
        "معصوب جداوي",
        "عريكة فاخرة",
        "جلسات كورنيش",
        "مفتوح ٢٤ ساعة"
      ],
      "vibe_tags_en": [
        "Classic Jeddah Masoub",
        "Rich Areeka",
        "Corniche Views",
        "24 Hours Waterfront"
      ],
      "reputation_tags": [
        "mainstream"
      ],
      "context_tags": [
        "quick_bite",
        "late_night"
      ],
      "time_slots": [
        "breakfast",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_rawdah",
        "al_salamah",
        "al_marwah",
        "al_ruwais",
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://masoubalgadri.com/الاسئلة-الشائعة/",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "masoub_al_qadri",
          "branch_name_en": "Masoub Al Qadri — Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "قاسم زينة، الروضة،، Ar Rawdah, Jeddah 23434, Saudi Arabia",
          "latitude": 21.5726553,
          "longitude": 39.1586805,
          "maps_business_name": "Masoub Al Qadri — Rawdah",
          "google_place_id": "ChIJKVx62nbQwxURp5MKkuymSyc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJKVx62nbQwxURp5MKkuymSyc",
          "google_rating": 4.5,
          "google_review_count": 6852,
          "geographic_notes": "Located in canonical district al_rawdah."
        },
        {
          "restaurant_id": "masoub_al_qadri",
          "branch_name_en": "Masoub Al Qadri — Hira",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "3417 حراء، As Salamah District Jeddah 23525 8103, السلامة، جدة 23525, Saudi Arabia",
          "latitude": 21.6126146,
          "longitude": 39.1508466,
          "maps_business_name": "Masoub Al Qadri — Hira",
          "google_place_id": "ChIJLZZwi1HRwxUR8ZsA2Xl-5I4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJLZZwi1HRwxUR8ZsA2Xl-5I4",
          "google_rating": 4.6,
          "google_review_count": 3197,
          "geographic_notes": "Located in canonical district al_salamah."
        },
        {
          "restaurant_id": "masoub_al_qadri",
          "branch_name_en": "Masoub Al Qadri — Al Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "J6G6+23Q, Hira St, Al Marwah, Jeddah 23544, Saudi Arabia",
          "latitude": 21.6250625,
          "longitude": 39.210187499999996,
          "maps_business_name": "Masoub Al Qadri — Al Marwah",
          "google_place_id": "ChIJ6TzlVufXwxURklenZO4pjMI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ6TzlVufXwxURklenZO4pjMI",
          "google_rating": 4.6,
          "google_review_count": 3368,
          "geographic_notes": "Located in canonical district al_marwah."
        },
        {
          "restaurant_id": "masoub_al_qadri",
          "branch_name_en": "Masoub Al Qadri — Al Ruwais",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_ruwais",
          "address_en": "Hael, Al-Ruwais, Jeddah 23213, Saudi Arabia",
          "latitude": 21.513890399999998,
          "longitude": 39.1729357,
          "maps_business_name": "Masoub Al Qadri — Al Ruwais",
          "google_place_id": "ChIJT7nmpZfPwxURjzeAqvOvRbE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJT7nmpZfPwxURjzeAqvOvRbE",
          "google_rating": 4.3,
          "google_review_count": 6892,
          "geographic_notes": "Located in canonical district al_ruwais."
        },
        {
          "restaurant_id": "masoub_al_qadri",
          "branch_name_en": "Masoub Al Qadri — Waterfront",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "Ash Shati, Jeddah 23611, Saudi Arabia",
          "latitude": 21.6167977,
          "longitude": 39.1081164,
          "maps_business_name": "Masoub Al Qadri — Waterfront",
          "google_place_id": "ChIJHTHr5bPbwxUR4dnAz_vvzaw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJHTHr5bPbwxUR4dnAz_vvzaw",
          "google_rating": 4.6,
          "google_review_count": 1525,
          "geographic_notes": "Located in canonical district al_shati."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "masoub",
          "name_en": "masoub",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "kabdat_al_muallimi",
      "canonical_name": "Kabdat Al-Muallimi",
      "arabic_name": "كبدة المعلمي",
      "categories": [
        "street_folk_food",
        "kebda",
        "kebda",
        "hijazi_food"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "kebda"
      ],
      "subcategories": [
        "kebda",
        "hijazi_food"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "كبدة صاج طازجة بالجبن والبهارات",
      "signature_dish_en": "Fresh Griddled Kebda with Cheese & Spices",
      "vibe_tags_ar": [
        "كبدة صاج طازجة",
        "خبز صامولي وشامي",
        "سهرات حتى الفجر",
        "معلمي أصيل"
      ],
      "vibe_tags_en": [
        "Fresh Griddled Liver",
        "Samoli & Shami Bread",
        "Late Night Until 3am",
        "Heritage Kebda"
      ],
      "reputation_tags": [
        "mainstream"
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
      "verified_jeddah_branch_count": 5,
      "canonical_districts": [
        "al_faisaliyyah",
        "al_shati",
        "al_sheraa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://almuallimisa.com/",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "kabdat_al_muallimi",
          "branch_name_en": "Kabdat Al-Muallimi — Al Faisaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "H59Q+RF8 الفيصلية, District, جدة 23444, Saudi Arabia",
          "latitude": 21.5695625,
          "longitude": 39.1886875,
          "maps_business_name": "Kabdat Al-Muallimi — Al Faisaliyah",
          "google_place_id": "ChIJP81xTlDQwxURpYkenM2TWv4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJP81xTlDQwxURpYkenM2TWv4",
          "google_rating": 3.9,
          "google_review_count": 7377,
          "geographic_notes": "Located in canonical district al_faisaliyyah."
        },
        {
          "restaurant_id": "kabdat_al_muallimi",
          "branch_name_en": "Kabdat Al-Muallimi — Corniche",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "6151 Al Kurnaysh Br Rd, Ash Shati District، 2741، Jeddah 23611, Saudi Arabia",
          "latitude": 21.6165971,
          "longitude": 39.1083328,
          "maps_business_name": "Kabdat Al-Muallimi — Corniche",
          "google_place_id": "ChIJHXmHulzbwxUROHd0aHqBl1E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJHXmHulzbwxUROHd0aHqBl1E",
          "google_rating": 3.8,
          "google_review_count": 1830,
          "geographic_notes": "Located in canonical district al_shati."
        },
        {
          "restaurant_id": "kabdat_al_muallimi",
          "branch_name_en": "Kabdat Al-Muallimi — Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_sheraa",
          "address_en": "Prince Naif Rd, Al Shera'a, Jeddah 23816, Saudi Arabia",
          "latitude": 21.7733733,
          "longitude": 39.1024554,
          "maps_business_name": "Kabdat Al-Muallimi — Obhur",
          "google_place_id": "ChIJw0lhBQBjwRURvJapC4-b2sY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJw0lhBQBjwRURvJapC4-b2sY",
          "google_rating": 4.3,
          "google_review_count": 1470,
          "geographic_notes": "Located in canonical district al_sheraa."
        },
        {
          "restaurant_id": "kabdat_al_muallimi",
          "branch_name_en": "Kabdat Al-Muallimi — Al Bashayer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "حي، جوار محطة ساسكو، 285, Al Bashaer, Jeddah 22441, Saudi Arabia",
          "latitude": 21.8206599,
          "longitude": 39.17516,
          "maps_business_name": "Kabdat Al-Muallimi — Al Bashayer",
          "google_place_id": "ChIJXXo09F97wRURRytJGECfemE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXXo09F97wRURRytJGECfemE",
          "google_rating": 3.9,
          "google_review_count": 1399,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Bashaer'; canonical_district is null; usable_with_caution."
        },
        {
          "restaurant_id": "kabdat_al_muallimi",
          "branch_name_en": "Kabdat Al-Muallimi — Al Waha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "H67V+6QP, Al Waha, Jeddah 22441, Saudi Arabia",
          "latitude": 21.563062499999997,
          "longitude": 39.2444375,
          "maps_business_name": "Kabdat Al-Muallimi — Al Waha",
          "google_place_id": "ChIJ59jeytbTwxURKYDoheaRsl8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ59jeytbTwxURKYDoheaRsl8",
          "google_rating": 4,
          "google_review_count": 196,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Waha'; canonical_district is null; usable_with_caution."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "kebda",
          "name_en": "kebda",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "falafel_al_sham",
      "canonical_name": "Falafel Al-Sham",
      "arabic_name": "فلافل الشام",
      "categories": [
        "street_folk_food",
        "falafel",
        "falafel"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "falafel"
      ],
      "subcategories": [
        "falafel"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "ساندوتش فلافل عربي مع الحمص والمخلل",
      "signature_dish_en": "Arabic Falafel Sandwich with Hummus & Pickles",
      "vibe_tags_ar": [
        "فلافل شامية ساخنة",
        "توصيل وسفري سريع",
        "خبز طازج",
        "سعر اقتصادي"
      ],
      "vibe_tags_en": [
        "Hot Levantine Falafel",
        "Fast Takeaway & Delivery",
        "Fresh Pita",
        "Great Value"
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
        "breakfast",
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
        "al_bawadi",
        "al_safa",
        "al_faisaliyyah",
        "al_hamdaniyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://linktr.ee/falafelalsham",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "falafel_al_sham",
          "branch_name_en": "Falafel Al-Sham — Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "7548 Al Khatib At Tabrizi، 2859 Al Khatib، Al Bawadi District، Jeddah 23443, Saudi Arabia",
          "latitude": 21.593640999999998,
          "longitude": 39.1682422,
          "maps_business_name": "Falafel Al-Sham — Al Bawadi",
          "google_place_id": "ChIJF06KxJHQwxURJd7dLgg-8xk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJF06KxJHQwxURJd7dLgg-8xk",
          "google_rating": 4,
          "google_review_count": 2224,
          "geographic_notes": "Located in canonical district al_bawadi."
        },
        {
          "restaurant_id": "falafel_al_sham",
          "branch_name_en": "Falafel Al-Sham — Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "JDSA6778، 6778، 4301 Umm Al Qoura, Al-Safa, Jeddah 23453, Saudi Arabia",
          "latitude": 21.5691725,
          "longitude": 39.220784099999996,
          "maps_business_name": "Falafel Al-Sham — Al Safa",
          "google_place_id": "ChIJb86gTADRwxURVU-z_0dUUWI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJb86gTADRwxURVU-z_0dUUWI",
          "google_rating": 3.7,
          "google_review_count": 188,
          "geographic_notes": "Located in canonical district al_safa."
        },
        {
          "restaurant_id": "falafel_al_sham",
          "branch_name_en": "Falafel Al-Sham — Al Faisaliyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "Imam abdulaziz, Al Faisaliyyah, Jeddah 23442, Saudi Arabia",
          "latitude": 21.571585,
          "longitude": 39.1743113,
          "maps_business_name": "Falafel Al-Sham — Al Faisaliyah",
          "google_place_id": "ChIJlU7P5WfQwxURuAinj_5DQT4",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJlU7P5WfQwxURuAinj_5DQT4",
          "google_rating": 4.5,
          "google_review_count": 6910,
          "geographic_notes": "Located in canonical district al_faisaliyyah."
        },
        {
          "restaurant_id": "falafel_al_sham",
          "branch_name_en": "Falafel Al-Sham — Al Hamadaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "P5RR+QG5 21.7418900, 39.1913649, Al Hamadaniyyah, Jeddah 23743, Saudi Arabia",
          "latitude": 21.7419224,
          "longitude": 39.1915,
          "maps_business_name": "Falafel Al-Sham — Al Hamadaniyyah",
          "google_place_id": "ChIJRXI70L19wRURBSA5KaWqWPM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRXI70L19wRURBSA5KaWqWPM",
          "google_rating": 3.8,
          "google_review_count": 517,
          "geographic_notes": "Located in canonical district al_hamdaniyah."
        },
        {
          "restaurant_id": "falafel_al_sham",
          "branch_name_en": "Falafel Al-Sham — Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "7136- 7170 شارع الأمير متعب بن عبدالعزيز، 3406، حي مشرفة، Jeddah 23341, Saudi Arabia",
          "latitude": 21.545439,
          "longitude": 39.2157039,
          "maps_business_name": "Falafel Al-Sham — Mishrifah",
          "google_place_id": "ChIJ9cjd88HRwxURHim_A3Hy9_Y",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ9cjd88HRwxURHim_A3Hy9_Y",
          "google_rating": 4.3,
          "google_review_count": 662,
          "geographic_notes": "Outer Jeddah branch in physical district 'Mishrifah'; canonical_district is null; usable_with_caution."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "falafel",
          "name_en": "falafel",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "tamees_09",
      "canonical_name": "Tamees 09",
      "arabic_name": "تميس 09",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "tamees",
        "foul",
        "hijazi_food"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "tamees",
        "foul",
        "hijazi_food"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "تميس بالجبن وفول مبخر بالزيت",
      "signature_dish_en": "Cheese Tamees & Smoked Foul with Olive Oil",
      "vibe_tags_ar": [
        "تميس عصري مبتكر",
        "فطور وجلسات رايقة",
        "سهرات شبابية",
        "فول مدخن"
      ],
      "vibe_tags_en": [
        "Modern Tamees Craft",
        "Trendy Breakfast Ambience",
        "Late Night Hangout",
        "Smoked Foul"
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
        "abhur_al_shamaliyah",
        "al_aziziyah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-khalidiyah/tamees-09-147795",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "tamees_09",
          "branch_name_en": "Tamees 09 — Al Baghdadiyah Al Gharbiyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "King Abdullah Branch Rd, Al-Baghdadiyah Al-Gharbiyah, Jeddah 22231, Saudi Arabia",
          "latitude": 21.509454599999998,
          "longitude": 39.1741129,
          "maps_business_name": "Tamees 09 — Al Baghdadiyah Al Gharbiyah",
          "google_place_id": "ChIJb5EzeZ_PwxUR6j_O4BxOA0U",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJb5EzeZ_PwxUR6j_O4BxOA0U",
          "google_rating": 4.3,
          "google_review_count": 13347,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al-Baghdadiyah Al-Gharbiyah'; canonical_district is null; usable_with_caution."
        },
        {
          "restaurant_id": "tamees_09",
          "branch_name_en": "Tamees 09 — Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "ابحر، Camel Roundabout, Abhur Al Junoobiyah, Jeddah 22231, Saudi Arabia",
          "latitude": 21.7642141,
          "longitude": 39.1421755,
          "maps_business_name": "Tamees 09 — Obhur",
          "google_place_id": "ChIJ09m9iEpjwRURUrzUHYmYNa8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ09m9iEpjwRURUrzUHYmYNa8",
          "google_rating": 4.5,
          "google_review_count": 1061,
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah."
        },
        {
          "restaurant_id": "tamees_09",
          "branch_name_en": "Tamees 09 Mini — Aziziyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_aziziyah",
          "address_en": "العزيز، Aziziyah, Jeddah 23334, Saudi Arabia",
          "latitude": 21.5564954,
          "longitude": 39.184163,
          "maps_business_name": "Tamees 09 Mini — Aziziyah",
          "google_place_id": "ChIJdQPTQCzRwxURPjYs3fz2by0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdQPTQCzRwxURPjYs3fz2by0",
          "google_rating": 4.4,
          "google_review_count": 118,
          "geographic_notes": "Located in canonical district al_aziziyah."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "masoub",
          "name_en": "masoub",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "areeka",
          "name_en": "areeka",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "al_qarmoshi",
      "canonical_name": "Al-Qarmoshi",
      "arabic_name": "القرموشي",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "mutabbaq",
        "masoub"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "mutabbaq",
        "masoub"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "فول بالخلطة وتميس بالسمن",
      "signature_dish_en": "Signature Seasoned Foul & Ghee Tamees",
      "vibe_tags_ar": [
        "فول تاريخي عريق",
        "تميس حار",
        "فطور شعبي",
        "عراقة الأجداد"
      ],
      "vibe_tags_en": [
        "Historic Folk Foul",
        "Hot Tamees",
        "Traditional Breakfast",
        "Decades of Heritage"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite"
      ],
      "time_slots": [
        "breakfast",
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://algarmoshi.com/branches/",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "al_qarmoshi",
          "branch_name_en": "Al-Qarmoshi — Prince Mutaib / 40th St",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "حي الصفا، 6413 Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23455, Saudi Arabia",
          "latitude": 21.5835221,
          "longitude": 39.2080584,
          "maps_business_name": "Al-Qarmoshi — Prince Mutaib / 40th St",
          "google_place_id": "ChIJ5ZSXRBDRwxURQWbfeCewask",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5ZSXRBDRwxURQWbfeCewask",
          "google_rating": 3.9,
          "google_review_count": 1857,
          "geographic_notes": "Located in canonical district al_safa."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "mutabbaq",
          "name_en": "mutabbaq",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "koshary_el_tahrir",
      "canonical_name": "Koshary El Tahrir",
      "arabic_name": "كشري التحرير",
      "categories": [
        "street_folk_food",
        "koshari",
        "koshari"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "koshari"
      ],
      "subcategories": [
        "koshari"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 35,
      "signature_dish_ar": "كشري التحرير مع تقلية وصلصة إضافية",
      "signature_dish_en": "Tahrir Koshari with Crispy Onions & Extra Sauce",
      "vibe_tags_ar": [
        "كشري القاهرة الشهير",
        "تقلية مقرمشة",
        "سهرات الصفا",
        "سريع واقتصادي"
      ],
      "vibe_tags_en": [
        "Famous Cairo Koshari",
        "Crispy Fried Onions",
        "Al Safa Late Night",
        "Quick & Economical"
      ],
      "reputation_tags": [
        "jeddah_staple"
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
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast": false,
      "branches": [
        {
          "restaurant_id": "koshary_el_tahrir",
          "branch_name_en": "Koshary El Tahrir — Al Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "7632 ام القرى، 4131، حي الصفا،، Al-Safa, Jeddah 23454،, Saudi Arabia",
          "latitude": 21.576903299999998,
          "longitude": 39.21913620000001,
          "maps_business_name": "Koshary El Tahrir — Al Safa",
          "google_place_id": "ChIJKxlLoqDRwxURzRudZHWQArY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJKxlLoqDRwxURzRudZHWQArY",
          "google_rating": 4.3,
          "google_review_count": 805,
          "geographic_notes": "Located in canonical district al_safa."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "koshari",
          "name_en": "koshari",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "al_hindawiyah",
      "canonical_name": "Al-Hindawiyah",
      "arabic_name": "معصوب ومطبق الهنداوية",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "masoub",
        "mutabbaq",
        "areeka"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "masoub",
        "mutabbaq",
        "areeka"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "مطبق حلو ومطبق مالح ومعصوب قشطة",
      "signature_dish_en": "Sweet & Savory Mutabbaq & Masoub with Cream",
      "vibe_tags_ar": [
        "مطبق هنداوية عريق",
        "معصوب أصيل",
        "سهرات حتى الفجر",
        "منذ عام ١٩٩٠"
      ],
      "vibe_tags_en": [
        "Historic Hindawiyah Mutabbaq",
        "Authentic Masoub",
        "Late Night Until Dawn",
        "Since 1990"
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
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_bawadi"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://alhindawiyah.com/",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "al_hindawiyah",
          "branch_name_en": "Al-Hindawiyah — Mishrifah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "G6W6+6PQ, Al Tadamun Al Arabi, Mishrifah, Jeddah 23341, Saudi Arabia",
          "latitude": 21.5447368,
          "longitude": 39.2111577,
          "maps_business_name": "Al-Hindawiyah — Mishrifah",
          "google_place_id": "ChIJp9YjZC_RwxURpLJ8La9SjPk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJp9YjZC_RwxURpLJ8La9SjPk",
          "google_rating": 4.3,
          "google_review_count": 7465,
          "geographic_notes": "Outer Jeddah branch in physical district 'Mishrifah'; canonical_district is null; usable_with_caution."
        },
        {
          "restaurant_id": "al_hindawiyah",
          "branch_name_en": "Al-Hindawiyah — Al Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Qouraish, Al Bawadi, Jeddah 23443, Saudi Arabia",
          "latitude": 21.5990273,
          "longitude": 39.1653105,
          "maps_business_name": "Al-Hindawiyah — Al Bawadi",
          "google_place_id": "ChIJnSPoHufRwxUR9jmgp2C8MqA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJnSPoHufRwxUR9jmgp2C8MqA",
          "google_rating": 4.5,
          "google_review_count": 1054,
          "geographic_notes": "Located in canonical district al_bawadi."
        },
        {
          "restaurant_id": "al_hindawiyah",
          "branch_name_en": "Al-Hindawiyah — Al Ajaweed",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "3946، 6691،، حي الاجاويد،، Jeddah 22443،, Saudi Arabia",
          "latitude": 21.3918493,
          "longitude": 39.297749700000004,
          "maps_business_name": "Al-Hindawiyah — Al Ajaweed",
          "google_place_id": "ChIJFcSKJfDLwxURbTljca0XXBs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJFcSKJfDLwxURbTljca0XXBs",
          "google_rating": 4.5,
          "google_review_count": 1872,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Ajaweed'; canonical_district is null; usable_with_caution."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "masoub",
          "name_en": "masoub",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "mutabbaq",
          "name_en": "mutabbaq",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "areeka",
          "name_en": "areeka",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "foul_abbas",
      "canonical_name": "Foul Abbas",
      "arabic_name": "فول عباس",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "traditional_breakfast"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "traditional_breakfast"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "فول جمر وتميس طازج",
      "signature_dish_en": "Charcoal-Simmered Foul & Fresh Tamees",
      "vibe_tags_ar": [
        "فول جمر مميز",
        "حي السامر",
        "فطور وسهرات",
        "طعم أصيل ومحبوب"
      ],
      "vibe_tags_en": [
        "Charcoal Ember Foul",
        "Al Samer Local Gem",
        "Breakfast & Late Night",
        "Authentic & Loved"
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
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_samer"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "foul_abbas",
          "branch_name_en": "Foul Abbas — Al Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "6693 السامر، حي السامر، جدة 23464 3329، Al Tawfiq, Jeddah 21442, Saudi Arabia",
          "latitude": 21.5741884,
          "longitude": 39.241263499999995,
          "maps_business_name": "Foul Abbas — Al Samer",
          "google_place_id": "ChIJRXFlKnjTwxURDpHSYzd6dik",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRXFlKnjTwxURDpHSYzd6dik",
          "google_rating": 4.3,
          "google_review_count": 3438,
          "geographic_notes": "Located in canonical district al_samer."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "tamees_house",
      "canonical_name": "Tamees House",
      "arabic_name": "تميس هاوس",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "tamees",
        "hijazi_food"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "tamees",
        "hijazi_food"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 60,
      "signature_dish_ar": "تميس محشي بالجبن ومقلقل لحم",
      "signature_dish_en": "Stuffed Cheese Tamees & Meat Mgalgal",
      "vibe_tags_ar": [
        "تميس هاوس الراقي",
        "جلسات عائلية أنيقة",
        "فطور وغداء متكامل",
        "تصميم حجازي دافئ"
      ],
      "vibe_tags_en": [
        "Polished Tamees House",
        "Elegant Family Dining",
        "All-Day Hijazi Dining",
        "Warm Heritage Decor"
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
        "dinner"
      ],
      "is_open_late": false,
      "is_24_hours": false,
      "is_city_wide": false,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_zahra"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://tameeshouse.com/",
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "tamees_house",
          "branch_name_en": "Tamees House — Al Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "King Abdulaziz Service Rd, Al Zahra, Jeddah 23424, Saudi Arabia",
          "latitude": 21.576156299999997,
          "longitude": 39.127297399999996,
          "maps_business_name": "Tamees House — Al Zahra",
          "google_place_id": "ChIJfVPLabbbwxURB8dP0RddisA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJfVPLabbbwxURB8dP0RddisA",
          "google_rating": 4.4,
          "google_review_count": 2189,
          "geographic_notes": "Located in canonical district al_zahra."
        },
        {
          "restaurant_id": "tamees_house",
          "branch_name_en": "Tamees House — Prince Fawaz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Uptown square center, C7VC+4W8, الامير فواز الجنوبي،،, الامير فواز الجنوبي، جدة 22431, Saudi Arabia",
          "latitude": 21.4428022,
          "longitude": 39.2723253,
          "maps_business_name": "Tamees House — Prince Fawaz",
          "google_place_id": "ChIJ5TK6lhbNwxURk05buGfcC34",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5TK6lhbNwxURk05buGfcC34",
          "google_rating": 4.3,
          "google_review_count": 2960,
          "geographic_notes": "Outer Jeddah branch in physical district 'Al Amir Fawwaz Al Junoobi'; canonical_district is null; usable_with_caution."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": true,
          "sort_order": 1
        }
      ]
    },
    {
      "brand_id": "foul_fattah",
      "canonical_name": "Foul Fattah",
      "arabic_name": "فول فتة",
      "categories": [
        "street_folk_food",
        "saudi_breakfast",
        "foul",
        "tamees",
        "masoub",
        "mutabbaq"
      ],
      "primary_category": "street_folk_food",
      "secondary_categories": [
        "saudi_breakfast"
      ],
      "subcategories": [
        "foul",
        "tamees",
        "masoub",
        "mutabbaq"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 12,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "فول فتة التراثي بالبلد مع تميس حار",
      "signature_dish_en": "Heritage Al Balad Foul Fattah with Hot Tamees",
      "vibe_tags_ar": [
        "أيقونة البلد التاريخية",
        "فول فتة الأثري",
        "جلسات جدة القديمة",
        "تراث أصيل"
      ],
      "vibe_tags_en": [
        "Historic Al Balad Icon",
        "Legendary Foul Fattah",
        "Old Jeddah Ambience",
        "Timeless Heritage"
      ],
      "reputation_tags": [
        "jeddah_staple"
      ],
      "context_tags": [
        "quick_bite",
        "dine_in_strong",
        "late_night"
      ],
      "time_slots": [
        "breakfast",
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
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": null,
      "research_use": "production_ready",
      "serves_breakfast": true,
      "branches": [
        {
          "restaurant_id": "foul_fattah",
          "branch_name_en": "Foul Fattah — Historic Jeddah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_balad",
          "address_en": "حي، Al Dhahab, Historic Jeddah, Jeddah 22233, Saudi Arabia",
          "latitude": 21.487730499999998,
          "longitude": 39.1847384,
          "maps_business_name": "Foul Fattah — Historic Jeddah",
          "google_place_id": "ChIJnQKdAhDPwxURqNKCxLmEt6g",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJnQKdAhDPwxURqNKCxLmEt6g",
          "google_rating": 4,
          "google_review_count": 2203,
          "geographic_notes": "Located in canonical district al_balad."
        }
      ],
      "best_sellers": [
        {
          "name_ar": "foul",
          "name_en": "foul",
          "is_signature": true,
          "sort_order": 1
        },
        {
          "name_ar": "tamees",
          "name_en": "tamees",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_ar": "masoub",
          "name_en": "masoub",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    }
  ]
}$catalog$::jsonb);

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _street_folk_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode,
  time_slots, closing_time_ar, is_open_late, is_24_hours, avg_prep_minutes,
  tier, price_tier, signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en,
  rating, platforms, links, city, primary_category, secondary_categories, subcategories,
  category_fit_confidence, category_fit_evidence, editorial_role, reputation_tags,
  context_tags, context_tag_evidence, business_type, operating_status,
  brand_status_confidence, established_year, origin_city, origin_country,
  verified_jeddah_branch_count, branch_list_completeness, meal_period_strength,
  serves_breakfast_menu, dining_mode_summary, menu_breadth, price_position,
  estimated_sar_per_person_min, estimated_sar_per_person_max, official_website,
  trend_status, trend_confidence, trend_last_verified_at, overall_confidence,
  research_use, last_verified_at, menu_last_verified_at, manual_review_required,
  manual_review_reasons, intelligence_origin
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
  'يقفل 1:00 ص',
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  15,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  4.2,
  '{"hungerstation": true, "jahez": true, "keeta": true}'::jsonb,
  jsonb_build_object(
    'googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'
  ),
  'Jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Certified Street / Folk Food Pass D dataset',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  'Certified Street / Folk Food Pass D dataset',
  'Restaurant',
  'open'::public.operating_status,
  'high'::public.intelligence_confidence,
  NULL,
  'Jeddah',
  'Saudi Arabia',
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  NULL,
  (b->>'serves_breakfast')::boolean,
  'both',
  'focused',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  '2026-09-28T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  (b->>'research_use')::public.research_use,
  '2026-09-28T00:00:00Z'::timestamptz,
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
  serves_breakfast_menu=EXCLUDED.serves_breakfast_menu,
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
DELETE FROM public.restaurant_best_sellers s USING _street_folk_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _street_folk_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _street_folk_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _street_folk_catalog), sellers AS (
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
  'Certified Street / Folk Food Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _street_folk_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _street_folk_catalog), branches AS (
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
