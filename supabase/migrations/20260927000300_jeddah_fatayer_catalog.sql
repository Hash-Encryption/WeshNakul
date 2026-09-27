-- Google-verified Jeddah Fatayer production catalog.
-- Source: docs/research/jeddah-fatayer-pass-d-corrected.json
-- 15 approved brands, 48 verified physical branches (37 canonical, 11 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, hours, and ratings directly from Google Places / Maps.
-- Preserves existing Broast, Burger, Shawarma, Saudi Rice, Pizza, and Grills catalogs completely unchanged.
-- Apply after 20260927000200_jeddah_grills_catalog.sql.
BEGIN;

CREATE TEMP TABLE _fatayer_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _fatayer_catalog(payload) VALUES ($catalog${
  "catalog_metadata": {
    "title": "WeshNakul Jeddah Fatayer Production Catalog",
    "version": "Pass D Certified Corrected",
    "date": "2026-09-27",
    "brand_count": 15,
    "branch_count": 48,
    "canonical_branch_count": 37,
    "outer_caution_branch_count": 11
  },
  "brands": [
    {
      "brand_id": "shobak",
      "canonical_name": "Shobak",
      "arabic_name": "شوبك",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "فطائر ومناقيش عصرية",
        "خيارات فطور مميزة",
        "توصيل سريع وسفري",
        "جلسات عائلية مريحة"
      ],
      "vibe_tags_en": [
        "Modern Fatayer & Manakish",
        "Signature Breakfast",
        "Fast Delivery & Takeaway",
        "Comfortable Casual Dining"
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
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 7,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_faiha",
        "al_faisaliyyah",
        "al_hamdaniyah",
        "al_marwah",
        "al_rawdah",
        "al_shati"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://linktr.ee/shobak.ksa",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "شوبك، 8912 حمد الجاسر، الروضة، جدة 23435",
          "latitude": 21.574923899999998,
          "longitude": 39.1573981,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJozyGDXfQwxURNxn9ozPFOGU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJozyGDXfQwxURNxn9ozPFOGU",
          "google_rating": 4.2,
          "google_review_count": 3336,
          "operating_status": "open",
          "hours": "Sun-Wed 05:30-01:00; Thu-Sat 05:30-02:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Hera",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "شوبك، 3894 شارع حراء، المروة، جدة 23544",
          "latitude": 21.622619099999998,
          "longitude": 39.2002203,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJcQUnQdfWwxURPRs2p9KTIrQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJcQUnQdfWwxURPRs2p9KTIrQ",
          "google_rating": 4.2,
          "google_review_count": 3129,
          "operating_status": "open",
          "hours": "Sun-Wed 05:30-01:00; Thu-Sat 05:30-02:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Obhor",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "شوبك، شارع عابر القرات، أبحر الشمالية، جدة 23815",
          "latitude": 21.762026799999997,
          "longitude": 39.1154619,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJNwDJJQdjwRURBcF9x1wloxA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJNwDJJQdjwRURBcF9x1wloxA",
          "google_rating": 4.4,
          "google_review_count": 2127,
          "operating_status": "open",
          "hours": "Sun-Wed 05:30-01:00; Thu-Sat 05:30-02:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Hamdaniya",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "شــوبك، 2974 حي، الحمدانية، جدة 23761",
          "latitude": 21.754735699999998,
          "longitude": 39.186479899999995,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJHV8Li_J8wRURZMEMh56TV8s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJHV8Li_J8wRURZMEMh56TV8s",
          "google_rating": 3.9,
          "google_review_count": 1517,
          "operating_status": "open",
          "hours": "Daily 05:30-01:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Red Sea Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_shati",
          "address_en": "شوبك shobakpie، 7394 طريق الملك عبدالعزيز الفرعي، الشاطئ، Red Sea Mall، جدة",
          "latitude": 21.6283258,
          "longitude": 39.1113335,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJd6zW_cPbwxURf82wh1gUmT0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJd6zW_cPbwxURf82wh1gUmT0",
          "google_rating": 4.2,
          "google_review_count": 489,
          "operating_status": "open",
          "hours": "Daily 10:00-00:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Aziz Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_faisaliyyah",
          "address_en": "شوبك، عزيز مول، الأمير ماجد، الفيصلية، جدة 23447",
          "latitude": 21.5762222,
          "longitude": 39.197285099999995,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJOz09HwDRwxURKM6BX3QvDoc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJOz09HwDRwxURKM6BX3QvDoc",
          "google_rating": 4.1,
          "google_review_count": 1020,
          "operating_status": "open",
          "hours": "Daily 14:30-03:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "shobak",
          "branch_name_en": "Shobak Andalus Mall",
          "branch_name_ar": null,
          "branch_type": "mall_foodcourt",
          "district": "al_faiha",
          "address_en": "شوبك، الأندلس مول، الأمير ماجد، الفيحاء، جدة 22245",
          "latitude": 21.5069649,
          "longitude": 39.2179703,
          "maps_business_name": "Shobak",
          "google_place_id": "ChIJsa4bomzOwxUReIRKkT6n3ug",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJsa4bomzOwxUReIRKkT6n3ug",
          "google_rating": 4.2,
          "google_review_count": 1721,
          "operating_status": "open",
          "hours": "Sun-Thu/Sat 08:00-01:00; Fri 13:00-01:00",
          "phone": "800 244 4005",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "savory pies",
          "name_ar": "savory pies",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese pies",
          "name_ar": "cheese pies",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "al_hatab",
      "canonical_name": "Al Hatab",
      "arabic_name": "الحطب",
      "categories": [
        "fatayer",
        "bakery",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "bakery",
        "manakish"
      ],
      "subcategories": [
        "bakery",
        "manakish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "أفران ومخبوزات الحطب",
        "مناقيش وفطائر طازجة",
        "توصيل وسفري سريع",
        "فطور يومي"
      ],
      "vibe_tags_en": [
        "Fresh Wood-Fired Bakery",
        "Hot Manakish & Pies",
        "Fast Takeaway & Delivery",
        "Daily Breakfast"
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
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 10,
      "canonical_districts": [
        "abhur_al_shamaliyah",
        "al_bawadi",
        "al_faiha",
        "al_hamdaniyah",
        "al_mohammadiyyah",
        "al_naeem",
        "al_naseem",
        "al_rawdah",
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://alhatab.com.sa/our-branches",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "Al Hatab، شارع حراء، البوادي، جدة 23531",
          "latitude": 21.613838899999998,
          "longitude": 39.156513,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJiTctdaTRwxURpGkRweXujLg",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJiTctdaTRwxURpGkRweXujLg",
          "google_rating": 4.1,
          "google_review_count": 1739,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "Al Hatab، طريق الملك عبدالله، النسيم، جدة 23233",
          "latitude": 21.511236999999998,
          "longitude": 39.22709,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJN_TndgjPwxURSYCVCoiNptk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJN_TndgjPwxURSYCVCoiNptk",
          "google_rating": 4.1,
          "google_review_count": 1999,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "AlHatab Bakery | أفران الحطب، JDSA7080، 7080 ام القرى، 4237، حي الصفا، جدة 23453",
          "latitude": 21.5718808,
          "longitude": 39.2201111,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJkeylbYbRwxURBacZDW4faFs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJkeylbYbRwxURBacZDW4faFs",
          "google_rating": 4.2,
          "google_review_count": 1840,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Hamdaniyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_hamdaniyah",
          "address_en": "Al Hatab، 2976 أبي فراس الحمداني، حي الحمدانية، 6645، جدة 23761",
          "latitude": 21.7540321,
          "longitude": 39.1868358,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJ5zVBFXx9wRURMhNjfOnYyE0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ5zVBFXx9wRURMhNjfOnYyE0",
          "google_rating": 4.3,
          "google_review_count": 1160,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_hamdaniyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Naeem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naeem",
          "address_en": "Al Hatab، النعيم، جدة 23526",
          "latitude": 21.6136479,
          "longitude": 39.1405469,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJJZmPlY_bwxURzxVGm7MLvxs",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJJZmPlY_bwxURzxVGm7MLvxs",
          "google_rating": 4.3,
          "google_review_count": 1036,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_naeem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "Al Hatab، الروضة، جدة 23433",
          "latitude": 21.5648962,
          "longitude": 39.143073099999995,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJ10vH-_vbwxURQ_NhwHi2gH8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ10vH-_vbwxURQ_NhwHi2gH8",
          "google_rating": 4.3,
          "google_review_count": 930,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "97XM+HQC افران الحطب، السنابل، جدة 22444",
          "latitude": 21.398937999999998,
          "longitude": 39.2843884,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJwy9rtwLLwxURtsh-m7pwKno",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJwy9rtwLLwxURtsh-m7pwKno",
          "google_rating": 4.1,
          "google_review_count": 582,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_sanabel'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab North Obhur",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "abhur_al_shamaliyah",
          "address_en": "أفران الحطب، 8655 شارع عابر القرات، أبحر الشمالية, 4002، جدة 23817",
          "latitude": 21.7619531,
          "longitude": 39.116515199999995,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJA7TnNpNjwRURISn7Pp9d9iU",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJA7TnNpNjwRURISn7Pp9d9iU",
          "google_rating": 4.2,
          "google_review_count": 550,
          "operating_status": "open",
          "hours": "Sun-Wed/Sat 06:00-00:00; Thu-Fri 06:00-01:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district abhur_al_shamaliyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab TO GO Fayha",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_faiha",
          "address_en": "G658+98R Al Hatab TO GO, الفيحاء، جدة 22245",
          "latitude": 21.5084375,
          "longitude": 39.2158125,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJPapSg3bPwxURY6ikHQWkO8k",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJPapSg3bPwxURY6ikHQWkO8k",
          "google_rating": 4.5,
          "google_review_count": 10,
          "operating_status": "open",
          "hours": "Daily 06:00-00:00",
          "phone": "9200 02281",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "al_hatab",
          "branch_name_en": "Al Hatab TO GO Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "takeaway_only",
          "district": "al_mohammadiyyah",
          "address_en": "M47C+9J6 AlHatab Bakery, المحمدية، Dr.Sulaiman Al-Habib Jeddah Almuhamdiah, جدة 23618",
          "latitude": 21.663404399999997,
          "longitude": 39.121514,
          "maps_business_name": "Al Hatab",
          "google_place_id": "ChIJaUOPPADZwxURpJkRpZpj0Yc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJaUOPPADZwxURpJkRpZpj0Yc",
          "google_rating": 3.5,
          "google_review_count": 2,
          "operating_status": "open",
          "hours": "Daily 06:00-00:00",
          "phone": null,
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "savory pies",
          "name_ar": "savory pies",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "baked flatbreads",
          "name_ar": "baked flatbreads",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "manqousheh_hut",
      "canonical_name": "Manqousheh Hut",
      "arabic_name": "منقوشة هت",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "مناقيش على مدار 24 ساعة",
        "سريع واقتصادي",
        "سهرات ووجبات ليلية",
        "زعتر وجبن ولحم"
      ],
      "vibe_tags_en": [
        "24-Hour Manakish",
        "Fast & Affordable",
        "Late Night Bites",
        "Zaatar, Cheese & Meat"
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
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 4,
      "canonical_districts": [
        "al_faisaliyyah",
        "al_marwah",
        "al_naseem"
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
          "restaurant_id": "manqousheh_hut",
          "branch_name_en": "Manqousheh Hut Naseem",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_naseem",
          "address_en": "منقوشة هت، أبو ذر الغفاري (رضي الله عنه)، النسيم، جدة 23234",
          "latitude": 21.5164756,
          "longitude": 39.2395072,
          "maps_business_name": "Manqousheh Hut",
          "google_place_id": "ChIJ979554nNwxUR2Ya-2TwPMzM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ979554nNwxUR2Ya-2TwPMzM",
          "google_rating": 4.7,
          "google_review_count": 1617,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 051 0845",
          "geographic_notes": "Located in canonical district al_naseem.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "manqousheh_hut",
          "branch_name_en": "Manqousheh Hut Faisaliyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faisaliyyah",
          "address_en": "منقوشة هت، سعود الفيصل، الفيصلية، جدة 23442",
          "latitude": 21.5678892,
          "longitude": 39.181221199999996,
          "maps_business_name": "Manqousheh Hut",
          "google_place_id": "ChIJo5ZdlkTQwxURJeMzH-yQRzA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJo5ZdlkTQwxURJeMzH-yQRzA",
          "google_rating": 4.6,
          "google_review_count": 1397,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "050 928 9482",
          "geographic_notes": "Located in canonical district al_faisaliyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "manqousheh_hut",
          "branch_name_en": "Manqousheh Hut Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "منقوشة هت، شارع حراء، المروة، جدة 23544",
          "latitude": 21.622505399999998,
          "longitude": 39.1997439,
          "maps_business_name": "Manqousheh Hut",
          "google_place_id": "ChIJxy3vAPnXwxURX4OEv4TlGfo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJxy3vAPnXwxURX4OEv4TlGfo",
          "google_rating": 4.6,
          "google_review_count": 373,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 054 5728",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "manqousheh_hut",
          "branch_name_en": "Manqousheh Hut Hira/King Abdulaziz",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "منقوشة هت، شارع حراء، طريق الملك عبدالعزيز الفرعي، جدة",
          "latitude": 21.606693999999997,
          "longitude": 39.122082299999995,
          "maps_business_name": "Manqousheh Hut",
          "google_place_id": "ChIJc3_3vA7bwxURTBOVH1-fPCk",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJc3_3vA7bwxURTBOVH1-fPCk",
          "google_rating": 4.6,
          "google_review_count": 324,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 051 1377",
          "geographic_notes": "Outer Jeddah branch in physical district 'an_nahdah' (Hira St & King Abdulaziz Branch Rd); canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "meat manakish",
          "name_ar": "meat manakish",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "umm_al_zulf",
      "canonical_name": "Umm Al Zulf",
      "arabic_name": "أم الزلف",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 30,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "wood-fired manakish",
      "signature_dish_en": "wood-fired manakish",
      "vibe_tags_ar": [
        "مناقيش حطب فاخرة",
        "جلسات فطور رايقة",
        "مخبوزات طازجة على الحطب",
        "أجواء عائلية"
      ],
      "vibe_tags_en": [
        "Artisan Wood-Fired Manakish",
        "Cozy Breakfast Ambience",
        "Fresh Hearth Breads",
        "Family Friendly"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "late_night",
        "dine_in_strong"
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
        "al_mohammadiyyah",
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://linktr.ee/umm_alzulf",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "umm_al_zulf",
          "branch_name_en": "Umm Al Zulf Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "مطعم ام الزلف Umm Alzulf - فرع الروضة، حي الروضة، خالدية 7916، جدة 23433",
          "latitude": 21.5658696,
          "longitude": 39.1571965,
          "maps_business_name": "Umm Al Zulf",
          "google_place_id": "ChIJI_RabDLRwxURL_IIuimTBXc",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJI_RabDLRwxURL_IIuimTBXc",
          "google_rating": 4.6,
          "google_review_count": 4629,
          "operating_status": "open",
          "hours": "Daily 06:00-02:00",
          "phone": "9200 32266",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "umm_al_zulf",
          "branch_name_en": "Umm Al Zulf Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "مطعم ام الزلف Umm Alzulf - فرع الأمير سلطان، طريق الامير سلطان، المحمدية، جدة 23623",
          "latitude": 21.6527113,
          "longitude": 39.1258201,
          "maps_business_name": "Umm Al Zulf",
          "google_place_id": "ChIJlYPwNwDZwxURdalDJLa8apQ",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJlYPwNwDZwxURdalDJLa8apQ",
          "google_rating": 4.6,
          "google_review_count": 787,
          "operating_status": "open",
          "hours": "Daily 06:00-02:00",
          "phone": "9200 32266",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "wood-fired manakish",
          "name_ar": "wood-fired manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "labneh manakish",
          "name_ar": "labneh manakish",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "shaikh_manqoosh",
      "canonical_name": "Shaikh Manqoosh",
      "arabic_name": "شيخ منقوش",
      "categories": [
        "fatayer",
        "manakish",
        "lebanese"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish",
        "lebanese"
      ],
      "subcategories": [
        "manakish",
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 30,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "zaatar manakish",
      "signature_dish_en": "zaatar manakish",
      "vibe_tags_ar": [
        "منقوشة شامية عريقة",
        "شارع صاري الشهير",
        "فطور وسفري مميز",
        "طعم أصيل"
      ],
      "vibe_tags_en": [
        "Heritage Levantine Manakish",
        "Iconic Sari Street Eat",
        "Breakfast & Takeaway",
        "Authentic Taste"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "dine_in_strong"
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
        "al_rawdah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://restaurantguru.com/Shaikh-Manqoosh-Jeddah",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "shaikh_manqoosh",
          "branch_name_en": "Shaikh Manqoosh Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "شيخ منقوش، طريق المدينة المنورة، باتجاه، حيّ الروضة، شارع صاري، جدة",
          "latitude": 21.5786952,
          "longitude": 39.158066,
          "maps_business_name": "Shaikh Manqoosh",
          "google_place_id": "ChIJva3U5XbQwxURHedWXjSbUO8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJva3U5XbQwxURHedWXjSbUO8",
          "google_rating": 4.4,
          "google_review_count": 2467,
          "operating_status": "open",
          "hours": "Daily 07:00-00:00",
          "phone": "012 683 7330",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "meat manakish",
          "name_ar": "meat manakish",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "fatayer_al_tayar",
      "canonical_name": "Fatayer Al Tayar",
      "arabic_name": "فطائر على الطاير",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "فطائر سريعة وخفيفة",
        "سفري وتوصيل قوي",
        "وجبات ليلية وسهرات",
        "أسعار اقتصادية"
      ],
      "vibe_tags_en": [
        "Quick-Bite Savory Pies",
        "Fast Delivery & Takeaway",
        "Late Night Bites",
        "Budget-Friendly"
      ],
      "reputation_tags": [
        "local_favorite"
      ],
      "context_tags": [
        "quick_bite",
        "late_night",
        "delivery_strong"
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
        "al_marwah"
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
          "restaurant_id": "fatayer_al_tayar",
          "branch_name_en": "Fatayer Al Tayar Marwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_marwah",
          "address_en": "فطاير على الطاير | المروة، عبد الرحمن الخزاعي، المروة، جدة 23545",
          "latitude": 21.6152139,
          "longitude": 39.2128391,
          "maps_business_name": "Fatayer Al Tayar",
          "google_place_id": "ChIJRzlI4MvWwxURRHuFghgnK6E",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJRzlI4MvWwxURRHuFghgnK6E",
          "google_rating": 4.2,
          "google_review_count": 1407,
          "operating_status": "open",
          "hours": "Daily 06:00-04:00",
          "phone": "059 112 2140",
          "geographic_notes": "Located in canonical district al_marwah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "savory pies",
          "name_ar": "savory pies",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese pies",
          "name_ar": "cheese pies",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "fatayer_aelaty_al_lubnaniah",
      "canonical_name": "Fatayer Aelaty Al-Lubnaniah",
      "arabic_name": "فطائر عائلتي اللبنانية",
      "categories": [
        "fatayer",
        "manakish",
        "lebanese"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish",
        "lebanese"
      ],
      "subcategories": [
        "manakish",
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "cheese pies",
      "signature_dish_en": "cheese pies",
      "vibe_tags_ar": [
        "فطائر ومناقيش 24 ساعة",
        "بيتزا وفطائر لبنانية",
        "سفري وطلبات سريعة",
        "سهرات الفجر"
      ],
      "vibe_tags_en": [
        "24-Hour Lebanese Pies",
        "Manakish & Mini Pizzas",
        "Fast Takeaway",
        "Late Night & Early Morning"
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
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 2,
      "canonical_districts": [
        "al_safa",
        "al_samer"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://www.waze.com/live-map/directions/sa/makkah-province/jeddah/ftaer-aaelty-allbnanyh-fra-alsfa?to=place.ChIJWWPVvAnRwxURJcsSQT3q384",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "fatayer_aelaty_al_lubnaniah",
          "branch_name_en": "Fatayer Aelaty Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "مطعم فطائرعائلتي للبيتزا والمناقيش اللبنانيه، 7211 طريق الامير متعب بن عبدالعزيز، 3222, حي الصفا، جدة 23453",
          "latitude": 21.573101299999998,
          "longitude": 39.210258599999996,
          "maps_business_name": "Fatayer Aelaty Al-Lubnaniah",
          "google_place_id": "ChIJWWPVvAnRwxURJcsSQT3q384",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJWWPVvAnRwxURJcsSQT3q384",
          "google_rating": 4.1,
          "google_review_count": 1100,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 996 6180",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "fatayer_aelaty_al_lubnaniah",
          "branch_name_en": "Fatayer Aelaty Samer",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_samer",
          "address_en": "فطائر عائلتي اللبنانية، السامر, مدينة، جدة 23464",
          "latitude": 21.5748222,
          "longitude": 39.241118799999995,
          "maps_business_name": "Fatayer Aelaty Al-Lubnaniah",
          "google_place_id": "ChIJucTEptnTwxUR8q53oemVBWo",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJucTEptnTwxUR8q53oemVBWo",
          "google_rating": 4.1,
          "google_review_count": 947,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "050 416 6180",
          "geographic_notes": "Located in canonical district al_samer.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "cheese pies",
          "name_ar": "cheese pies",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "meat manakish",
          "name_ar": "meat manakish",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "pizza fatayer",
          "name_ar": "pizza fatayer",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "kdousha",
      "canonical_name": "Kdousha",
      "arabic_name": "كدوشة",
      "categories": [
        "fatayer",
        "manakish",
        "lebanese"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish",
        "lebanese"
      ],
      "subcategories": [
        "manakish",
        "lebanese"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "كعك ومناقيش لبنانية",
        "كعك بالسمسم وحلومي",
        "فطور لبناني أصيل",
        "سفري وتوصيل"
      ],
      "vibe_tags_en": [
        "Authentic Lebanese Kaak",
        "Sesame Kaak & Halloumi",
        "Classic Lebanese Breakfast",
        "Takeaway & Delivery"
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
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://kadosha.carrd.co/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "kdousha",
          "branch_name_en": "Kdousha Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "كدوشة (الصفا)، ام القرى، الصفا، جدة 23453",
          "latitude": 21.5717779,
          "longitude": 39.2206208,
          "maps_business_name": "Kdousha",
          "google_place_id": "ChIJmWOER3TRwxURL8c0aQH82ok",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJmWOER3TRwxURL8c0aQH82ok",
          "google_rating": 4,
          "google_review_count": 799,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "056 863 7143",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "Lebanese kaak",
          "name_ar": "Lebanese kaak",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "halloumi kaak",
          "name_ar": "halloumi kaak",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "furn_aldayaa",
      "canonical_name": "Furn Aldayaa",
      "arabic_name": "فرن الضيعة",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 30,
      "estimated_spend_max_sar": 65,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "فرن ضيعة على مدار 24 ساعة",
        "مناقيش بلدية أصيلة",
        "سفري وتوصيل سريع",
        "سهرات"
      ],
      "vibe_tags_en": [
        "24-Hour Village Bakery",
        "Authentic Hearth Manakish",
        "Quick Takeaway & Delivery",
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
        "breakfast",
        "lunch",
        "dinner",
        "late_night"
      ],
      "is_open_late": true,
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://linktr.ee/furnaldaya",
      "research_use": "usable_with_caution",
      "branches": [
        {
          "restaurant_id": "furn_aldayaa",
          "branch_name_en": "Furn Aldayaa Al Rabi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "Furn Aldayaa | فرن الضيعة، الربيع، جدة 23462",
          "latitude": 21.5874871,
          "longitude": 39.2360452,
          "maps_business_name": "Furn Aldayaa",
          "google_place_id": "ChIJQd83oxzRwxURoa3HQLN4MXw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJQd83oxzRwxURoa3HQLN4MXw",
          "google_rating": 4.4,
          "google_review_count": 257,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "050 007 4924",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_rabi'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "meat manakish",
          "name_ar": "meat manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "pie_box",
      "canonical_name": "Pie Box",
      "arabic_name": "صندوق الفطيرة",
      "categories": [
        "fatayer",
        "pies"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "pies"
      ],
      "subcategories": [
        "pies"
      ],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "savory pies",
      "signature_dish_en": "savory pies",
      "vibe_tags_ar": [
        "بوكسات فطائر مبتكرة",
        "فطور وجمعات عصرية",
        "فطائر طازجة وسفري",
        "سهرات وجلسات"
      ],
      "vibe_tags_en": [
        "Craft Pie Boxes",
        "Modern Breakfast & Gatherings",
        "Fresh Savory Pies",
        "Casual Hangout & Late Night"
      ],
      "reputation_tags": [
        "rising"
      ],
      "context_tags": [
        "quick_bite",
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_faiha"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://linktr.ee/pieboxsa",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "pie_box",
          "branch_name_en": "Pie Box King Abdullah / Prince Majid",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "صندوق الفطيرة | Pie Box، طريق الملك عبدالله، &، الأمير ماجد، جدة",
          "latitude": 21.4868497,
          "longitude": 39.232679999999995,
          "maps_business_name": "Pie Box",
          "google_place_id": "ChIJV_i3cQDPwxURLLoAk11uU_8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJV_i3cQDPwxURLLoAk11uU_8",
          "google_rating": 4.7,
          "google_review_count": 895,
          "operating_status": "open",
          "hours": "Daily 06:00-02:30",
          "phone": "050 005 2981",
          "geographic_notes": "Located in canonical district al_faiha (King Abdullah Rd & Prince Majid Rd, verified via coordinates and reverse geocoding).",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "savory pies",
          "name_ar": "savory pies",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "baked pies",
          "name_ar": "baked pies",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese pies",
          "name_ar": "cheese pies",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "agha_bakery",
      "canonical_name": "Agha Bakery",
      "arabic_name": "أفران الآغا",
      "categories": [
        "fatayer",
        "manakish",
        "bakery"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish",
        "bakery"
      ],
      "subcategories": [
        "manakish",
        "bakery"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "Lebanese manakish",
      "signature_dish_en": "Lebanese manakish",
      "vibe_tags_ar": [
        "أفران مناقيش لبنانية 24 ساعة",
        "عجين طازج ومقرمش",
        "حي السلامة الأصيل",
        "سفري واقتصادي"
      ],
      "vibe_tags_en": [
        "24-Hour Lebanese Manakish",
        "Fresh Crispy Crust",
        "Al Salamah Local Favorite",
        "Affordable Takeaway"
      ],
      "reputation_tags": [
        "hidden_gem"
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
      "is_24_hours": true,
      "is_city_wide": false,
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 1,
      "canonical_districts": [
        "al_salamah"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://restaurantguru.com/Agha-Bakery-afran-alaagha-mnaqysh-lbnanyh-Jeddah",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "agha_bakery",
          "branch_name_en": "Agha Bakery",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_salamah",
          "address_en": "Agha Bakery / افران الآغا مناقيش لبنانية, Abdul Rahman bin Ahmad as sidayri, Agha Bakery أفران الآغا, جدة 23437",
          "latitude": 21.595235199999998,
          "longitude": 39.1551866,
          "maps_business_name": "Agha Bakery",
          "google_place_id": "ChIJdXTfdcnRwxURVQoRipkBpd0",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJdXTfdcnRwxURVQoRipkBpd0",
          "google_rating": 4.4,
          "google_review_count": 583,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "053 708 8270",
          "geographic_notes": "Located in canonical district al_salamah.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "Lebanese manakish",
          "name_ar": "Lebanese manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "fatayer_al_ameen",
      "canonical_name": "Fatayer Al Ameen",
      "arabic_name": "فطائر الأمين",
      "categories": [
        "fatayer"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [],
      "subcategories": [],
      "editorial_role": "popular",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "savory pies",
      "signature_dish_en": "savory pies",
      "vibe_tags_ar": [
        "فطائر شعبية واقتصادية",
        "فطور وسفري سريع",
        "أجبان وسبانخ ولحوم",
        "أسعار تنافسية"
      ],
      "vibe_tags_en": [
        "Traditional Budget Pies",
        "Quick Takeaway Breakfast",
        "Cheese, Spinach & Meat",
        "Value Eats"
      ],
      "reputation_tags": [
        "local_favorite"
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
      "branch_list_completeness": "partial",
      "verified_jeddah_branch_count": 3,
      "canonical_districts": [
        "al_faiha",
        "ar_rabwah"
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
          "restaurant_id": "fatayer_al_ameen",
          "branch_name_en": "Fatayer Al Ameen Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "فطائر الأمين، 6607 4193 زينب بنت مسلمة، الفيحاء، جدة 22246",
          "latitude": 21.487644799999998,
          "longitude": 39.223683199999996,
          "maps_business_name": "Fatayer Al Ameen",
          "google_place_id": "ChIJAd3e24nOwxURm1WlH1CJt7A",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJAd3e24nOwxURm1WlH1CJt7A",
          "google_rating": 4.4,
          "google_review_count": 835,
          "operating_status": "open",
          "hours": "Daily 06:00-12:00 and 18:00-00:00",
          "phone": "055 364 4369",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "fatayer_al_ameen",
          "branch_name_en": "Fatayer Al Ameen Rabwah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "ar_rabwah",
          "address_en": "فطائر الامين، حي، 5018 7156 أسد ابن الحارثة، الربوة، جدة 23448",
          "latitude": 21.5900993,
          "longitude": 39.189160099999995,
          "maps_business_name": "Fatayer Al Ameen",
          "google_place_id": "ChIJtWFUW-TQwxUREFjtP4AlGTA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJtWFUW-TQwxUREFjtP4AlGTA",
          "google_rating": 4.1,
          "google_review_count": 207,
          "operating_status": "open",
          "hours": "Sun-Thu 06:00-12:00 & 18:00-00:00; Fri 06:00-11:30 & 19:00-23:00; Sat 06:00-12:00 & 18:00-23:00",
          "phone": "054 974 6248",
          "geographic_notes": "Located in canonical district ar_rabwah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "fatayer_al_ameen",
          "branch_name_en": "Fatayer Al Ameen Abrq Al Raghamah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "فطائر الامين، 7721، حي ابرق الرغامة، جدة 22264 4601،",
          "latitude": 21.503463699999998,
          "longitude": 39.2775312,
          "maps_business_name": "Fatayer Al Ameen",
          "google_place_id": "ChIJYSHX623NwxURVHueateKyGA",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJYSHX623NwxURVHueateKyGA",
          "google_rating": 4,
          "google_review_count": 186,
          "operating_status": "open",
          "hours": "Daily 06:00-12:00 and 16:00-00:00",
          "phone": "053 856 4361",
          "geographic_notes": "Outer Jeddah branch in physical district 'abrq_al_raghamah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "savory pies",
          "name_ar": "savory pies",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "cheese pies",
          "name_ar": "cheese pies",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "spinach pies",
          "name_ar": "spinach pies",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "mathaq_al_manousheh",
      "canonical_name": "Mathaq Al Manousheh",
      "arabic_name": "مذاق المنئوشة",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "staple",
      "tier": "staple",
      "price_position": "standard",
      "price_tier": "$$",
      "estimated_spend_min_sar": 25,
      "estimated_spend_max_sar": 55,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "شبكة مناقيش واسعة 24 ساعة",
        "بوكسات ميني للجمعات",
        "توصيل سريع وسفري",
        "سهرات ليلية"
      ],
      "vibe_tags_en": [
        "Extensive 24-Hour Network",
        "Mini Manakish Gathering Boxes",
        "Fast Takeaway & Delivery",
        "Late Night Staples"
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
      "is_24_hours": true,
      "is_city_wide": true,
      "branch_list_completeness": "complete",
      "verified_jeddah_branch_count": 12,
      "canonical_districts": [
        "al_bawadi",
        "al_faiha",
        "al_mohammadiyyah",
        "al_rawdah",
        "al_safa"
      ],
      "delivery_platforms": [
        "hungerstation",
        "jahez",
        "keeta"
      ],
      "official_website": "https://mthaq-almanousheh.yallaqrcodes.com/",
      "research_use": "production_ready",
      "branches": [
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Amir Fawwaz South",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة، سيد الشهداء، الامير فواز الجنوبي، جدة 22431",
          "latitude": 21.435667,
          "longitude": 39.278984,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJCbRwAJXNwxURS1PVLaHF1po",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJCbRwAJXNwxURS1PVLaHF1po",
          "google_rating": 4.2,
          "google_review_count": 1699,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "056 861 5271",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_amir_fawwaz_al_junoobi'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Bawadi",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_bawadi",
          "address_en": "مذاق المنئوشة | حي البوادي شارع قريش، قريش، البوادي، جدة 22351",
          "latitude": 21.5999965,
          "longitude": 39.1674295,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJw_JmJ_3RwxURLhqHaYMtXzM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJw_JmJ_3RwxURLhqHaYMtXzM",
          "google_rating": 4.4,
          "google_review_count": 1038,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "054 535 9861",
          "geographic_notes": "Located in canonical district al_bawadi.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Fayha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_faiha",
          "address_en": "مذاق المنئوشة | الفيحاء، شارع عبدالله سليمان، الفيحاء، جدة 22246",
          "latitude": 21.4896301,
          "longitude": 39.2246313,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJObRbEizPwxUR9fzPA-jpacE",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJObRbEizPwxUR9fzPA-jpacE",
          "google_rating": 4.4,
          "google_review_count": 942,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "056 264 6287",
          "geographic_notes": "Located in canonical district al_faiha.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Mohammadiyyah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_mohammadiyyah",
          "address_en": "مذاق المنئوشة | حي المحمدية طريق الملك، طريق الملك عبدالعزيز الفرعي، المحمدية، جدة 23617",
          "latitude": 21.654498099999998,
          "longitude": 39.1120926,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJXeSoFmbZwxURtqPxPOpq9-s",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJXeSoFmbZwxURtqPxPOpq9-s",
          "google_rating": 4.5,
          "google_review_count": 515,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 751 1827",
          "geographic_notes": "Located in canonical district al_mohammadiyyah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Safa",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_safa",
          "address_en": "مذاق المنئوشة، حي, سعود الفيصل، الصفا، الأمير, جدة",
          "latitude": 21.5739034,
          "longitude": 39.2026144,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJHzzqKAfRwxURXZkH7nhc7f8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJHzzqKAfRwxURXZkH7nhc7f8",
          "google_rating": 4.4,
          "google_review_count": 763,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "056 264 6192",
          "geographic_notes": "Located in canonical district al_safa.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Rawdah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_rawdah",
          "address_en": "مذاق المنئوشة | حي الروضة، حمد الجاسر، الروضة، جدة 23434",
          "latitude": 21.5722354,
          "longitude": 39.159258099999995,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJzbVSWazRwxURUU6dXN5lMZI",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJzbVSWazRwxURUU6dXN5lMZI",
          "google_rating": 4.6,
          "google_review_count": 408,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "054 702 4401",
          "geographic_notes": "Located in canonical district al_rawdah.",
          "production_branch_status": "production_ready"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Taiba",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | حي طيبة، 6561 طريق المدينة المنورة، طيبة، جدة 23832",
          "latitude": 21.795156,
          "longitude": 39.1245668,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJxQSEtTZlwRURUkl_uQ1K3IY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJxQSEtTZlwRURUkl_uQ1K3IY",
          "google_rating": 4.3,
          "google_review_count": 2433,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "053 535 4451",
          "geographic_notes": "Outer Jeddah branch in physical district 'taiba'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Rayaan",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | حي الريان، محطة الدريس، الريان، P623، جدة",
          "latitude": 21.7009515,
          "longitude": 39.2035481,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJE8I6G319wRURbssQ6JXu1V8",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJE8I6G319wRURbssQ6JXu1V8",
          "google_rating": 4.7,
          "google_review_count": 2206,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 078 8401",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_rayaan'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Sanabel",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | حي السنابل، السنابل، جدة 22444",
          "latitude": 21.399939099999997,
          "longitude": 39.281423,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJ6yBhbZ_LwxURLFcGIxWmmhw",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ6yBhbZ_LwxURLFcGIxWmmhw",
          "google_rating": 4.4,
          "google_review_count": 1054,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "050 988 2531",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_sanabel'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Harazat",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | حي الحرازات، شارع الحرازات العام، جدة 22393",
          "latitude": 21.483586799999998,
          "longitude": 39.3695786,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJNTXaciYtwhURG1RA-SMBc04",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJNTXaciYtwhURG1RA-SMBc04",
          "google_rating": 4.6,
          "google_review_count": 674,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "053 534 1995",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_harazat'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Qryniah",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | القرينية، 8736 طريق الليث الفرعي، القرينية، جدة 22624",
          "latitude": 21.3034374,
          "longitude": 39.260876499999995,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJxSuDOIq1wxUR1TxAK47qw0o",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJxSuDOIq1wxUR1TxAK47qw0o",
          "google_rating": 4.3,
          "google_review_count": 887,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 076 7495",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_qryniah'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        },
        {
          "restaurant_id": "mathaq_al_manousheh",
          "branch_name_en": "Mathaq Al Manousheh Waha",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": null,
          "address_en": "مذاق المنئوشة | حي الواحة، الواحة، جدة 23354",
          "latitude": 21.562213099999997,
          "longitude": 39.2439681,
          "maps_business_name": "Mathaq Al Manousheh",
          "google_place_id": "ChIJiUa5iPjTwxURXXK4gKS-SEM",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJiUa5iPjTwxURXXK4gKS-SEM",
          "google_rating": 4.4,
          "google_review_count": 641,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "055 751 7124",
          "geographic_notes": "Outer Jeddah branch in physical district 'al_waha'; canonical_district is null; usable_with_caution.",
          "production_branch_status": "usable_with_caution"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "mini manakish boxes",
          "name_ar": "mini manakish boxes",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    },
    {
      "brand_id": "manqousha_house",
      "canonical_name": "Manqousha House",
      "arabic_name": "منقوشة هاوس",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 15,
      "estimated_spend_max_sar": 30,
      "signature_dish_ar": "manakish",
      "signature_dish_en": "manakish",
      "vibe_tags_ar": [
        "منقوشة حي الشاطئ المفضلة",
        "مخبوزات طازجة وسريعة",
        "فطور خفيف وسفري",
        "أسعار مناسبة"
      ],
      "vibe_tags_en": [
        "Ash Shati Neighborhood Gem",
        "Fresh Baked Manakish",
        "Quick Casual Breakfast",
        "Pocket-Friendly"
      ],
      "reputation_tags": [
        "hidden_gem"
      ],
      "context_tags": [
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
        "al_shati"
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
          "restaurant_id": "manqousha_house",
          "branch_name_en": "Manqousha House Shati",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_shati",
          "address_en": "منقوشة هاوس الشاطئ، أبو العباس بن عبدالمطلب، الشاطئ، جدة 23513",
          "latitude": 21.599291599999997,
          "longitude": 39.1146398,
          "maps_business_name": "Manqousha House",
          "google_place_id": "ChIJZYx-wDXbwxURP4uf1EL4w88",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJZYx-wDXbwxURP4uf1EL4w88",
          "google_rating": 4.6,
          "google_review_count": 560,
          "operating_status": "open",
          "hours": "Daily 07:00-23:30",
          "phone": "012 655 0222",
          "geographic_notes": "Located in canonical district al_shati.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "manakish",
          "name_ar": "manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "cheese manakish",
          "name_ar": "cheese manakish",
          "is_signature": false,
          "sort_order": 2
        }
      ]
    },
    {
      "brand_id": "manakish_countryside",
      "canonical_name": "Manakish Countryside",
      "arabic_name": "مناقيش الريف",
      "categories": [
        "fatayer",
        "manakish"
      ],
      "primary_category": "fatayer",
      "secondary_categories": [
        "manakish"
      ],
      "subcategories": [
        "manakish"
      ],
      "editorial_role": "discovery",
      "tier": "trend",
      "price_position": "budget",
      "price_tier": "$",
      "estimated_spend_min_sar": 20,
      "estimated_spend_max_sar": 40,
      "signature_dish_ar": "akkawi manakish",
      "signature_dish_en": "akkawi manakish",
      "vibe_tags_ar": [
        "مناقيش ريفية 24 ساعة",
        "عكاوي وزعتر بلدي",
        "حي الزهراء الهادئ",
        "سفري وسهرات"
      ],
      "vibe_tags_en": [
        "24-Hour Countryside Manakish",
        "Authentic Akkawi & Zaatar",
        "Al Zahra Local Spot",
        "Takeaway & Late Night"
      ],
      "reputation_tags": [
        "hidden_gem"
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
      "is_24_hours": true,
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
          "restaurant_id": "manakish_countryside",
          "branch_name_en": "Manakish Countryside Zahra",
          "branch_name_ar": null,
          "branch_type": "full_dine_in",
          "district": "al_zahra",
          "address_en": "مناقيش الريف، حلمي كتبي، الزهراء، جدة 23425",
          "latitude": 21.5914198,
          "longitude": 39.1366985,
          "maps_business_name": "Manakish Countryside",
          "google_place_id": "ChIJYWLze4rawxURdUM0J9PxUgY",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJYWLze4rawxURdUM0J9PxUgY",
          "google_rating": 4.1,
          "google_review_count": 352,
          "operating_status": "open",
          "hours": "Open 24 hours",
          "phone": "054 401 5121",
          "geographic_notes": "Located in canonical district al_zahra.",
          "production_branch_status": "production_ready"
        }
      ],
      "best_sellers": [
        {
          "name_en": "akkawi manakish",
          "name_ar": "akkawi manakish",
          "is_signature": true,
          "sort_order": 0
        },
        {
          "name_en": "zaatar manakish",
          "name_ar": "zaatar manakish",
          "is_signature": false,
          "sort_order": 1
        },
        {
          "name_en": "meat manakish",
          "name_ar": "meat manakish",
          "is_signature": false,
          "sort_order": 2
        },
        {
          "name_en": "spinach pies",
          "name_ar": "spinach pies",
          "is_signature": false,
          "sort_order": 3
        }
      ]
    }
  ]
}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _fatayer_catalog;
  
  -- Verify brand count is exactly 15
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 15 THEN
    RAISE EXCEPTION 'Fatayer catalog must contain exactly 15 brands';
  END IF;

  -- Verify branch count is exactly 48
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Fatayer catalog must contain exactly 48 branches';
  END IF;

  -- Verify canonical branch count is 37
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 37 THEN
    RAISE EXCEPTION 'Fatayer catalog must contain exactly 37 canonical branches';
  END IF;

  -- Verify outer caution branch count is 11
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 11 THEN
    RAISE EXCEPTION 'Fatayer catalog must contain exactly 11 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Fatayer catalog contains an unknown canonical district'; END IF;

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
WITH catalog AS (SELECT payload FROM _fatayer_catalog), brands AS (
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
  true,
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

-- 2. Cleanup stale best sellers and sources for these 15 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _fatayer_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _fatayer_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _fatayer_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _fatayer_catalog), sellers AS (
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
  'Certified Fatayer Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _fatayer_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _fatayer_catalog), branches AS (
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
